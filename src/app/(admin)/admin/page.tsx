import { ArrowUpRight, FolderKanban, QrCode, Settings, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

const nextSteps = [
  {
    href: "/admin/categories",
    icon: FolderKanban,
    label: "Organize categories",
    detail: "Create and order menu sections.",
  },
  {
    href: "/admin/items",
    icon: UtensilsCrossed,
    label: "Manage menu items",
    detail: "Add dishes, prices, images, and availability.",
  },
  {
    href: "/admin/settings",
    icon: Settings,
    label: "Set restaurant branding",
    detail: "Update names, logo, currency, and colors.",
  },
  {
    href: "/admin/qr-code",
    icon: QrCode,
    label: "Prepare your QR code",
    detail: "Create a print-ready code for the public menu.",
  },
];

export default function AdminPage() {
  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white px-6 py-7 shadow-xs sm:px-8 sm:py-9">
        <div className="absolute inset-y-0 end-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(41,37,36,0.11),transparent_64%)]" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-stone-900 sm:text-4xl">
            Your menu, ready to manage.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Keep every part of your customer menu current, from dish details and images to
            restaurant branding and QR access.
          </p>
        </div>
        <div className="relative mt-7 flex items-center gap-3 text-sm text-stone-600">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Your CMS workspace is ready.
        </div>
      </section>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Quick access</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Manage your menu</h2>
        </div>
      </div>
      <section className="mt-5 grid gap-4 sm:grid-cols-2" aria-label="CMS sections">
        {nextSteps.map(({ href, icon: Icon, label, detail }, index) => (
          <Link
            key={label}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-stone-100 text-stone-800 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="absolute end-5 top-5 text-xs font-semibold tabular-nums text-stone-400">
              0{index + 1}
            </span>
            <ArrowUpRight
              className="absolute end-5 bottom-5 size-4 text-stone-300 transition-colors group-hover:text-stone-800"
              aria-hidden="true"
            />
            <h3 className="mt-5 font-semibold text-stone-900">{label}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
