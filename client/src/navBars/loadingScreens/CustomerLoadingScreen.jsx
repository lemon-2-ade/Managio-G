import { Skeleton } from "@/components/ui/skeleton";

const CustomerLoadingScreen = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      {/* Header */}
      <Skeleton className="mb-5 h-[70px] w-full" />

      {/* Search and filters */}
      <div className="mb-5 flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b bg-muted/40 p-3 px-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, item) => (
            <div key={item} className="grid grid-cols-5 items-center gap-4 p-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-8 justify-self-end" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};

export default CustomerLoadingScreen;
