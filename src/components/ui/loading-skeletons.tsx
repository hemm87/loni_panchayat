import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-2xl shadow-sm border border-border/60 p-7">
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24 mb-3" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-2xl shadow-sm border border-border/60 p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/60 p-6">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 pb-4 border-b">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>
        
        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
          <div key={row} className="grid grid-cols-6 gap-4 py-4 border-b">
            {[1, 2, 3, 4, 5, 6].map((col) => (
              <Skeleton key={col} className="h-4" />
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <Skeleton className="h-8 w-96 mb-6" />
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
        
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  );
}
