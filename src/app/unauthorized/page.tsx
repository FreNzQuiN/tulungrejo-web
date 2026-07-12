import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive">403</h1>
        <p className="text-muted-foreground mt-2">
          Anda tidak memiliki akses ke halaman ini
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
