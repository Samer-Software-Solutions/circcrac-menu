import "server-only";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export type AdminCategory = {
  enabled: boolean;
  id: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
};

export type AdminCategoriesResult =
  | { categories: AdminCategory[]; status: "ready" }
  | { status: "error" };

/**
 * Authorization is intentionally repeated here instead of relying on the
 * parent layout. This data function is safe to reuse from any protected route.
 */
export async function getAdminCategories(): Promise<AdminCategoriesResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("enabled, id, name_ar, name_en, sort_order")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("Failed to load CMS categories.", error);
    return { status: "error" };
  }

  return {
    categories: data.map((category) => ({
      enabled: category.enabled,
      id: category.id,
      nameAr: category.name_ar,
      nameEn: category.name_en,
      sortOrder: category.sort_order,
    })),
    status: "ready",
  };
}
