import { TableSkeleton } from "@/components/ui/page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center justify-between border-b border-[var(--nova-border)] px-6 shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <div className="p-6">
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}
