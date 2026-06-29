import { Skeleton } from "@/components/ui/skeleton";

export default function HustleDetailLoading() {
  return (
    <>
      <div className="h-14 border-b border-border px-4 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="h-10 border-b border-border px-4 flex gap-5 items-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-14" />
        ))}
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
