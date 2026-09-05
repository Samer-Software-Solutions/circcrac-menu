"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { qrCodeFormDataSchema } from "@/lib/validation/qr-code";
import { validateMenuImage } from "@/lib/validation/menu-items";

export type QrCodeActionState = {
  fieldErrors?: {
    backgroundColor?: string[];
    cornerDotType?: string[];
    cornerSquareType?: string[];
    dotColor?: string[];
    dotType?: string[];
    logoSize?: string[];
  };
  formError?: string;
  status?: "success";
  successMessage?: string;
  warning?: string;
};

const bucket = "menu-images";
const mutationFailureMessage = "We couldn’t save the QR code style. Please try again.";
const cleanupFailureMessage =
  "Your QR code style was saved, but the previous logo could not be removed. Please contact support if the issue continues.";

function uploadedLogo(formData: FormData): File | null {
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
  const path = `qr/${crypto.randomUUID()}.${imageExtension(file.type)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload a QR code logo.", error);
    return { error: "We couldn’t upload that logo. Please try again." };
  }
  return { path };
}

/** Updates the existing singleton only; this action never creates settings. */
export async function saveQrCodeStyle(
  _previousState: QrCodeActionState,
  formData: FormData,
): Promise<QrCodeActionState> {
  await requireAdmin();

  const parsedValues = qrCodeFormDataSchema.safeParse({
    backgroundColor: formData.get("backgroundColor"),
    cornerDotType: formData.get("cornerDotType"),
    cornerSquareType: formData.get("cornerSquareType"),
    dotColor: formData.get("dotColor"),
    dotType: formData.get("dotType"),
    logoSize: formData.get("logoSize"),
    removeLogo: formData.get("removeLogo"),
  });
  if (!parsedValues.success) {
    return { fieldErrors: parsedValues.error.flatten().fieldErrors };
  }

  const logo = uploadedLogo(formData);
  const logoError = validateMenuImage(logo);
  if (logoError) {
    return { formError: logoError };
  }

  const supabase = await createClient();
  const { data: existingSettings, error: readError } = await supabase
    .from("settings")
    .select("id, qr_logo_path")
    .limit(1)
    .maybeSingle();
  if (readError) {
    console.error("Failed to read CMS restaurant settings before updating the QR code style.", readError);
    return { formError: mutationFailureMessage };
  }
  if (!existingSettings) {
    return {
      formError:
        "Restaurant settings are missing. Please contact support before trying again.",
    };
  }

  const logoUpload = logo ? await uploadLogo(supabase, logo) : null;
  if (logoUpload?.error || (logo && !logoUpload?.path)) {
    return { formError: logoUpload?.error ?? mutationFailureMessage };
  }

  const nextLogoPath =
    logoUpload?.path ??
    (parsedValues.data.removeLogo ? null : existingSettings.qr_logo_path);
  const { data: savedSettings, error: updateError } = await supabase
    .from("settings")
    .update({
      qr_background_color: parsedValues.data.backgroundColor,
      qr_corner_dot_type: parsedValues.data.cornerDotType,
      qr_corner_square_type: parsedValues.data.cornerSquareType,
      qr_dot_color: parsedValues.data.dotColor,
      qr_dot_type: parsedValues.data.dotType,
      qr_logo_path: nextLogoPath,
      qr_logo_size: parsedValues.data.logoSize,
    })
    .eq("id", existingSettings.id)
    .select("id")
    .maybeSingle();

  if (updateError || !savedSettings) {
    const cleanedUp = logoUpload?.path
      ? await supabase.storage.from(bucket).remove([logoUpload.path])
      : { error: null };
    if (updateError) {
      console.error("Failed to update the CMS QR code style.", updateError);
    }
    return {
      formError: cleanedUp.error
        ? "We couldn’t save the QR code style, and a newly uploaded logo could not be removed. Please contact support."
        : updateError
          ? mutationFailureMessage
          : "Restaurant settings changed while you were editing. Refresh and try again.",
    };
  }

  const oldLogoPath = existingSettings.qr_logo_path;
  let cleanupSucceeded = true;
  if (oldLogoPath && oldLogoPath !== nextLogoPath) {
    const { error } = await supabase.storage.from(bucket).remove([oldLogoPath]);
    if (error) {
      console.error("Failed to remove the previous QR code logo.", error);
      cleanupSucceeded = false;
    }
  }

  return {
    status: "success",
    successMessage: "QR code style saved.",
    warning: cleanupSucceeded ? undefined : cleanupFailureMessage,
  };
}
