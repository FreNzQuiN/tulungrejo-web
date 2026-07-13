import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="animate-fade-in">
      <div className="hero-section">
        <div className="container">
          <Skeleton className="mx-auto mb-4 h-4 w-48" />
          <Skeleton className="mx-auto mb-6 h-10 w-[500px] max-w-full" />
          <Skeleton className="mx-auto h-5 w-96 max-w-full" />
        </div>
      </div>

      <div className="container py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}
