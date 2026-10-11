# Grand Ontama

Website perumahan Grand Ontama dengan informasi tipe rumah, fasilitas, galeri, dan artikel properti.

**Status:** Live · [Buka website](https://grandontama.com/)

## Fitur

- Halaman detail properti dan fasilitas kawasan
- Pengolahan gambar responsif saat build
- Formulir kontak dengan SMTP dan reCAPTCHA

## Teknologi

Eleventy 3, Nunjucks, Tailwind CSS 4, Sharp, PHP.

## Menjalankan secara lokal

Pasang Node.js dan npm sesuai persyaratan dependensi pada `package-lock.json`.

```sh
npm ci
npm run dev
```

Buka alamat server yang ditampilkan di terminal. Untuk build:

```sh
npm run build
```

Hasil build berada di `_site/`. Folder hasil build tidak menjadi sumber utama repository.

## Struktur

- `src/` — halaman, template, data, dan aset.
- `.eleventy.js` — konfigurasi generator website.
- `package.json` — dependensi dan perintah pengembangan.

## Deployment

Konfigurasi email disediakan melalui `server/config.example.php`; ikuti lokasi konfigurasi yang digunakan `server/mailer/send-contact.php`. Jalankan `composer install --working-dir=server` untuk memasang PHPMailer sebelum deployment. Sertifikat unit dan dokumen pemeriksaan tanah tidak disertakan dalam repository.

Versi awal tersedia sebagai proyek terpisah: [Grand Ontama V1](https://github.com/bagus-mahmudie/grand-ontama-v1).

## Konfigurasi privat

Salin template berikut ke nama file lokalnya, lalu isi nilai untuk lingkungan Anda:

| Template | File lokal |
| --- | --- |
| `grand-ontama-config.example.php` | `grand-ontama-config.php` |

File konfigurasi lokal diabaikan oleh Git. Jangan memasukkan password, API key, atau data akun ke source code.

## Catatan repository

Dependensi terpasang, cache, file `.env`, database, dan unggahan pengguna tidak disertakan. Nama merek dan aset pihak ketiga tetap mengikuti hak pemiliknya. Tidak ada lisensi penggunaan ulang yang diberikan melalui repository ini.
