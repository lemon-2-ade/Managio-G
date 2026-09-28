import { Skeleton } from "@/components/ui/skeleton";

const PurchaseOrderSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Order rows */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, item) => (
          <div key={item} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-2">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseOrderSkeleton;
