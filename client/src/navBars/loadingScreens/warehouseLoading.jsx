import { Skeleton } from "@/components/ui/skeleton";

const WarehouseLoadingSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8">
      {/* Header */}
      <Skeleton className="h-[70px] w-full" />

      {/* Search */}
      <Skeleton className="h-10 w-full max-w-sm" />

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
};

export default WarehouseLoadingSkeleton;
