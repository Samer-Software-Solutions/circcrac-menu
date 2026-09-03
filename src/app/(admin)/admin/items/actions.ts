"use server";

import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { PUBLIC_MENU_CACHE_TAG } from "@/lib/data/public-menu";
import { createClient } from "@/lib/supabase/server";
import {
  menuItemFormDataSchema,
  menuItemAvailabilitySchema,
  menuItemIdSchema,
  menuItemOrderSchema,
  validateMenuImage,
} from "@/lib/validation/menu-items";

export type MenuItemActionState = {
  fieldErrors?: {
    categoryId?: string[];
    descriptionAr?: string[];
    descriptionEn?: string[];
    nameAr?: string[];
    nameEn?: string[];
    price?: string[];
  };
  formError?: string;
  status?: "success";
  successMessage?: string;
  warning?: string;
};

type MenuItemMutationResult = {
  formError?: string;
  status: "error" | "success";
  successMessage?: string;
  warning?: string;
};

const bucket = "menu-images";
const mutationFailureMessage =
  "We couldn’t save that change. Please try again.";
const cleanupFailureMessage =
  "The menu item changed, but an unreferenced image could not be removed. Please contact support if the issue continues.";

function invalidItemActionState(): MenuItemActionState {
  return {
    formError:
      "The menu item request was invalid. Refresh the page and try again.",
  };
}

function hasSameIds(expectedIds: string[], receivedIds: string[]): boolean {
  if (expectedIds.length !== receivedIds.length) {
    return false;
  }

  const receivedIdSet = new Set(receivedIds);
  return (
    receivedIdSet.size === receivedIds.length &&
    expectedIds.every((id) => receivedIdSet.has(id))
  );
}

