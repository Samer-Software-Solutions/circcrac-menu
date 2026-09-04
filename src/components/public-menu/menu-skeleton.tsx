type MenuSkeletonProps = {
  loadingLabel: string;
};

export function MenuSkeleton({ loadingLabel }: MenuSkeletonProps) {
  return (
    <main className="min-h-dvh bg-[#f7f4ee]">
      <div
        role="status"
        aria-label={loadingLabel}
        className="menu-shell min-h-dvh animate-pulse motion-reduce:animate-none"
      >
        <span className="sr-only">{loadingLabel}</span>
        <div className="menu-loading-header">
          <div className="size-12 rounded-full bg-stone-200" />
          <div className="h-11 w-24 rounded-full bg-stone-200" />
        </div>
        <div className="mt-14 h-3 w-20 rounded-full bg-stone-200" />
        <div className="mt-4 h-11 w-4/5 max-w-md rounded-xl bg-stone-200" />
        <div className="mt-12 flex gap-3 overflow-hidden border-y border-stone-200 py-4">
          <div className="h-11 w-28 shrink-0 rounded-full bg-stone-200" />
          <div className="h-11 w-36 shrink-0 rounded-full bg-stone-200" />
          <div className="h-11 w-28 shrink-0 rounded-full bg-stone-200" />
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
    </main>
  );
}
