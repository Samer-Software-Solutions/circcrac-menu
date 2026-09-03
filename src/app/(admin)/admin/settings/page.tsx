import { SettingsManager } from "@/components/admin/settings-manager";
import { getAdminSettings } from "@/lib/data/admin-settings";

export default async function SettingsPage() {
  const result = await getAdminSettings();

  if (result.status !== "ready") {
    const isMissing = result.status === "missing";
    return (
      <section className="max-w-xl" aria-labelledby="settings-title">
        <p className="text-sm font-medium text-muted-foreground">Restaurant setup</p>
        <h1 id="settings-title" className="mt-1 text-3xl font-semibold tracking-tight">
          Restaurant settings
        </h1>
        <p role="alert" className={isMissing ? "mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm leading-6" : "mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"}>
          {isMissing
            ? "Restaurant settings have not been created yet. Please contact support."
            : "We couldn’t load restaurant settings right now. Please refresh the page and try again."}
        </p>
      </section>
    );
  }

  return (
    <SettingsManager
      key={`${result.settings.updatedAt ?? ""}:${result.settings.logoPath ?? ""}:${result.settings.restaurantNameEn}`}
      settings={result.settings}
    />
  );
}
