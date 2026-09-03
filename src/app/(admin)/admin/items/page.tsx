import { MenuItemManager } from "@/components/admin/menu-item-manager";
import { getAdminMenuItems } from "@/lib/data/admin-menu-items";

export default async function ItemsPage() {
  const result = await getAdminMenuItems();

  if (result.status === "error") {
    return (
      <section className="max-w-xl" aria-labelledby="items-title">
        <p className="text-sm font-medium text-muted-foreground">Menu setup</p>
        <h1
          id="items-title"
          className="mt-1 text-3xl font-semibold tracking-tight"
        >
          Menu items
        </h1>
        <p className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
          We couldn’t load menu items right now. Please refresh the page and try
          again.
        </p>
      </section>
    );
  }

  return (
    <MenuItemManager
      key={JSON.stringify({
        categories: result.categories,
        items: result.items,
      })}
      categories={result.categories}
      items={result.items}
    />
  );
}
