type ComingSoonProps = {
  description: string;
  title: string;
};

export function ComingSoon({ description, title }: ComingSoonProps) {
  return (
    <section className="max-w-2xl rounded-xl border bg-background p-6 shadow-xs sm:p-8">
      <p className="text-sm font-medium text-muted-foreground">Coming soon</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
    </section>
  );
}
