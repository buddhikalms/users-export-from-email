export default function ContactsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading contacts">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
        <div className="h-11 w-56 animate-pulse rounded bg-secondary" />
        <div className="h-5 max-w-2xl animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-3xl bg-secondary" />
        ))}
      </div>
      <div className="h-[520px] animate-pulse rounded-3xl bg-secondary" />
    </div>
  );
}
