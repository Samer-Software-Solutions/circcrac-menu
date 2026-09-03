"use client";

import {
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  QrCode,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

type NavigationItem = {
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
};

const navigationItems: NavigationItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview" },
  { href: "/admin/categories", icon: FolderKanban, label: "Categories" },
  { href: "/admin/items", icon: UtensilsCrossed, label: "Menu items" },
  { href: "/admin/settings", icon: Settings, label: "Restaurant settings" },
  { href: "/admin/qr-code", icon: QrCode, label: "QR code" },
];

type AdminNavigationProps = {
  compact?: boolean;
};

export function AdminNavigation({ compact = false }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="CMS navigation"
      className={compact ? "flex gap-1 overflow-x-auto pb-1" : "space-y-1"}
    >
      {navigationItems.map(({ href, icon: Icon, label }) => {
        const isCurrent =
          href === "/admin" ? pathname === href : pathname.startsWith(`${href}/`) || pathname === href;
        const layoutClasses = compact
          ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          : "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
        const stateClasses = isCurrent
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground";

        return (
          <Link
            key={href}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            className={`${layoutClasses} ${stateClasses}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className={
          compact
            ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            : "mt-4 flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        }
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        View public menu
      </Link>
    </nav>
  );
}
