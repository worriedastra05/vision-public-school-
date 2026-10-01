/** Dashboard loading skeleton — with a shimmer effect */
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

/** Table-page loading skeleton — filter bar + rows */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-3.5 w-56" />
        </div>
        <div className="skeleton h-10 w-36" />
      </div>
      <div className="flex gap-2.5">
        <div className="skeleton h-11 w-64" />
        <div className="skeleton h-11 w-40" />
        <div className="skeleton h-11 w-24" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/70">
        <div className="skeleton h-11 w-full rounded-none" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-t border-slate-100 px-5 py-3.5"
          >
            <div className="skeleton h-9 w-9 rounded-full" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="skeleton h-4 w-40" style={{ animationDelay: `${i * 60 + 20}ms` }} />
            <div className="skeleton h-4 w-24" style={{ animationDelay: `${i * 60 + 40}ms` }} />
            <div className="skeleton ml-auto h-4 w-20" style={{ animationDelay: `${i * 60 + 60}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Form-page loading skeleton — input grid inside a card */
export function FormSkeleton({ fields = 8 }: { fields?: number }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-2">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-3.5 w-64" />
      </div>
      <div className="space-y-5 rounded-2xl border border-slate-200/70 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="skeleton h-20 w-20 rounded-2xl" />
          <div className="space-y-2">
            <div className="skeleton h-9 w-32" />
            <div className="skeleton h-3 w-44" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3.5 w-24" style={{ animationDelay: `${i * 50}ms` }} />
              <div className="skeleton h-11 w-full" style={{ animationDelay: `${i * 50 + 25}ms` }} />
            </div>
          ))}
        </div>
        <div className="skeleton h-11 w-40" />
      </div>
    </div>
  );
}

/** Generic card-grid loading skeleton */
export function CardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="skeleton h-6 w-44" />
        <div className="skeleton h-3.5 w-60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-44 w-full rounded-2xl"
            style={{ animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
