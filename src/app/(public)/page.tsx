import { Suspense } from "react";
import { CountUp } from "@/components/count-up";
import { HeroScrollButton } from "@/components/hero-scroll-button";
import { HomeArticles } from "@/components/home-articles";
import { Users, Home as HomeIcon } from "lucide-react";
import { connection } from "next/server";
import { getVillageStats } from "@/lib/desa-queries";
import { getAllPublishedArticles } from "@/lib/article-queries";
import type { ArticleFrontmatter } from "@/lib/types";

async function StatsSection() {
  await connection();
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
  await connection();
  let articles: ArticleFrontmatter[] = [];
  try {
    articles = await getAllPublishedArticles();
  } catch {
    // No articles
  }
  if (articles.length === 0) return null;
  return <HomeArticles articles={articles} />;
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
              Desa Tulungrejo secara administratif terletak di Kecamatan
              Bumiaji, Kota Wisata Batu, Jawa Timur. Berada di kawasan dataran
              tinggi lereng Gunung Welirang dengan ketinggian sekitar 1.200
              meter di atas permukaan laut, menjadikan desa ini memiliki hawa
              yang sejuk dan tanah yang sangat subur.
            </p>
            <p>
              Desa Tulungrejo dikenal luas sebagai salah satu sentra penghasil
              apel varietas unggul seperti Apel Manalagi dan Apel Rome Beauty di
              Indonesia. Mayoritas penduduk di sini menggantungkan hidupnya pada
              sektor pertanian hortikultura, peternakan sapi perah, serta
              pengembangan pariwisata berbasis agrowisata alam yang terus
              berkembang pesat dari tahun ke tahun.
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

      <Suspense fallback={null}>
        <StatsSection />
      </Suspense>

      <Suspense fallback={null}>
        <ArticlesSection />
      </Suspense>
    </div>
  );
}
