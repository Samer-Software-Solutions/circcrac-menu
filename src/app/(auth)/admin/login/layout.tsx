import type { Metadata } from "next";
import { UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

import { fontVariables } from "@/app/fonts";

import "../../../globals.css";

export const metadata: Metadata = {
  title: "Sign in | CricCrac Menu CMS",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-muted/40 text-foreground">
        <main className="grid min-h-dvh place-items-center p-5">
          <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-sm sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <UtensilsCrossed className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">CricCrac Menu</p>
                <p className="text-sm text-muted-foreground">Administration</p>
              </div>
            </div>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
