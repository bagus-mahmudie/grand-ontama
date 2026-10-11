const propertyDetails = {
  Melodia: { href: "/rumah-tangsel", label: "Rumah 2 Lantai", bedrooms: "2 Kamar Tidur", bathrooms: "1 Kamar Mandi", area: "92 m²", price: "Rp 1.043.130.000" },
  Verona: { href: "/rumah-2-lantai-di-bogor", label: "Rumah Mewah", bedrooms: "3 Kamar Tidur", bathrooms: "2 Kamar Mandi", area: "102 m²", price: "Rp 1.217.130.000" },
  Luxora: { href: "/jual-rumah", label: "Rumah Premium", bedrooms: "3 Kamar Tidur", bathrooms: "2 Kamar Mandi", area: "105 m²", price: "Rp 1.391.130.000" }
};

const facilityDetails = [
  { title: "Garden", description: "Ruang hijau asri untuk bersantai bersama keluarga setiap hari." },
  { title: "Lapangan Padel", description: "Nikmati olahraga padel seru bersama keluarga dan komunitas sekitar." },
  { title: "Lapangan Tenis", description: "Berolahraga aktif dan menyenangkan bersama keluarga di lingkungan nyaman." },
  { title: "Community Hall", description: "Ruang berkumpul untuk berbagai kegiatan komunitas dan keluarga bersama." },
  { title: "ClubHouse", description: "Tempat bersantai dan menikmati waktu berkualitas bersama keluarga tercinta." },
  { title: "One Gate System", description: "Kawasan terkontrol untuk menciptakan lingkungan hunian yang lebih nyaman." },
  { title: "CCTV 24 Jam", description: "Pemantauan kawasan sepanjang waktu untuk menjaga keamanan lingkungan." },
  { title: "Security 24 Jam", description: "Petugas keamanan siaga membantu menjaga kenyamanan lingkungan penghuni." }
];

function properties(page, names, alts) {
  return names.map((name, index) => ({ name, ...propertyDetails[name], image: `/assets/img/pages/${page}/${alts[index]}.png`, alt: alts[index] }));
}

function facilities(page, alts) {
  const extensions = ["jpg", "webp", "webp", "jpg", "png", "png", "png", "png"];
  const melodiaOverrides = [
    { title: "Taman", description: "Ruang hijau asri untuk bersantai dan menikmati waktu luang setiap hari." },
    { description: "Nikmati olahraga padel seru bersama teman di area olahraga yang nyaman." },
    { description: "Berolahraga aktif dan menyenangkan untuk mendukung gaya hidup sehat setiap hari." }
  ];
  return facilityDetails.map((facility, index) => ({ ...facility, ...(page === "melodia" ? melodiaOverrides[index] : {}), image: `/assets/img/pages/${page}/${alts[index]}.${extensions[index]}`, alt: alts[index] }));
}

export default {
  homepage: {
    properties: properties("homepage", ["Melodia", "Verona", "Luxora"], ["grand-ontama-tipe-melodia", "grand-ontama-tipe-verona", "grand-ontama-tipe-luxora"]),
    facilities: facilities("homepage", ["taman-grand-ontama", "lapangan-padel-grand-ontama", "lapangan-tenis-grand-ontama", "community-hall-grand-ontama", "clubhouse-grand-ontama", "one-gate-system-grand-ontama", "cctv-24-jam-grand-ontama", "security-24-jam-grand-ontama"]),
    interiors: ["grand-ontama-bogor", "grand-ontama-gunung-sindur", "perumahan-grand-ontama", "info-grand-ontama", "beli-grand-ontama", "hunian-grand-ontama", "fasilitas-grand-ontamaa", "lokasi-grand-ontama", "rumah-grand-ontama", "beli-rumah-grand-ontama"].map((alt) => ({ image: `/assets/img/pages/homepage/${alt}.png`, alt })),
    locations: [
      { title: "Stasiun Terdekat", description: "Mobilitas tanpa batas! Stasiun Cisauk, Stasiun Rawa Buntu, dan Stasiun Serpong.", images: ["akses-stasiun-cisauk-grand-ontama", "akses-transportasi-grand-ontama"] },
      { title: "Rumah Sakit Terdekat", description: "Dekat rumah sakit ternama seperti RS Permata Pamulang, RS Hermina Serpong, RS Brawijaya Depok.", images: ["akses-rs-permata", "lokasi-strategis-grand-ontama"], default: true },
      { title: "Mall Terdekat", description: "Dikelilingi pusat belanja seperti ICE BSD, AEON BSD, THE BREEZE.", images: ["kawasan-strategis-grand-ontama", "lokasi-perumahan-grand-ontama"] },
      { title: "Universitas Terdekat", description: "Lokasi strategis! Akses mudah ke Universitas Pamulang, Universitas Technology Indonesia, Universitas Prasetiya Mulya.", images: ["kampus-kawasan-grand-ontama", "universitas-dekat-grand-ontama"] }
    ].map((location) => ({
      ...location,
      alts: location.images,
      sources: location.images.map((alt) => `/assets/img/pages/homepage/${alt}.webp`)
    }))
  },
  rumahDijual: {
    properties: properties("rumah-dijual", ["Melodia", "Verona", "Luxora"], ["rumah-dijual", "rumah-dijual-di-bogor", "rumah-dijual-dekat-stasiun-cisauk"]),
    facilities: facilities("rumah-dijual", ["taman-rumah-dijual", "padel-rumah-dijual", "tenis-rumah-dijual", "hall-rumah-dijual", "clubhouse-rumah-dijual", "gate-rumah-dijual", "cctv-rumah-dijual", "security-rumah-dijual"])
  },
  melodia: {
    properties: properties("melodia", ["Melodia", "Verona", "Luxora"], ["hunian-eropa-curug-bogor", "perumahan-klasik-grand-ontama", "rumah-eropa-grand-ontama"]),
    facilities: facilities("melodia", ["taman-perumahan-tipe-melodia", "fasilitas-padel-tipe-melodia", "area-tenis-tipe-melodia", "hall-komunitas-tipe-melodia", "clubhouse-mewah-tipe-melodia", "akses-gerbang-tipe-melodia", "area-cctv-tipe-melodia", "pos-keamanan-tipe-melodia"])
  },
  verona: {
    properties: properties("verona", ["Melodia", "Verona", "Luxora"], ["rumah-3-kamar-bogor", "rumah-2-lantai-bogor", "rumah-lt-72-bogor"]),
    facilities: facilities("verona", ["taman-hijau-grand-ontama", "lapangan-padel-tipe-verona", "lapangan-tenis-tipe-verona", "community-hall-tipe-verona", "modern-clubhouse-grand-ontama", "gerbang-one-gate-system", "area-pantauan-cctv-perumahan", "pos-sekuriti-tipe-verona"])
  },
  luxora: {
    properties: properties("luxora", ["Melodia", "Verona", "Luxora"], ["promo-rumah-keluarga-premium", "jual-rumah-premium", "investasi-rumah-mewah-luxora"]),
    facilities: facilities("luxora", ["taman-asri-luxora", "lapangan-padel-luxora", "lapangan-tenis-luxora", "community-hall-luxora", "clubhouse-mewah-luxora", "one-gate-system-luxora", "cctv-24-jam-luxora", "security-24-jam-luxora"])
  }
};
