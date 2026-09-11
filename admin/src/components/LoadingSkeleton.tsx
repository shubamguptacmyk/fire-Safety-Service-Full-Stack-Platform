interface LoadingSkeletonProps {
  rows?: number;
  type?: "table" | "cards" | "details";
}

export default function LoadingSkeleton({ rows = 5, type = "table" }: LoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-black/5 rounded-xl p-5 space-y-3">
            <div className="h-3 w-1/2 bg-gray-200 rounded" />
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-2 w-full bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "details") {
    return (
      <div className="bg-white border border-black/10 rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="h-20 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="p-4 border-b border-black/5 flex justify-between">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="divide-y divide-black/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-1/4 bg-gray-200 rounded" />
              <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
