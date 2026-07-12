import Link from "next/link";

export default function ArtikelNotFound() {
  return (
    <div className="animate-fade-in">
      <div className="container min-h-[70vh] flex justify-center items-center py-10">
        <div className="glass-panel text-center max-w-[500px] p-[50px]">
          <h2
            className="text-[24px] mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Artikel Tidak Ditemukan
          </h2>
          <p className="text-[14px] text-muted-foreground mb-6">
            Artikel yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link href="/artikel" className="btn btn-primary">
            Kembali ke Artikel
          </Link>
        </div>
      </div>
    </div>
  );
}
