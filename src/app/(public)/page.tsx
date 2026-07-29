import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CountUp } from "@/components/shared/count-up";
import { HeroScrollButton } from "@/components/shared/hero-scroll-button";
import { HomeArticles } from "@/components/articles/home-articles";
import { Users, Home as HomeIcon } from "lucide-react";
import { connection } from "next/server";

import { getVillageStats } from "@/lib/desa-queries";
import { getHomepageContent } from "@/lib/desa-queries";
import { getAllPublishedArticles } from "@/lib/article-queries";
import { ArticlesError } from "@/components/articles/articles-error";

async function HomePageContent() {
  await connection();
  let content;
  try {
    content = await getHomepageContent();
  } catch {
    return (
      <header className="hero-section">
        <div className="container">
          <h1 className="hero-title">Desa Tulungrejo</h1>
          <p className="hero-desc">
            Selamat datang di portal resmi Pemerintah Desa Tulungrejo
          </p>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className="hero-section"
        style={
          content.heroImage
            ? ({
                "--hero-bg-image": `url("${content.heroImage}")`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className="container">
          <p className="hero-subtitle">{content.heroSubtitle}</p>
          <h1 className="hero-title">{content.heroTitle}</h1>
          <p className="hero-desc">{content.heroDescription}</p>
          <div className="hero-actions">
            <HeroScrollButton />
          </div>
        </div>
      </header>

      <section id="about-section" className="home-about-section" tabIndex={-1}>
        <div className="container about-map-grid">
          <div className="about-content">
            <h2>{content.aboutTitle}</h2>
            {content.aboutParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="map-container">
            <iframe
              title="Peta Lokasi Desa Tulungrejo"
              src={content.googleMapsUrl}
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
    </>
  );
}

async function StatsSection() {
  await connection();
  let stats;
  try {
    stats = await getVillageStats();
  } catch {
    console.error("Gagal memuat statistik desa");
    return null;
  }

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
  await connection();
  let articles;
  try {
    articles = await getAllPublishedArticles(6);
  } catch (e) {
    console.error("Gagal memuat artikel:", e);
    return <ArticlesError />;
  }
  if (!articles || articles.length === 0) {
    return (
      <section className="home-articles-section">
        <div className="container">
          <div className="section-header">
            <h2>Kabar & Artikel Desa</h2>
          </div>
          <p className="text-center text-muted-foreground py-12">
            Belum ada artikel untuk ditampilkan.
          </p>
        </div>
      </section>
    );
  }
  return <HomeArticles articles={articles} />;
}

function StatsSkeleton() {
  return (
    <section className="stats-section" aria-busy={true}>
      <div className="container">
        <div className="section-header">
          <Skeleton className="mx-auto mb-2 h-8 w-56" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
              <Skeleton className="mx-auto mb-2 h-8 w-32" />
              <Skeleton className="mx-auto h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticlesSkeleton() {
  return (
    <section className="home-articles-section" aria-busy={true}>
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
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="mb-1 h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
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
      <Suspense
        fallback={
          <header className="hero-section">
            <div className="container">
              <Skeleton className="mx-auto mb-4 h-4 w-48" />
              <Skeleton className="mx-auto mb-6 h-10 w-[500px] max-w-full" />
              <Skeleton className="mx-auto h-5 w-96 max-w-full" />
            </div>
          </header>
        }
      >
        <HomePageContent />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesSection />
      </Suspense>
    </div>
  );
}
