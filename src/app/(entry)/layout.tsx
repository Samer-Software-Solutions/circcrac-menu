import type { ReactNode } from "react";

import { fontVariables } from "@/app/fonts";

import "../globals.css";

export default function PermanentEntryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
