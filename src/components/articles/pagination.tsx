import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div
      className="flex justify-center items-center gap-2 mt-8"
      role="navigation"
      aria-label="Navigasi halaman artikel"
    >
      <button
        className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-dark-brown font-bold cursor-pointer transition-all hover:bg-gray-100 hover:border-dark-brown disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-10 text-center text-muted-foreground text-sm"
            aria-hidden="true"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            className={`flex items-center justify-center w-10 h-10 rounded-md border font-bold cursor-pointer transition-all ${currentPage === page ? "bg-dark-brown text-white border-dark-brown" : "border-gray-300 bg-white text-dark-brown hover:bg-gray-100 hover:border-dark-brown"}`}
            onClick={() => onPageChange(page)}
            aria-label={`Ke halaman ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-dark-brown font-bold cursor-pointer transition-all hover:bg-gray-100 hover:border-dark-brown disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Halaman selanjutnya"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
