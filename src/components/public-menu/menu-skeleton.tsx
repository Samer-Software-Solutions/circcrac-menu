type MenuSkeletonProps = {
  loadingLabel: string;
};

export function MenuSkeleton({ loadingLabel }: MenuSkeletonProps) {
  return (
    <main className="menu-page">
      <div
        role="status"
        aria-label={loadingLabel}
        className="menu-shell animate-pulse motion-reduce:animate-none"
      >
        <span className="sr-only">{loadingLabel}</span>

        <div className="menu-loading-header">
          <div className="size-12 rounded-full bg-stone-200" />
          <div className="h-11 w-24 rounded-full bg-stone-200" />
        </div>

        <div className="py-10 sm:py-14">
          <div className="h-3 w-16 rounded-full bg-stone-200" />
          <div className="mt-4 h-11 w-4/5 max-w-md rounded-xl bg-stone-200" />
          <div className="mt-4 h-2.5 w-32 rounded-full bg-stone-200" />
        </div>

        <div className="flex gap-7 overflow-hidden border-y border-stone-200 py-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <div className="h-2.5 w-5 rounded-full bg-stone-200" />
              <div className="h-3 w-16 rounded-full bg-stone-200" />
            </div>
          ))}
        </div>

        <div className="py-12">
          <div className="mb-7 flex items-baseline gap-4">
            <div className="h-4 w-6 rounded-full bg-stone-200" />
            <div className="h-7 w-32 rounded-lg bg-stone-200" />
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <div className="aspect-[4/3] w-full rounded-[1.75rem] bg-stone-200 sm:aspect-[16/8]" />

          <div className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex gap-4 border-t border-stone-200 py-5 first:border-t-0 first:pt-0"
              >
                <div className="size-[4.25rem] shrink-0 rounded-2xl bg-stone-200" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-3/4 rounded-full bg-stone-200" />
                  <div className="h-3 w-full rounded-full bg-stone-200" />
                  <div className="h-3 w-2/3 rounded-full bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
