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

type AdminNavigationLinkProps = NavigationItem & {
  compact: boolean;
  current?: boolean;
  className?: string;
};

function AdminNavigationLink({
  href,
  icon: Icon,
  label,
  compact,
  current = false,
  className,
}: AdminNavigationLinkProps) {
  const layoutClasses = compact
    ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    : "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const stateClasses = current
    ? "bg-primary text-primary-foreground shadow-sm"
    : "text-muted-foreground transition-colors hover:bg-stone-200/70 hover:text-foreground";

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`${layoutClasses} ${stateClasses} ${className ?? ""}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

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

        return (
          <AdminNavigationLink
            key={href}
            href={href}
            icon={Icon}
            label={label}
            compact={compact}
            current={isCurrent}
          />
        );
      })}
      <AdminNavigationLink
        href="/"
        icon={ExternalLink}
        label="View public menu"
        compact={compact}
        className={compact ? undefined : "mt-4"}
      />
    </nav>
  );
}
