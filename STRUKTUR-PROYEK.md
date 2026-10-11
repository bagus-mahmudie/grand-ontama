# Rancangan Struktur Grand Ontama

## Tujuan

Proyek sumber menggunakan Eleventy + Nunjucks + Vanilla JavaScript + Tailwind CSS + Bootstrap Icons. Proses build dilakukan di komputer lokal/CI, sedangkan cPanel hanya menerima hasil build statis dan endpoint PHP untuk formulir kontak. `node_modules` tidak pernah diunggah ke hosting.

## Struktur sumber yang disarankan

```text
Grand-Ontama-Redesign/
|-- .eleventy.js
|-- .gitignore
|-- package.json
|-- package-lock.json
|-- README.md
|-- src/
|   |-- _data/
|   |   |-- site.js
|   |   |-- navigation.js
|   |   |-- properties.js
|   |   |-- facilities.js
|   |   |-- testimonials.js
|   |   `-- locations.js
|   |-- _includes/
|   |   |-- layouts/
|   |   |   |-- base.njk
|   |   |   |-- page.njk
|   |   |   |-- property.njk
|   |   |   |-- facility.njk
|   |   |   `-- article.njk
|   |   |-- partials/
|   |   |   |-- head.njk
|   |   |   |-- header.njk
|   |   |   |-- footer.njk
|   |   |   |-- mobile-menu.njk
|   |   |   |-- contact-form.njk
|   |   |   |-- property-card.njk
|   |   |   |-- facility-card.njk
|   |   |   |-- testimonial-card.njk
|   |   |   |-- faq.njk
|   |   |   `-- floating-whatsapp.njk
|   |   `-- sections/
|   |       |-- home-hero.njk
|   |       |-- home-benefits.njk
|   |       |-- home-properties.njk
|   |       |-- home-facilities.njk
|   |       |-- home-interiors.njk
|   |       |-- home-nearby.njk
|   |       |-- home-testimonials.njk
|   |       `-- home-cta.njk
|   |-- assets/
|   |   |-- css/
|   |   |   `-- input.css
|   |   |-- js/
|   |   |   |-- app.js
|   |   |   `-- modules/
|   |   |       |-- navigation.js
|   |   |       |-- carousel.js
|   |   |       |-- contact-form.js
|   |   |       |-- accordion.js
|   |   |       `-- gallery.js
|   |   |-- img/
|   |   |-- audio/
|   |   `-- video/
|   |-- blog/
|   |   |-- blog.json
|   |   |-- cara-jual-rumah-ke-bank.njk
|   |   |-- harga-pasaran-rumah-2026.njk
|   |   |-- mimpi-beli-rumah.njk
|   |   |-- pajak-jual-beli-rumah.njk
|   |   |-- pemasaran-properti.njk
|   |   |-- renovasi-sebelum-jual-rumah.njk
|   |   |-- tips-foto-rumah-dijual.njk
|   |   `-- tips-jual-rumah.njk
|   |-- properti/
|   |   |-- luxora.njk
|   |   |-- verona.njk
|   |   `-- melodia.njk
|   |-- fasilitas/
|   |   |-- lapangan-padel.njk
|   |   |-- lapangan-tenis.njk
|   |   `-- mushola.njk
|   |-- galeri/
|   |   |-- luxora.njk
|   |   |-- verona.njk
|   |   `-- melodia.njk
|   |-- index.njk
|   |-- tentang-kami.njk
|   |-- rumah-dijual.njk
|   |-- blogs.njk
|   |-- 404.njk
|   |-- robots.njk
|   |-- sitemap.njk
|   |-- sitemap.xsl
|   |-- manifest.webmanifest
|   `-- sw.js
|-- server/
|   |-- mailer/
|   |   `-- send-contact.php
|   `-- composer.json
|-- deploy/
|   |-- .htaccess
|   `-- build-cpanel.ps1
`-- _site/                     # hasil build; isi folder ini diunggah ke public_html
    |-- assets/
    |-- mailer/
    |-- vendor/
    |-- index.html
    |-- tentang-kami.html
    |-- rumah-dijual.html
    |-- blogs.html
    |-- ...
    `-- .htaccess
