import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center justify-between border-b border-[var(--nova-border)] px-6 shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--nova-border)]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-36 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-14 border-r border-[var(--nova-border)]" />
        <div className="flex-1 grid grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-r border-[var(--nova-border)] last:border-r-0">
              <div className="h-12 border-b border-[var(--nova-border)] flex items-center justify-center">
                <Skeleton className="h-6 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
