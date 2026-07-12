// Phase 4: Profile page with DB-backed data + hardcoded fallback
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { VILLAGE_PROFILE_DATA, STATS_SEED } from "@/lib/desa-data";
import { Compass, School, HeartPulse, Award } from "lucide-react";
import { safeJsonParse } from "@/lib/utils";

async function ProfileContent() {
  const dbProfile = await prisma.villageProfile
    .findFirst({ orderBy: { id: "asc" } })
    .catch(() => null);
  const profile = dbProfile
    ? {
        visi: dbProfile.visi,
        misi: safeJsonParse<string[]>(
          dbProfile.misi,
          VILLAGE_PROFILE_DATA.misi,
        ),
        strukturOrganisasi: safeJsonParse<{ role: string; name: string }[]>(
          dbProfile.strukturOrganisasi,
          VILLAGE_PROFILE_DATA.strukturOrganisasi,
        ),
        tugasFungsi: safeJsonParse<{ jabatan: string; tugas: string }[]>(
          dbProfile.tugasFungsi,
          VILLAGE_PROFILE_DATA.tugasFungsi,
        ),
        administratif: safeJsonParse<Record<string, string>>(
          dbProfile.administratif,
          VILLAGE_PROFILE_DATA.administratif,
        ),
      }
    : VILLAGE_PROFILE_DATA;

  return <ProfileDisplay profile={profile} />;
}

async function ProfileDisplay({
  profile,
}: {
  profile: {
    visi: string;
    misi: string[];
    strukturOrganisasi: { role: string; name: string }[];
    tugasFungsi: { jabatan: string; tugas: string }[];
    administratif: Record<string, string>;
  };
}) {
  const dbStats = await prisma.villageStats.findFirst({
    orderBy: { id: "asc" },
  });
  const stats = dbStats ?? STATS_SEED;

  const kades = profile.strukturOrganisasi.find(
    (p) => p.role.toLowerCase() === "kepala desa",
  );
  const sekdes = profile.strukturOrganisasi.find(
    (p) => p.role.toLowerCase() === "sekretaris desa",
  );
  const kasis = profile.strukturOrganisasi.filter((p) =>
    p.role.toLowerCase().startsWith("kasi"),
  );
  const kaurs = profile.strukturOrganisasi.filter((p) =>
    p.role.toLowerCase().startsWith("kaur"),
  );
  const kadus = profile.strukturOrganisasi.filter((p) =>
    p.role.toLowerCase().startsWith("kepala dusun"),
  );

  return (
    <div className="container">
      {/* Visi Misi */}
      <section className="visimisi-container">
        <div className="visi-card glass-panel">
          <h3>Visi Desa</h3>
          <p>&ldquo;{profile.visi}&rdquo;</p>
        </div>
        <div className="misi-card glass-panel">
          <h3>Misi Desa</h3>
          <ul className="misi-list">
            {profile.misi.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section className="org-structure-section">
        <h2>Struktur Organisasi Pemerintah Desa</h2>
        <div className="org-chart-wrapper">
          <div className="org-tree">
            {kades && (
              <div className="org-node">
                <div className="org-role">{kades.role}</div>
                <div className="org-name">{kades.name}</div>
              </div>
            )}
            {sekdes && (
              <div
                className="org-node"
                style={{ backgroundColor: "rgba(175, 143, 111, 0.15)" }}
              >
                <div className="org-role">{sekdes.role}</div>
                <div className="org-name">{sekdes.name}</div>
              </div>
            )}
            <div className="org-level-3">
              {kasis.map((kasi, idx) => (
                <div key={idx} className="org-node">
                  <div className="org-role">{kasi.role}</div>
                  <div className="org-name text-[13px]">{kasi.name}</div>
                </div>
              ))}
              {kaurs.map((kaur, idx) => (
                <div key={idx} className="org-node">
                  <div className="org-role">{kaur.role}</div>
                  <div className="org-name text-[13px]">{kaur.name}</div>
                </div>
              ))}
            </div>
            <div className="org-level-4">
              {kadus.map((kd, idx) => (
                <div key={idx} className="org-node border-dashed">
                  <div className="org-role">{kd.role}</div>
                  <div className="org-name">{kd.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tugas & Fungsi */}
      <section className="mb-[60px]">
        <h2 className="text-center mb-[35px]">Tugas & Fungsi Pemerintahan</h2>
        <div className="profile-tupoksi-grid">
          {profile.tugasFungsi.map((item, index) => (
            <div key={index} className="tupoksi-item glass-panel">
              <h4>
                <Award size={18} className="text-dark-brown" />
                <span>{item.jabatan}</span>
              </h4>
              <p>{item.tugas}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Administratif */}
      <section className="mb-[70px]">
        <h2 className="text-center mb-[35px]">
          Data Administratif & Layanan Desa
        </h2>
        <div className="visimisi-container">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Indikator Wilayah</th>
                  <th>Detail Informasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Jumlah Kepala Keluarga (KK)</strong>
                  </td>
                  <td>{stats.jumlahKK.toLocaleString("id-ID")} KK</td>
                </tr>
                <tr>
                  <td>
                    <strong>Jumlah Penduduk</strong>
                  </td>
                  <td>
                    {stats.jumlahPenduduk.toLocaleString("id-ID")} Jiwa
                    <span className="text-muted text-xs ml-[10px]">
                      ({stats.lakiLaki.toLocaleString("id-ID")} Laki-laki,{" "}
                      {stats.perempuan.toLocaleString("id-ID")} Perempuan)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Luas Wilayah Kerja</strong>
                  </td>
                  <td>{profile.administratif.luasWilayah}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Koordinat Wilayah</strong>
                  </td>
                  <td>
                    <code>{profile.administratif.koordinat}</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Mata Pencaharian Utama</strong>
                  </td>
                  <td>{profile.administratif.mataPencaharianUtama}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Sarana Pendidikan</strong>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      <School size={14} />
                      {profile.administratif.saranaPendidikan}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Sarana Kesehatan</strong>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      <HeartPulse size={14} />
                      {profile.administratif.saranaKesehatan}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="glass-panel p-[35px] flex flex-col gap-5">
            <h3 className="text-[20px] flex items-center gap-[10px]">
              <Compass size={20} />
              <span>Batas Wilayah Administratif</span>
            </h3>
            {(
              [
                {
                  title: "Sebelah Utara",
                  value: profile.administratif.batasUtara,
                },
                {
                  title: "Sebelah Selatan",
                  value: profile.administratif.batasSelatan,
                },
                {
                  title: "Sebelah Timur",
                  value: profile.administratif.batasTimur,
                },
                {
                  title: "Sebelah Barat",
                  value: profile.administratif.batasBarat,
                },
              ] as const
            ).map((item) => (
              <div
                key={item.title}
                className="pl-[15px]"
                style={{ borderLeft: "3px solid var(--color-secondary-tan)" }}
              >
                <span className="text-[11px] uppercase font-bold text-muted-foreground">
                  {item.title}
                </span>
                <p className="font-semibold text-[14px]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="container">
          <h1>Profil Pemerintahan Desa</h1>
          <p>
            Sejarah, Visi Misi, Struktur Organisasi, dan Selayang Pandang
            Administratif Desa Tulungrejo
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