```

## Pembagian tanggung jawab

- `_data/site.js`: identitas perusahaan, domain, telepon, email publik, alamat, media sosial, Google Analytics/Tag Manager, dan kunci publik reCAPTCHA.
- `_data/properties.js`: konten Luxora, Verona, dan Melodia agar kartu, halaman detail, dan rekomendasi memakai satu sumber data.
- `_includes/layouts`: kerangka SEO, metadata Open Graph, header/footer, dan slot konten.
- `_includes/partials`: komponen yang dipakai lintas halaman.
- `_includes/sections`: blok khusus halaman beranda agar `index.njk` tetap ringkas.
- `assets/js`: JavaScript murni dan modular; jQuery/Owl Carousel dari proyek lama dapat diganti carousel ringan buatan sendiri.
- `server/mailer`: satu-satunya bagian runtime PHP. PHPMailer/vendor disalin saat paket deployment dibuat.
- `_site`: keluaran final untuk cPanel; tidak berisi Nunjucks, source Tailwind, atau `node_modules`.

## Pemetaan URL lama

URL publik lama sebaiknya dipertahankan agar backlink dan indeks Google tidak rusak:

| URL | Sumber baru | Layout |
|---|---|---|
| `/` | `src/index.njk` | `base.njk` |
| `/tentang-kami` | `src/tentang-kami.njk` | `page.njk` |
| `/rumah-dijual` | `src/rumah-dijual.njk` | `page.njk` |
| `/blogs` | `src/blogs.njk` | `page.njk` |
| `/luxora`, `/verona`, `/melodia` | `src/properti/*.njk` | `property.njk` |
| `/galery-luxora`, `/galery-verona`, `/galery-melodia` | `src/galeri/*.njk` | `page.njk` |
| `/lapangan-padel`, `/lapangan-tenis`, `/mushola` | `src/fasilitas/*.njk` | `facility.njk` |
| delapan URL artikel lama | `src/blog/*.njk` | `article.njk` |

Nama URL `galery-*` yang ejaannya lama dipertahankan sebagai permalink untuk kompatibilitas. Nama folder sumber boleh menggunakan `galeri` yang benar.

## Alur build dan deployment cPanel

1. `npm install` hanya dijalankan di komputer pengembangan.
2. `npm run build:css` menghasilkan CSS Tailwind yang sudah minified.
3. `npm run build:site` menjalankan Eleventy ke `_site`.
4. Script deployment menyalin `.htaccess`, endpoint PHP, dan hasil Composer production ke `_site`.
5. Isi `_site` dikompres dan diunggah ke `public_html`.

`package.json` nantinya minimal memiliki perintah `dev`, `build:css`, `build:site`, `build`, dan `package:cpanel`.

## Keamanan konfigurasi formulir

- Jangan simpan password SMTP atau secret reCAPTCHA di repository maupun di dalam ZIP deployment publik.
- Simpan konfigurasi rahasia di luar `public_html`, misalnya satu tingkat di atasnya, lalu `send-contact.php` membacanya dengan path server.
- Jika cPanel mendukung environment variables, gunakan itu sebagai pilihan utama.
- Kredensial yang pernah berada dalam ZIP lama sebaiknya dirotasi sebelum versi baru dipublikasikan.
- Endpoint tetap melakukan validasi server-side, verifikasi reCAPTCHA, rate limiting, pembatasan metode POST, dan respons JSON tanpa membocorkan detail error.

## Keputusan kompatibilitas

- Hasil akhir tetap berupa `.html` agar cocok dengan aturan `.htaccess` lama yang menyajikan URL tanpa ekstensi.
- Semua URL aset menggunakan path absolut dari root, misalnya `/assets/img/...`, agar aman pada halaman bersarang.
- Bootstrap Icons dapat tetap memakai CDN pada tahap awal; untuk ketahanan tanpa CDN, font dan CSS-nya dapat disalin ke aset lokal saat build.
- AOS dan Owl Carousel dari versi lama tidak wajib dipertahankan. Efek reveal menggunakan `IntersectionObserver`, sedangkan carousel menggunakan Vanilla JS.
- Sitemap dibuat otomatis dari koleksi Eleventy sehingga tanggal dan daftar URL tidak perlu diperbarui manual.

## Urutan implementasi

1. Scaffold Eleventy, Tailwind, passthrough assets, dan skrip build cPanel.
2. Pindahkan aset lama tanpa mengubah nama file terlebih dahulu.
3. Bangun `base.njk`, header, footer, SEO, dan navigasi aktif.
4. Migrasikan beranda per section.
5. Migrasikan tiga properti, galeri, dan fasilitas melalui layout/data bersama.
6. Migrasikan indeks blog dan artikel.
7. Integrasikan ulang formulir PHP secara aman.
8. Buat sitemap, robots, 404, service worker, dan `.htaccess`.
9. Uji responsive, link, formulir, Lighthouse, dan paket ZIP cPanel tanpa `node_modules`.
