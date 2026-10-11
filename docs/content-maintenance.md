# Pembaruan konten

- Data kartu Blog dan artikel terkait otomatis berasal dari metadata artikel `.njk`. Tidak perlu mendaftarkan artikel di `blogData.js`; file tersebut menyimpan kategori dan membaca metadata artikel setiap build.
- Isi `category`, `cardImage`, dan `cardAlt` pada artikel. Judul/deskripsi kartu mengikuti `ogTitle`/`description`; gunakan `cardTitle` atau `cardDescription` hanya jika teks kartu sengaja berbeda.
- Urutan berdasarkan `publishedAt` terbaru; `cardOrder` mengatur urutan jika tanggal sama. `updatedAt` tidak memindahkan urutan atau mengubah tanggal terbit kartu.

- `publishedAt` adalah tanggal terbit awal artikel. Jangan menggantinya ketika merevisi artikel.
- Ubah `updatedAt` pada front matter halaman yang direvisi ke tanggal perubahan signifikan sebenarnya (`YYYY-MM-DD`). Nilai ini digunakan untuk sitemap, `article:modified_time`, dan `dateModified` JSON-LD; tanggal terbit yang terlihat tidak berubah.
- Jangan memperbarui `updatedAt` hanya karena menjalankan build atau mengubah CSS. Nilai 2026-09-09 menandai pembaruan metadata/structured data pada pengerjaan ini.
- Artikel baru perlu `publishedAt` dan `updatedAt` dengan tanggal penerbitannya. Sitemap mengambil tanggal tersebut, tidak memakai waktu build.
- Konten detail properti berada di `src/_data/propertyDetails.js`, struktur bersama di `src/_includes/components/property-detail.njk`. Metadata/schema tiap properti tetap di `src/properti/*.njk`.
- Build membuat WebP responsif dari aset asli ke `_site/assets/responsive/{width}/...`, mempertahankan nama dasar file dan folder sumber. Aset asli dan duplikat tidak dihapus. Unggah seluruh isi `_site`, termasuk `assets/responsive` dan `assets/generated`.
- Karena nama file/cache gambar dipertahankan sesuai permintaan, penggantian gambar pada URL yang sama mungkin membutuhkan purge cache hosting/browser.
