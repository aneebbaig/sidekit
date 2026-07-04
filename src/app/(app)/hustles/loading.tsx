import { Skeleton } from "@/components/ui/skeleton";

export default function HustlesLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-52" />
      </div>
      <Skeleton className="h-9 w-28 self-end" />
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
