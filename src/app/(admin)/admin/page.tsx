import { FolderKanban, QrCode, Settings, UtensilsCrossed } from "lucide-react";

const nextSteps = [
  { icon: FolderKanban, label: "Organize categories", detail: "Create and order menu sections." },
  { icon: UtensilsCrossed, label: "Manage menu items", detail: "Add dishes, prices, images, and availability." },
  { icon: Settings, label: "Set restaurant branding", detail: "Update names, logo, currency, and colors." },
  { icon: QrCode, label: "Prepare your QR code", detail: "Create a print-ready code for the public menu." },
];

export default function AdminPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Menu management</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          Your CMS is ready. Choose a section in the navigation to start managing the menu.
        </p>
      </div>
      <section className="mt-9 grid gap-4 sm:grid-cols-2" aria-label="CMS sections">
        {nextSteps.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="rounded-xl border bg-background p-5 shadow-xs">
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-semibold">{label}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>
    </>
  );
}
