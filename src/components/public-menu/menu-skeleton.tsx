type MenuSkeletonProps = {
  loadingLabel: string;
};

export function MenuSkeleton({ loadingLabel }: MenuSkeletonProps) {
  return (
    <main className="min-h-dvh bg-[#f7f4ee]">
      <div
        role="status"
        aria-label={loadingLabel}
        className="animate-pulse motion-reduce:animate-none"
      >
        <span className="sr-only">{loadingLabel}</span>

        <div className="menu-hero-wrap">
          <div className="menu-hero bg-stone-200" />

          <div className="menu-shell">
            <div className="menu-hero-card">
              <div className="menu-hero-logo-frame bg-stone-200" />
              <div className="min-w-0 flex-1">
                <div className="h-6 w-2/3 max-w-56 rounded-lg bg-stone-200" />
                <div className="mt-2.5 h-3.5 w-1/2 max-w-40 rounded-full bg-stone-200" />
              </div>
            </div>
          </div>
        </div>

        <div className="menu-shell">
          <div className="menu-category-nav">
            <div className="menu-category-bar">
              <div className="size-11 shrink-0 rounded-full bg-stone-200" />
              <div className="flex gap-2 overflow-hidden">
                <div className="h-11 w-24 shrink-0 rounded-full bg-stone-200" />
                <div className="h-11 w-32 shrink-0 rounded-full bg-stone-200" />
                <div className="h-11 w-24 shrink-0 rounded-full bg-stone-200" />
              </div>
            </div>
          </div>

          <div className="py-12">
            <div className="h-8 w-36 rounded-lg bg-stone-200" />
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-40 rounded-3xl bg-white shadow-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
