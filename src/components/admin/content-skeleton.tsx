export function AdminContentSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label="Loading CMS content"
      className="motion-reduce:animate-none"
    >
      <span className="sr-only">Loading CMS content</span>
      <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200 motion-reduce:animate-none" />
      <div className="mt-3 h-9 w-56 max-w-full animate-pulse rounded-lg bg-stone-200 motion-reduce:animate-none" />
      <div className="mt-5 h-5 w-full max-w-xl animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />
      <div className="mt-2 h-5 w-4/5 max-w-lg animate-pulse rounded-full bg-stone-100 motion-reduce:animate-none" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl border border-stone-200/80 bg-white motion-reduce:animate-none"
          />
        ))}
      </div>
    </section>
  );
}
