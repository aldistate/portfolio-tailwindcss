# Portfolio — Aldi Putra Nawasta

Website portofolio statis milik **Aldi Putra Nawasta**, dibangun dengan HTML, Tailwind CSS, dan JavaScript tanpa framework tambahan.

## Teknologi

- **HTML5** — satu halaman dengan section Home, About, Skills, Projects, dan Contact.
- **Tailwind CSS 3** — styling, design token, dan build CSS.
- **JavaScript (vanilla)** — render project cards, navigasi mobile, menu aktif, efek mengetik, dan tombol salin email.
- Tanpa dependency runtime eksternal. Typed.js dari CDN sudah dihapus dan diganti implementasi kecil di `js/main.js`.

## Struktur Project

```text
portfolio-tailwindcss/
├── index.html              # Semua markup halaman
├── src/input.css           # Sumber CSS Tailwind + komponen reusable
├── css/style.css           # HASIL BUILD (jangan diedit manual)
├── js/
│   ├── projects.js         # DATA PROJECT — edit di sini untuk menambah project
│   └── main.js             # Render card + interaksi UI
├── img/
│   ├── aldiputra.png       # Foto hero
│   └── portfolio/          # Screenshot project (WebP untuk website, PNG asli disimpan)
├── ico/favicon2.ico
├── tailwind.config.js      # Warna brand, container, shadow
└── package.json
```

## Menjalankan Project

```bash
npm install        # hanya pertama kali
npm run dev        # build CSS sambil watch (untuk development)
npm run build      # build CSS minified (sebelum deploy)
npm run check      # cek sintaks file JavaScript
```

Buka `index.html` langsung di browser, atau gunakan ekstensi Live Server di editor.

> `css/style.css` adalah file hasil build. Setiap kali mengubah class Tailwind di `index.html` atau `js/main.js`, jalankan `npm run build` (atau biarkan `npm run dev` berjalan).

## Menambah Project Baru

Semua data project berada di **`js/projects.js`**. Tidak perlu menyalin markup card di `index.html`.

1. Buka `js/projects.js`.
2. Salin satu object di dalam array `portfolioProjects`.
3. Isi field sesuai data project yang sebenarnya.
4. Simpan, lalu jalankan `npm run build` jika ada class baru.
5. Buka `index.html` dan pastikan card baru muncul.

### Field Project

| Field         | Wajib | Keterangan                                                              |
| ------------- | :---: | ----------------------------------------------------------------------- |
| `title`       |  Ya   | Nama project.                                                           |
| `category`    |  Ya   | Jenis project, mis. `"Website"` atau `"REST API"`.                      |
| `description` |  Ya   | Deskripsi singkat: apa yang dibangun dan masalah yang diselesaikan.     |
| `techStack`   |  Ya   | Array teknologi yang benar-benar dipakai.                               |
| `image`       | Tidak | Path gambar, mis. `"./img/portfolio/4.png"`. `null` = pakai placeholder. |
| `imageAlt`    | Tidak | Deskripsi gambar untuk aksesibilitas.                                   |
| `context`     | Tidak | Konteks project, mis. `"Final project · Bootcamp"`.                     |
| `role`        | Tidak | Peran/kontribusi Anda, mis. `"Backend developer"`.                      |
| `demoUrl`     | Tidak | URL demo. Gunakan `null` jika belum ada.                                |
| `repoUrl`     | Tidak | URL repository publik. Gunakan `null` jika tidak dipublikasikan.        |
| `published`   | Tidak | `false` untuk menyembunyikan project. Default `true`.                   |

### Menambah Screenshot

1. Simpan gambar di `img/portfolio/`.
2. Gunakan rasio **16:10** (disarankan 1200 × 750 px), format WebP (disarankan) atau PNG, ukuran di bawah 300 KB.
3. Isi `image: "./img/portfolio/nama-file.png"`.
4. Tulis `imageAlt` yang menjelaskan isi screenshot, bukan sekadar nama file.

Jika gambar belum tersedia, biarkan `image: null`; card akan menampilkan placeholder.

### Mengatur Urutan dan Menyembunyikan Project

- **Urutan** mengikuti urutan object di array: object paling atas tampil lebih dulu.
- **Sembunyikan** project yang belum siap dengan `published: false`. Tidak perlu menghapus datanya.
- **Demo/repository** harus berupa URL lengkap `https://...` atau `null`. Link otomatis dibuka di tab baru dengan `rel="noopener noreferrer"`.

## Menambahkan CV

File CV **belum tersedia** di repository ini, sehingga tombol Download CV pada versi sebelumnya dihapus agar tidak menghasilkan link rusak.

Jika CV sudah siap:

1. Simpan file di `cv/Aldi-Putra-Nawasta.pdf`.
2. Tambahkan tombol berikut di samping tombol **View projects** pada hero:

```html
<a
  href="./cv/Aldi-Putra-Nawasta.pdf"
  class="btn btn-secondary"
  download
>
  Download CV
</a>
```

## Catatan Kontak

Form kontak lama tidak memiliki backend/action sehingga tidak benar-benar mengirim pesan. Section Contact sekarang menggunakan:

- tombol **Email me** dengan `mailto:aldistate@yahoo.com`;
- tombol **Copy email**;
- tautan sosial yang sudah ada (LinkedIn, GitHub, Instagram, YouTube, Facebook, X, TikTok).

Untuk mengganti email, cari `aldistate@yahoo.com` di `index.html` dan ganti semua kemunculannya (termasuk `data-copy-email`).

## Deployment

Website ini sepenuhnya statis. Jalankan `npm run build`, lalu deploy `index.html`, folder `css/`, `js/`, `img/`, dan `ico/` ke hosting statis (GitHub Pages, Netlify, Vercel, cPanel, dsb.).

## Aksesibilitas & Performa

- Skip link, landmark, hierarki heading, dan `aria` pada navigasi.
- Focus state yang jelas untuk keyboard.
- Menu mobile memakai `<details>` sehingga tetap berfungsi tanpa JavaScript.
- Animasi mengetik dan transisi menghormati `prefers-reduced-motion`.
- Gambar project memakai `loading="lazy"` dan `decoding="async"`.
- Meta description, Open Graph, Twitter Card, dan JSON-LD dasar sudah disertakan.
