/** Dashboard loading skeleton — shimmer effect ke saath */
export function DashboardSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="skeleton h-[92px] w-full" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  );
}
