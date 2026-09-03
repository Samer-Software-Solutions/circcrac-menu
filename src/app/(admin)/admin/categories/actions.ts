"use server";

import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { PUBLIC_MENU_CACHE_TAG } from "@/lib/data/public-menu";
import { createClient } from "@/lib/supabase/server";
import {
  categoryFormDataSchema,
  categoryIdSchema,
  categoryOrderSchema,
} from "@/lib/validation/categories";

export type CategoryActionState = {
  fieldErrors?: {
    nameAr?: string[];
    nameEn?: string[];
  };
  formError?: string;
  status?: "success";
  successMessage?: string;
};

type CategoryMutationResult = {
  formError?: string;
  status: "error" | "success";
  successMessage?: string;
};

const mutationFailureMessage = "We couldn’t save that change. Please try again.";
const categoryMissingMessage = "That category no longer exists. Refresh the page and try again.";

function invalidCategoryActionState(): CategoryActionState {
  return { formError: "The category request was invalid. Refresh the page and try again." };
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

export async function saveCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsedValues = categoryFormDataSchema.safeParse({
    enabled: formData.get("enabled"),
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
  });

  if (!parsedValues.success) {
    return { fieldErrors: parsedValues.error.flatten().fieldErrors };
  }

  const rawCategoryId = formData.get("categoryId");
  const categoryId = rawCategoryId === null || rawCategoryId === "" ? null : rawCategoryId;
  const parsedCategoryId = categoryId === null ? null : categoryIdSchema.safeParse(categoryId);

  if (parsedCategoryId && !parsedCategoryId.success) {
    return invalidCategoryActionState();
  }

  const supabase = await createClient();
  const values = {
    enabled: parsedValues.data.enabled,
    name_ar: parsedValues.data.nameAr,
    name_en: parsedValues.data.nameEn,
  };

  if (parsedCategoryId?.success) {
    const { data, error } = await supabase
      .from("categories")
      .update(values)
      .eq("id", parsedCategoryId.data)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Failed to update a CMS category.", error);
      return { formError: mutationFailureMessage };
    }

    if (!data) {
      return { formError: categoryMissingMessage };
    }

    updateTag(PUBLIC_MENU_CACHE_TAG);
    return { status: "success", successMessage: "Category updated." };
  }

  const { data: lastCategory, error: orderError } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    console.error("Failed to determine the next CMS category order.", orderError);
    return { formError: mutationFailureMessage };
  }

  const { error } = await supabase.from("categories").insert({
    ...values,
    sort_order: (lastCategory?.sort_order ?? -1) + 1,
  });

  if (error) {
    console.error("Failed to create a CMS category.", error);
    return { formError: mutationFailureMessage };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return { status: "success", successMessage: "Category created." };
}

export async function toggleCategoryEnabled(
  categoryId: string,
  enabled: boolean,
): Promise<CategoryMutationResult> {
  await requireAdmin();

  const parsedCategoryId = categoryIdSchema.safeParse(categoryId);
  if (!parsedCategoryId.success) {
    return { formError: "The category request was invalid.", status: "error" };
  }

  if (typeof enabled !== "boolean") {
    return { formError: "The category status was invalid.", status: "error" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({ enabled })
    .eq("id", parsedCategoryId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to change a CMS category status.", error);
    return { formError: mutationFailureMessage, status: "error" };
  }

  if (!data) {
    return { formError: categoryMissingMessage, status: "error" };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return {
    status: "success",
    successMessage: enabled ? "Category enabled." : "Category disabled.",
  };
}

export async function deleteCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsedCategoryId = categoryIdSchema.safeParse(formData.get("categoryId"));
  if (!parsedCategoryId.success) {
    return invalidCategoryActionState();
  }

  const supabase = await createClient();
  const { count, error: itemCountError } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", parsedCategoryId.data);

  if (itemCountError) {
    console.error("Failed to check whether a CMS category can be deleted.", itemCountError);
    return { formError: mutationFailureMessage };
  }

  if ((count ?? 0) > 0) {
    return {
      formError: "This category contains menu items. Move or delete those items before deleting the category.",
    };
  }

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", parsedCategoryId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    // A concurrent item insert can still trigger the database's ON DELETE
    // RESTRICT constraint after the count above. Keep that database detail
    // internal while giving the administrator a useful recovery path.
    if (error.code === "23503") {
      return {
        formError: "This category contains menu items. Move or delete those items before deleting the category.",
      };
    }

    console.error("Failed to delete a CMS category.", error);
    return { formError: mutationFailureMessage };
  }

  if (!data) {
    return { formError: categoryMissingMessage };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return { status: "success", successMessage: "Category deleted." };
}

export async function reorderCategories(ids: string[]): Promise<CategoryMutationResult> {
  await requireAdmin();

  const parsedOrder = categoryOrderSchema.safeParse({ ids });
  if (!parsedOrder.success) {
    return { formError: "The category order was invalid. Refresh the page and try again.", status: "error" };
  }

  const supabase = await createClient();
  const { data: currentCategories, error: readError } = await supabase
    .from("categories")
    .select("id")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (readError) {
    console.error("Failed to validate a CMS category order.", readError);
    return { formError: mutationFailureMessage, status: "error" };
  }

  const currentIds = currentCategories.map((category) => category.id);
  if (!hasSameIds(currentIds, parsedOrder.data.ids)) {
    return {
      formError: "Categories changed while you were reordering them. Refresh the page and try again.",
      status: "error",
    };
  }

  const results = await Promise.all(
    parsedOrder.data.ids.map((id, sortOrder) =>
      supabase.from("categories").update({ sort_order: sortOrder }).eq("id", id),
    ),
  );
  const failedResult = results.find((result) => result.error);

  if (failedResult?.error) {
    console.error("Failed to reorder CMS categories.", failedResult.error);
    return { formError: mutationFailureMessage, status: "error" };
  }

  updateTag(PUBLIC_MENU_CACHE_TAG);
  return { status: "success", successMessage: "Category order saved." };
}
