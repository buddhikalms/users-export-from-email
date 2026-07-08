export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="h-48 animate-pulse rounded-3xl bg-secondary" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-secondary" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-96 animate-pulse rounded-3xl bg-secondary" />
        <div className="h-96 animate-pulse rounded-3xl bg-secondary" />
      </div>
    </div>
  );
}
