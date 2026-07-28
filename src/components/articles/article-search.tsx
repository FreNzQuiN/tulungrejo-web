import { Search } from "lucide-react";

export function ArticleSearch({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  categories: string[];
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="glass-panel flex gap-4 px-6 py-5 mb-8 items-center flex-wrap"
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          placeholder="Cari artikel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input pl-[36px]"
          aria-label="Cari artikel"
        />
      </div>
      <div className="min-w-[160px]">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="form-select"
          aria-label="Filter kategori"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
