import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-32 ml-auto" />
      </div>
      <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
        <div className="border-b border-[var(--nova-border)] px-4 py-3 flex gap-8">
          {[120, 100, 80, 80, 60].map((w, i) => (
            <div key={i} className="h-3 rounded-md bg-[var(--nova-tint-3)] animate-pulse" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-[var(--nova-border)] last:border-0 px-4 py-3.5 flex gap-8 items-center">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            {[120, 100, 80, 80, 60].map((w, j) => (
              <div key={j} className="h-3 rounded-md bg-[var(--nova-tint-3)] animate-pulse" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5">
          <Skeleton className="h-9 w-9 rounded-xl mb-3" />
          <Skeleton className="h-7 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