function uploadedFile(formData: FormData): File | null {
  const value = formData.get("image");
  // Browsers send an empty-name, zero-byte placeholder when no file was
  // picked. A named zero-byte file is a real upload attempt and must reach
  // validateMenuImage so the administrator receives the correct error.
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

async function uploadItemImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
): Promise<{ error?: string; path?: string }> {
  const path = `items/${crypto.randomUUID()}.${imageExtension(file.type)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("Failed to upload a CMS menu image.", error);
    return { error: "We couldn’t upload that image. Please try again." };
  }

  return { path };
}

async function removeUploadedImageAfterFailure(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(
      "Failed to remove a newly uploaded menu image after a database error.",
      error,
    );
    return false;
  }
  return true;
}

/**
 * Both item and settings paths live in this bucket. Check every database
 * reference before removing an old object so a shared legacy path is retained.
 */
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
      "Failed to verify whether an old menu image is still referenced.",
      itemsResult.error ?? settingsResult.error,
    );
    return false;
  }

  if ((itemsResult.count ?? 0) > 0 || (settingsResult.count ?? 0) > 0) {
    return true;
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Failed to remove an unreferenced CMS menu image.", error);
    return false;
  }

  return true;
}

function databaseErrorMessage(code: string | undefined): string {
  if (code === "23503") {
    return "That category no longer exists. Refresh the page and try again.";
  }
  return mutationFailureMessage;
}

export async function saveMenuItem(
  _previousState: MenuItemActionState,
  formData: FormData,
): Promise<MenuItemActionState> {
  await requireAdmin();

  const parsedValues = menuItemFormDataSchema.safeParse({
    available: formData.get("available"),
    categoryId: formData.get("categoryId"),
    descriptionAr: formData.get("descriptionAr"),
    descriptionEn: formData.get("descriptionEn"),
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
    price: formData.get("price"),
    removeImage: formData.get("removeImage"),
  });

  if (!parsedValues.success) {
    return { fieldErrors: parsedValues.error.flatten().fieldErrors };
  }

  const file = uploadedFile(formData);
  const imageError = validateMenuImage(file);
  if (imageError) {
    return { formError: imageError };
  }

  const rawItemId = formData.get("itemId");
  const itemId = rawItemId === null || rawItemId === "" ? null : rawItemId;
  const parsedItemId =
    itemId === null ? null : menuItemIdSchema.safeParse(itemId);
  if (parsedItemId && !parsedItemId.success) {
    return invalidItemActionState();
  }

  const supabase = await createClient();
  let existingItem: {
    category_id: string;
    image_path: string | null;
    sort_order: number;
  } | null = null;

  if (parsedItemId?.success) {
    const { data, error } = await supabase
      .from("menu_items")
      .select("category_id, image_path, sort_order")
      .eq("id", parsedItemId.data)
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to read a CMS menu item before updating it.",
        error,
      );
      return { formError: mutationFailureMessage };
    }
    if (!data) {
      return {
        formError:
          "That menu item no longer exists. Refresh the page and try again.",
      };
    }
    existingItem = data;
  }

  const upload = file ? await uploadItemImage(supabase, file) : null;
  if (upload?.error || (file && !upload?.path)) {
    return { formError: upload?.error ?? mutationFailureMessage };
  }

  const nextImagePath =
    upload?.path ??
    (parsedValues.data.removeImage ? null : (existingItem?.image_path ?? null));
  const values = {
    available: parsedValues.data.available,
    category_id: parsedValues.data.categoryId,
    description_ar: parsedValues.data.descriptionAr || null,
    description_en: parsedValues.data.descriptionEn || null,
    image_path: nextImagePath,
    name_ar: parsedValues.data.nameAr,
    name_en: parsedValues.data.nameEn,
    price: Number(parsedValues.data.price),
  };

  if (parsedItemId?.success && existingItem) {
    let sortOrder = existingItem.sort_order;
    if (existingItem.category_id !== parsedValues.data.categoryId) {
      const { data: lastItem, error: orderError } = await supabase
        .from("menu_items")
        .select("sort_order")
        .eq("category_id", parsedValues.data.categoryId)
        .order("sort_order", { ascending: false })
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (orderError) {
        const cleanedUp = upload?.path
          ? await removeUploadedImageAfterFailure(supabase, upload.path)
          : true;
        console.error(
          "Failed to determine the destination item order.",
          orderError,
        );
        return {
          formError: cleanedUp
            ? mutationFailureMessage
            : "We couldn’t save that change, and the newly uploaded image could not be removed. Please contact support.",
        };
      }
      sortOrder = (lastItem?.sort_order ?? -1) + 1;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update({ ...values, sort_order: sortOrder })
      .eq("id", parsedItemId.data)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      const cleanedUp = upload?.path
        ? await removeUploadedImageAfterFailure(supabase, upload.path)
        : true;
      if (error) {
        console.error("Failed to update a CMS menu item.", error);
      }
      return {
        formError: cleanedUp
          ? error
            ? databaseErrorMessage(error.code)
            : "That menu item no longer exists. Refresh the page and try again."
          : "We couldn’t save that change, and the newly uploaded image could not be removed. Please contact support.",
      };
    }

    updateTag(PUBLIC_MENU_CACHE_TAG);
    const oldImagePath = existingItem.image_path;
    const cleanupSucceeded =
      oldImagePath && oldImagePath !== nextImagePath
        ? await removeImageIfUnreferenced(supabase, oldImagePath)
        : true;
    return {
      status: "success",
      successMessage: "Menu item updated.",
      warning: cleanupSucceeded ? undefined : cleanupFailureMessage,
    };
  }

  const { data: lastItem, error: orderError } = await supabase
    .from("menu_items")
    .select("sort_order")
    .eq("category_id", parsedValues.data.categoryId)
    .order("sort_order", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    const cleanedUp = upload?.path
      ? await removeUploadedImageAfterFailure(supabase, upload.path)
      : true;
    console.error(
      "Failed to determine the next CMS menu item order.",
      orderError,
    );
    return {
      formError: cleanedUp
        ? mutationFailureMessage
        : "We couldn’t save that item, and the newly uploaded image could not be removed. Please contact support.",
    };
  }

  const { error } = await supabase.from("menu_items").insert({
    ...values,
    sort_order: (lastItem?.sort_order ?? -1) + 1,
  });

  if (error) {
    const cleanedUp = upload?.path
      ? await removeUploadedImageAfterFailure(supabase, upload.path)
      : true;
    console.error("Failed to create a CMS menu item.", error);
    return {
      formError: cleanedUp
        ? databaseErrorMessage(error.code)
        : "We couldn’t save that item, and the newly uploaded image could not be removed. Please contact support.",
    };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return { status: "success", successMessage: "Menu item created." };
}

export async function toggleMenuItemAvailability(
  itemId: string,
  available: boolean,
): Promise<MenuItemMutationResult> {
  await requireAdmin();

  const parsedInput = menuItemAvailabilitySchema.safeParse({
    available,
    itemId,
  });
  if (!parsedInput.success) {
    return { formError: "The menu item request was invalid.", status: "error" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .update({ available: parsedInput.data.available })
    .eq("id", parsedInput.data.itemId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to change a CMS menu item availability.", error);
    return { formError: mutationFailureMessage, status: "error" };
  }
  if (!data) {
    return {
      formError:
        "That menu item no longer exists. Refresh the page and try again.",
      status: "error",
    };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return {
    status: "success",
    successMessage: available
      ? "Menu item is available."
      : "Menu item is unavailable.",
  };
}

export async function deleteMenuItem(
  _previousState: MenuItemActionState,
  formData: FormData,
): Promise<MenuItemActionState> {
  await requireAdmin();

  const parsedItemId = menuItemIdSchema.safeParse(formData.get("itemId"));
  if (!parsedItemId.success) {
    return invalidItemActionState();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", parsedItemId.data)
    .select("id, image_path")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete a CMS menu item.", error);
    return { formError: mutationFailureMessage };
  }
  if (!data) {
    return {
      formError:
        "That menu item no longer exists. Refresh the page and try again.",
    };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  const cleanupSucceeded = data.image_path
    ? await removeImageIfUnreferenced(supabase, data.image_path)
    : true;
  return {
    status: "success",
    successMessage: "Menu item deleted.",
    warning: cleanupSucceeded ? undefined : cleanupFailureMessage,
  };
}

export async function reorderMenuItems(
  categoryId: string,
  ids: string[],
): Promise<MenuItemMutationResult> {
  await requireAdmin();

  const parsedOrder = menuItemOrderSchema.safeParse({ categoryId, ids });
  if (!parsedOrder.success) {
    return {
      formError:
        "The menu item order was invalid. Refresh the page and try again.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const { data: currentItems, error: readError } = await supabase
    .from("menu_items")
    .select("id")
    .eq("category_id", parsedOrder.data.categoryId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (readError) {
    console.error("Failed to validate a CMS menu item order.", readError);
    return { formError: mutationFailureMessage, status: "error" };
  }
  if (
    !hasSameIds(
      currentItems.map((item) => item.id),
      parsedOrder.data.ids,
    )
  ) {
    return {
      formError:
        "Items changed while you were reordering them. Refresh the page and try again.",
      status: "error",
    };
  }

  const results = await Promise.all(
    parsedOrder.data.ids.map((id, sortOrder) =>
      supabase
        .from("menu_items")
        .update({ sort_order: sortOrder })
        .eq("id", id)
        .eq("category_id", parsedOrder.data.categoryId),
    ),
  );
  const failedResult = results.find((result) => result.error);
  if (failedResult?.error) {
    console.error("Failed to reorder CMS menu items.", failedResult.error);
    return { formError: mutationFailureMessage, status: "error" };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return { status: "success", successMessage: "Menu item order saved." };
}
