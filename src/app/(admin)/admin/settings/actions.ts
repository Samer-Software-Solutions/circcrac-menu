"use server";

import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { PUBLIC_MENU_CACHE_TAG } from "@/lib/data/public-menu";
import { createClient } from "@/lib/supabase/server";
import {
  settingsFormDataSchema,
} from "@/lib/validation/settings";
import { validateMenuImage } from "@/lib/validation/menu-items";

export type SettingsActionState = {
  fieldErrors?: {
    currency?: string[];
    defaultLanguage?: string[];
    primaryColor?: string[];
    restaurantNameAr?: string[];
    restaurantNameEn?: string[];
  };
  formError?: string;
  status?: "success";
  successMessage?: string;
  warning?: string;
};

const bucket = "menu-images";
const mutationFailureMessage = "We couldn’t save those settings. Please try again.";
const cleanupFailureMessage =
  "Your settings were saved, but an unreferenced image could not be removed. Please contact support if the issue continues.";

function uploadedFile(formData: FormData, field: "logo" | "banner"): File | null {
  const value = formData.get(field);
  return value instanceof File && value.name !== "" ? value : null;
}

function imageExtension(mimeType: string): "jpg" | "png" | "webp" | "avif" {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
): Promise<{ error?: string; path?: string }> {
  const path = `settings/${crypto.randomUUID()}.${imageExtension(file.type)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload a CMS settings image.", error);
    return { error: "We couldn’t upload that image. Please try again." };
  }
  return { path };
}

async function removeNewUploadsAfterFailure(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: string[],
): Promise<boolean> {
  if (paths.length === 0) {
    return true;
  }
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error("Failed to remove newly uploaded images after a database error.", error);
    return false;
  }
  return true;
}

/** Item and settings paths share a bucket, so retain legacy shared objects. */
async function removeImageIfUnreferenced(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<boolean> {
  const [itemsResult, logoResult, bannerResult] = await Promise.all([
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("image_path", path),
    supabase
      .from("settings")
      .select("id", { count: "exact", head: true })
      .eq("logo_path", path),
    supabase
      .from("settings")
      .select("id", { count: "exact", head: true })
      .eq("banner_path", path),
  ]);

  if (itemsResult.error || logoResult.error || bannerResult.error) {
    console.error(
      "Failed to verify whether an old CMS settings image is still referenced.",
      itemsResult.error ?? logoResult.error ?? bannerResult.error,
    );
    return false;
  }
  if (
    (itemsResult.count ?? 0) > 0 ||
    (logoResult.count ?? 0) > 0 ||
    (bannerResult.count ?? 0) > 0
  ) {
    return true;
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Failed to remove an unreferenced CMS settings image.", error);
    return false;
  }
  return true;
}

/** Updates the existing singleton only; this action never creates settings. */
export async function saveSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();

  const parsedValues = settingsFormDataSchema.safeParse({
    currency: formData.get("currency"),
    defaultLanguage: formData.get("defaultLanguage"),
    primaryColor: formData.get("primaryColor"),
    removeBanner: formData.get("removeBanner"),
    removeLogo: formData.get("removeLogo"),
    restaurantNameAr: formData.get("restaurantNameAr"),
    restaurantNameEn: formData.get("restaurantNameEn"),
  });
  if (!parsedValues.success) {
    return { fieldErrors: parsedValues.error.flatten().fieldErrors };
  }

  const logo = uploadedFile(formData, "logo");
  const logoError = validateMenuImage(logo);
  if (logoError) {
    return { formError: logoError };
  }
  const banner = uploadedFile(formData, "banner");
  const bannerError = validateMenuImage(banner);
  if (bannerError) {
    return { formError: bannerError };
  }

  const supabase = await createClient();
  const { data: existingSettings, error: readError } = await supabase
    .from("settings")
    .select("id, banner_path, logo_path")
    .limit(1)
    .maybeSingle();
  if (readError) {
    console.error("Failed to read CMS restaurant settings before updating.", readError);
    return { formError: mutationFailureMessage };
  }
  if (!existingSettings) {
    return {
      formError:
        "Restaurant settings are missing. Please contact support before trying again.",
    };
  }

  const logoUpload = logo ? await uploadImage(supabase, logo) : null;
  if (logoUpload?.error || (logo && !logoUpload?.path)) {
    return { formError: logoUpload?.error ?? mutationFailureMessage };
  }
  const bannerUpload = banner ? await uploadImage(supabase, banner) : null;
  if (bannerUpload?.error || (banner && !bannerUpload?.path)) {
    await removeNewUploadsAfterFailure(
      supabase,
      logoUpload?.path ? [logoUpload.path] : [],
    );
    return { formError: bannerUpload?.error ?? mutationFailureMessage };
  }

  const newUploadPaths = [logoUpload?.path, bannerUpload?.path].filter(
    (path): path is string => Boolean(path),
  );
  const nextLogoPath =
    logoUpload?.path ??
    (parsedValues.data.removeLogo ? null : existingSettings.logo_path);
  const nextBannerPath =
    bannerUpload?.path ??
    (parsedValues.data.removeBanner ? null : existingSettings.banner_path);
  const { data: savedSettings, error: updateError } = await supabase
    .from("settings")
    .update({
      banner_path: nextBannerPath,
      currency: parsedValues.data.currency,
      default_language: parsedValues.data.defaultLanguage,
      logo_path: nextLogoPath,
      primary_color: parsedValues.data.primaryColor,
      restaurant_name_ar: parsedValues.data.restaurantNameAr,
      restaurant_name_en: parsedValues.data.restaurantNameEn,
    })
    .eq("id", existingSettings.id)
    .select("id")
    .maybeSingle();

  if (updateError || !savedSettings) {
    const cleanedUp = await removeNewUploadsAfterFailure(supabase, newUploadPaths);
    if (updateError) {
      console.error("Failed to update CMS restaurant settings.", updateError);
    }
    return {
      formError: cleanedUp
        ? updateError
          ? mutationFailureMessage
          : "Restaurant settings changed while you were editing. Refresh and try again."
        : "We couldn’t save those settings, and a newly uploaded image could not be removed. Please contact support.",
    };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  const oldLogoPath = existingSettings.logo_path;
  const oldBannerPath = existingSettings.banner_path;
  const [logoCleanupSucceeded, bannerCleanupSucceeded] = await Promise.all([
    oldLogoPath && oldLogoPath !== nextLogoPath
      ? removeImageIfUnreferenced(supabase, oldLogoPath)
      : Promise.resolve(true),
    oldBannerPath && oldBannerPath !== nextBannerPath
      ? removeImageIfUnreferenced(supabase, oldBannerPath)
      : Promise.resolve(true),
  ]);

  return {
    status: "success",
    successMessage: "Restaurant settings saved.",
    warning:
      logoCleanupSucceeded && bannerCleanupSucceeded
        ? undefined
        : cleanupFailureMessage,
  };
}
