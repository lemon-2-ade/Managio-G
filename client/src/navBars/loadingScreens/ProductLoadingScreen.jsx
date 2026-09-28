import { Skeleton } from "@/components/ui/skeleton";

const ProductLoadingScreen = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8">
      {/* Header */}
      <Skeleton className="h-[70px] w-full" />

      {/* Search and filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Skeleton className="h-10 w-full md:flex-1" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
        <Skeleton className="h-10 w-full md:w-[180px]" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,220px))] justify-start gap-4">
        {Array.from({ length: 10 }).map((_, item) => (
          <Skeleton key={item} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
};

export default ProductLoadingScreen;
