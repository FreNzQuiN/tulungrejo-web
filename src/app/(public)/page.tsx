import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/shared/count-up";
import { HeroScrollButton } from "@/components/shared/hero-scroll-button";
import { HomeArticles } from "@/components/articles/home-articles";
import { Users, Home as HomeIcon } from "lucide-react";

import { getVillageStats } from "@/lib/desa-queries";
import { getAllPublishedArticles } from "@/lib/article-queries";
import { ArticlesError } from "@/components/articles/articles-error";

async function StatsSection() {
  const stats = await getVillageStats();

  return (
    <section className="stats-section">
      <div className="container">
        <div className="section-header">
          <h2>Statistik Kependudukan</h2>
          <p>
            Data administrasi warga Desa Tulungrejo yang diperbarui secara
            berkala
          </p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <HomeIcon size={24} />
            </div>
            <div className="stat-value">
              <CountUp end={stats.jumlahKK} />
            </div>
            <div className="stat-label">Jumlah Kepala Keluarga</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="stat-value">
              <CountUp end={stats.jumlahPenduduk} />
            </div>
            <div className="stat-label">Total Penduduk</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Users size={24} className="text-blue-500" />
            </div>
            <div className="stat-value">
              <CountUp end={stats.lakiLaki} />
            </div>
            <div className="stat-label">Penduduk Laki-Laki</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Users size={24} className="text-pink-500" />
            </div>
            <div className="stat-value">
              <CountUp end={stats.perempuan} />
            </div>
            <div className="stat-label">Penduduk Perempuan</div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function ArticlesSection() {
  let articles;
  try {
    articles = await getAllPublishedArticles();
  } catch (e) {
    console.error("Gagal memuat artikel:", e);
    return <ArticlesError />;
  }
  if (articles.length === 0) return null;
  return <HomeArticles articles={articles} />;
}

function StatsSkeleton() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="section-header">
          <Skeleton className="mx-auto mb-2 h-8 w-56" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
              <Skeleton className="mx-auto mb-2 h-8 w-24" />
              <Skeleton className="mx-auto h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticlesSkeleton() {
  return (
    <section className="home-articles-section">
      <div className="container">
        <div className="section-header">
          <Skeleton className="mx-auto mb-2 h-8 w-56" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>
        <div className="articles-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="article-card">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="article-body">
                <Skeleton className="mb-3 h-5 w-16" />
                <Skeleton className="mb-2 h-6 w-full" />
                <Skeleton className="mb-4 h-6 w-3/4" />
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="mb-1 h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <header className="hero-section">
        <div className="container">
          <p className="hero-subtitle">Portal Resmi Pemerintah Desa</p>
          <h1 className="hero-title">Selamat Datang di Desa Tulungrejo</h1>
          <p className="hero-desc">
            Pusat informasi dan kegiatan kemasyarakatan Desa Tulungrejo,
            Kecamatan Wates, Kab. Blitar.
          </p>
          <div className="hero-actions">
            <HeroScrollButton />
          </div>
        </div>
      </header>

      <section id="about-section" className="home-about-section">
        <div className="container about-map-grid">
          <div className="about-content">
            <h2>Mengenal Desa Tulungrejo</h2>
            <p>
              Desa Tulungrejo secara administratif terletak di Kecamatan Wates,
              Kabupaten Blitar, Jawa Timur. Dikelilingi oleh perbukitan dan
              kawasan hutan yang masih asri, desa ini memiliki tanah yang subur
              dan potensi sumber daya alam yang melimpah untuk dikembangkan.
            </p>
            <p>
              Mayoritas penduduk Desa Tulungrejo menggantungkan hidupnya pada
              sektor pertanian, peternakan, serta pengembangan pariwisata alam
              berbasis potensi lokal yang terus berkembang pesat dari tahun ke
              tahun. Beberapa potensi wisata alam seperti hutan pinus dan air
              terjun menjadi daya tarik utama bagi wisatawan yang berkunjung.
            </p>
            <p>
              Melalui komitmen gotong royong, tata pemerintahan desa Tulungrejo
              senantiasa mengedepankan prinsip keterbukaan informasi, tertib
              administrasi perpajakan (PBB), serta peningkatan mutu SDM warga
              demi kemandirian dan kesejahteraan bersama.
            </p>
          </div>
          <div className="map-container">
            <iframe
              title="Peta Lokasi Desa Tulungrejo"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31582.023305011266!2d112.31065444999999!3d-8.327332949999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78b9bfe12d6a7d%3A0xc0a3160b9e66bf89!2sArea%20Hutan%2C%20Tulungrejo%2C%20Wates%2C%20Blitar%20Regency%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1783657389028!5m2!1sen!2sid"
              width="100%"
              height="100%"
              className="border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesSection />
      </Suspense>
    </div>
  );
}
