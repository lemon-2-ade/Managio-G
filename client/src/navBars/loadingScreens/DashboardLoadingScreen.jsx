import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoadingScreen = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-16" />
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-24 w-full" />
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
};

export default DashboardLoadingScreen;
