export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-12 rounded" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden space-y-3 p-4">
      <Skeleton className="aspect-[16/9] w-full rounded-lg" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export default Skeleton;
