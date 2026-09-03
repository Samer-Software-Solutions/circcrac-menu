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
  "Your settings were saved, but an unreferenced logo could not be removed. Please contact support if the issue continues.";

function uploadedFile(formData: FormData): File | null {
  const value = formData.get("logo");
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

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
): Promise<{ error?: string; path?: string }> {
  const path = `settings/${crypto.randomUUID()}.${imageExtension(file.type)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload a CMS restaurant logo.", error);
    return { error: "We couldn’t upload that logo. Please try again." };
  }
  return { path };
}

async function removeNewUploadAfterFailure(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Failed to remove a newly uploaded logo after a database error.", error);
    return false;
  }
  return true;
}

/** Item and settings paths share a bucket, so retain legacy shared objects. */
async function removeImageIfUnreferenced(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<boolean> {
  const [itemsResult, settingsResult] = await Promise.all([
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("image_path", path),
    supabase
      .from("settings")
      .select("id", { count: "exact", head: true })
      .eq("logo_path", path),
  ]);

  if (itemsResult.error || settingsResult.error) {
    console.error(
      "Failed to verify whether an old restaurant logo is still referenced.",
      itemsResult.error ?? settingsResult.error,
    );
    return false;
  }
  if ((itemsResult.count ?? 0) > 0 || (settingsResult.count ?? 0) > 0) {
    return true;
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Failed to remove an unreferenced CMS restaurant logo.", error);
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
    removeLogo: formData.get("removeLogo"),
    restaurantNameAr: formData.get("restaurantNameAr"),
    restaurantNameEn: formData.get("restaurantNameEn"),
  });
  if (!parsedValues.success) {
    return { fieldErrors: parsedValues.error.flatten().fieldErrors };
  }

  const logo = uploadedFile(formData);
  const logoError = validateMenuImage(logo);
  if (logoError) {
    return { formError: logoError };
  }

  const supabase = await createClient();
  const { data: existingSettings, error: readError } = await supabase
    .from("settings")
    .select("id, logo_path")
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

  const upload = logo ? await uploadLogo(supabase, logo) : null;
  if (upload?.error || (logo && !upload?.path)) {
    return { formError: upload?.error ?? mutationFailureMessage };
  }

  const nextLogoPath =
    upload?.path ??
    (parsedValues.data.removeLogo ? null : existingSettings.logo_path);
  const { data: savedSettings, error: updateError } = await supabase
    .from("settings")
    .update({
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
    const cleanedUp = upload?.path
      ? await removeNewUploadAfterFailure(supabase, upload.path)
      : true;
    if (updateError) {
      console.error("Failed to update CMS restaurant settings.", updateError);
    }
    return {
      formError: cleanedUp
        ? updateError
          ? mutationFailureMessage
          : "Restaurant settings changed while you were editing. Refresh and try again."
        : "We couldn’t save those settings, and the newly uploaded logo could not be removed. Please contact support.",
    };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  const oldLogoPath = existingSettings.logo_path;
  const cleanupSucceeded =
    oldLogoPath && oldLogoPath !== nextLogoPath
      ? await removeImageIfUnreferenced(supabase, oldLogoPath)
      : true;

  return {
    status: "success",
    successMessage: "Restaurant settings saved.",
    warning: cleanupSucceeded ? undefined : cleanupFailureMessage,
  };
}
