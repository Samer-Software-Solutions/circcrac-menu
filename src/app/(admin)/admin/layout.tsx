import type { Metadata } from "next";
import { LogOut, UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

import { logout } from "@/app/admin/actions";
import { fontVariables } from "@/app/fonts";
import { AdminNavigation } from "@/components/admin/navigation";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/require-admin";

import "../../globals.css";

export const metadata: Metadata = {
  title: "CricCrac Menu CMS",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-muted/40 text-foreground">
        <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
          <aside className="hidden border-r bg-background lg:flex lg:flex-col">
            <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
              <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
                <UtensilsCrossed className="size-4" aria-hidden="true" />
              </span>
              CricCrac CMS
            </div>
            <div className="flex flex-1 flex-col px-3 py-5">
              <AdminNavigation />
              <div className="mt-auto border-t px-2 pt-4">
                <p className="truncate text-sm font-medium">{admin.email ?? "Administrator"}</p>
                <form action={logout} className="mt-3">
                  <Button type="submit" variant="ghost" className="w-full justify-start">
                    <LogOut aria-hidden="true" />
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="border-b bg-background lg:hidden">
              <div className="flex h-14 items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-2 font-semibold">
                  <UtensilsCrossed className="size-4 shrink-0" aria-hidden="true" />
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
              <div className="border-t px-2 pt-1">
                <AdminNavigation compact />
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
