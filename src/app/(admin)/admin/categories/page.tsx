import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories } from "@/lib/data/admin-categories";

export default async function CategoriesPage() {
  const result = await getAdminCategories();

  if (result.status === "error") {
    return (
      <section className="max-w-xl" aria-labelledby="categories-title">
        <p className="text-sm font-medium text-muted-foreground">Menu setup</p>
        <h1 id="categories-title" className="mt-1 text-3xl font-semibold tracking-tight">
          Categories
        </h1>
        <p className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
          We couldn’t load categories right now. Please refresh the page and try again.
        </p>
      </section>
    );
  }

  return (
    <CategoryManager
      key={result.categories
        .map(
          (category) =>
            `${category.id}:${category.enabled}:${category.sortOrder}:${category.nameEn}:${category.nameAr}`,
        )
        .join("|")}
      categories={result.categories}
    />
  );
}
