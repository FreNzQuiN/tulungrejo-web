import { Skeleton } from "@/components/ui/skeleton";

export default function ArtikelLoading() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="container">
          <Skeleton className="mx-auto mb-3 h-8 w-56" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>
      </div>

      <div className="container py-10">
        <Skeleton className="mb-8 h-10 w-full max-w-sm" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-4">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="mb-4 h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
