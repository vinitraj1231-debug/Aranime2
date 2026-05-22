
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <Skeleton className="relative w-full aspect-[21/9] sm:aspect-[21/7] max-h-[500px]" />
  );
}
