export const VILLAGE_PROFILE_DATA = {
  visi: "Terwujudnya Desa Tulungrejo yang Mandiri, Sejahtera, Berbudaya, dan Berkeadilan Berlandaskan Gotong Royong.",
  misi: [
    "Meningkatkan kualitas pelayanan publik berbasis teknologi informasi.",
    "Mengembangkan sektor pertanian, peternakan, dan pariwisata yang berkelanjutan.",
    "Meningkatkan kualitas SDM melalui pendidikan dan sarana kesehatan yang memadai.",
    "Mewujudkan tata kelola pemerintahan desa yang bersih, transparan, dan akuntabel.",
  ],
  strukturOrganisasi: [
    { role: "Kepala Desa", name: "Ir. H. Sulaiman Basri" },
    { role: "Sekretaris Desa", name: "Dewi Anggraini, S.E." },
    { role: "Kasi Pemerintahan", name: "Bambang Triyono" },
    { role: "Kasi Kesejahteraan", name: "Fajar Nugroho, S.Pd." },
    { role: "Kasi Pelayanan", name: "Siti Kurniati" },
    { role: "Kaur Keuangan", name: "Rahmat Hidayat" },
    { role: "Kaur Umum & Perencanaan", name: "Novi Fitriani" },
    { role: "Kepala Dusun Junggo", name: "Jatmiko Wibowo" },
    { role: "Kepala Dusun Wonorejo", name: "Subagyo" },
  ],
  tugasFungsi: [
    {
      jabatan: "Kepala Desa",
      tugas:
        "Menyelenggarakan Pemerintahan Desa, melaksanakan Pembangunan Desa, pembinaan kemasyarakatan Desa, dan pemberdayaan masyarakat Desa.",
    },
    {
      jabatan: "Sekretaris Desa",
      tugas:
        "Memimpin, mengoordinasikan, dan mengendalikan urusan ketatausahaan, umum, perencanaan, dan keuangan serta memberikan pelayanan administratif bagi perangkat desa dan masyarakat.",
    },
    {
      jabatan: "Seksi Pemerintahan (Kasi Pemerintahan)",
      tugas:
        "Menyusun rencana, melaksanakan, mengevaluasi dan melaporkan pelaksanaan program administrasi kependudukan, ketentraman dan ketertiban umum, serta pertanahan desa.",
    },
    {
      jabatan: "Seksi Kesejahteraan (Kasi Kesejahteraan)",
      tugas:
        "Melaksanakan pembangunan infrastruktur perdesaan, pembinaan kepemudaan, olahraga, keagamaan, serta pengelolaan bantuan sosial masyarakat.",
    },
    {
      jabatan: "Seksi Pelayanan (Kasi Pelayanan)",
      tugas:
        "Membantu penyediaan sarana dan prasarana pelayanan administrasi, pelayanan sosial dasar, serta pemberdayaan ekonomi masyarakat.",
    },
  ],
  administratif: {
    koordinat: "-7.8207° LS, 112.5262° BT",
    batasUtara: "Berbatasan dengan Desa Sumberarum dan Desa Ringinrejo.",
    batasSelatan: "Berbatasan dengan Desa Purworejo.",
    batasTimur: "Berbatasan dengan wilayah Kabupaten Malang.",
    batasBarat: "Berbatasan dengan Kawasan Hutan atau area perkebunan.",
    luasWilayah: "2 Dusun (Junggo & Wonorejo), Total Luas 342,5 Hektar",
    mataPencaharianUtama: "Petani, Peternak, dan Pengelola Wisata Alam",
    saranaPendidikan: "2 Taman Kanak-Kanak (TK) dan 3 Sekolah Dasar (SD)",
    saranaKesehatan: "1 Pos Kesehatan Desa (Postu) Tulungrejo",
  },
};

export const STATS_SEED = {
  jumlahKK: 1420,
  jumlahPenduduk: 4850,
  lakiLaki: 2410,
  perempuan: 2440,
};

export const HEAD_MESSAGE = {
  name: "Ir. H. Sulaiman Basri",
  title: "Kepala Desa Tulungrejo",
  message:
    "Assalamu'alaikum Wr. Wb. Puji syukur kehadirat Allah SWT atas limpahan rahmat dan karunia-Nya sehingga website Resmi Desa Tulungrejo dapat hadir sebagai portal informasi dan layanan publik. Semoga website ini bermanfaat bagi seluruh masyarakat dan pihak yang membutuhkan informasi tentang Desa Tulungrejo.",
};

export const CONTACT_INFO = {
  address: "Desa Tulungrejo, Kecamatan Wates, Kabupaten Blitar, Jawa Timur",
  phone: "085791371559",
  email: "tulungrejo.gandusari.pemdes@gmail.com",
  jamKerja: "Senin-Jumat 08:00-16:00",
  jamLibur: "Sabtu-Minggu",
  socialMedia: [
    { platform: "Facebook", url: "#" },
    { platform: "YouTube", url: "#" },
  ],
  coordinates: [-7.8207, 112.5262] as [number, number],
};
