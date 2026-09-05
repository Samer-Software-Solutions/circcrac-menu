import type { Metadata } from "next";
import { LogOut, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { logout } from "@/app/admin/actions";
import { fontVariables } from "@/app/fonts";
import { AdminNavigation } from "@/components/admin/navigation";
import { AdminToastProvider } from "@/components/admin/admin-toast-provider";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminSettings } from "@/lib/data/admin-settings";

import "../../globals.css";

export const metadata: Metadata = {
  title: "CricCrac Menu CMS",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const settingsResult = await getAdminSettings();
  const logoUrl = settingsResult.status === "ready" ? settingsResult.settings.logoUrl : null;

  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-stone-50 text-foreground">
        <AdminToastProvider>
        <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-stone-200/80 bg-stone-50/80 lg:flex lg:flex-col">
            <div className="flex h-20 items-center border-b border-stone-200/80 px-5">
              <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt=""
                    width={40}
                    height={40}
                    sizes="40px"
                    className="size-full object-cover"
                    priority
                  />
                ) : (
                  <UtensilsCrossed className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="ms-3 min-w-0">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  CricCrac
                </p>
                <p className="mt-0.5 text-sm font-semibold tracking-tight">Menu workspace</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col px-3 py-6">
              <p className="px-3 text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Manage
              </p>
              <div className="mt-2">
                <AdminNavigation />
              </div>
              <div className="mt-auto rounded-2xl border border-stone-200/80 bg-white/80 p-3 shadow-xs">
                <p className="px-1 text-[0.68rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Signed in as
                </p>
                <p className="truncate text-sm font-medium">{admin.email ?? "Administrator"}</p>
                <form action={logout} className="mt-2">
                  <Button type="submit" variant="ghost" className="w-full justify-start">
                    <LogOut aria-hidden="true" />
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="border-b border-stone-200/80 bg-stone-50/90 backdrop-blur lg:hidden">
              <div className="flex h-16 items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-2.5 font-semibold">
                  <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-primary text-primary-foreground">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt=""
                        width={32}
                        height={32}
                        sizes="32px"
                        className="size-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="size-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="truncate">CricCrac CMS</span>
                </div>
                <form action={logout}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    aria-label="Sign out of the CMS"
                  >
                    <LogOut aria-hidden="true" />
                    Sign out
                  </Button>
                </form>
              </div>
              <div className="border-t border-stone-200/80 px-2 pt-1">
                <AdminNavigation compact />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-12">
              {children}
            </main>
          </div>
        </div>
        </AdminToastProvider>
      </body>
    </html>
  );
}
