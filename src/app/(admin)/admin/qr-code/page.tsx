import { headers } from "next/headers";

import { QrCodeManager } from "@/components/admin/qr-code-manager";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminSettings } from "@/lib/data/admin-settings";
import { getCanonicalPublicMenuUrl } from "@/lib/site-url";

function originFromRequestHeaders(requestHeaders: Headers): string {
  const forwardedHost = requestHeaders
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || requestHeaders.get("host")?.trim();
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol = forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export default async function QrCodePage() {
  await requireAdmin();
  const [settingsResult, requestHeaders] = await Promise.all([
    getAdminSettings(),
    headers(),
  ]);

  if (settingsResult.status !== "ready") {
    return (
      <section className="max-w-xl" aria-labelledby="qr-code-title">
        <p className="text-sm font-medium text-muted-foreground">Public menu</p>
        <h1 id="qr-code-title" className="mt-1 text-3xl font-semibold tracking-tight">QR code</h1>
        <p role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
          Restaurant settings must be available before a QR code can be generated.
        </p>
      </section>
    );
  }

  return (
    <QrCodeManager
      logoUrl={settingsResult.settings.logoUrl}
      publicUrl={getCanonicalPublicMenuUrl(originFromRequestHeaders(requestHeaders))}
      restaurantName={settingsResult.settings.restaurantNameEn}
    />
  );
}
