# Portfolio — Aldi Putra Nawasta

Website portofolio statis milik **Aldi Putra Nawasta**, dibangun dengan HTML, Tailwind CSS, dan JavaScript tanpa framework tambahan.

## Teknologi

- **HTML5** — satu halaman dengan section Home, quote interlude, About, Skills, Projects, dan Contact.
- **Tailwind CSS 3** — styling, design token, dan build CSS.
- **JavaScript (vanilla)** — render project cards, dialog detail project, navigasi mobile, floating menu setelah scroll, jam Asia/Jakarta, scroll reveal, custom cursor, parallax ringan, magnetic hover, efek mengetik, dan tombol salin email.
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
| `details`     | Tidak | Object info tambahan untuk dialog detail (lihat di bawah).              |

### Detail Project Dialog

Satu object project dipakai untuk card **dan** dialog detail. Tambahkan `details` hanya jika datanya benar-benar tersedia; jangan mengarang isi.

```js
details: {
  overview: "Penjelasan lengkap project.",
  problem: "Masalah atau kebutuhan yang diselesaikan.",
  role: "Peran dan kontribusi konkret.",
  features: [
    "Fitur utama yang benar-benar tersedia",
    "Fitur utama lainnya",
  ],
}
```

- Semua sub-field `details` opsional.
- `overview` kosong akan memakai `description`.
- `details.role` kosong akan memakai field `role` lama.
- `problem` dan `features` tidak dirender jika tidak diisi.
- Bagian **Project links** hanya muncul jika `demoUrl` atau `repoUrl` berisi URL valid.
- Dialog tidak pernah menampilkan teks `undefined`, `null`, atau link palsu.

Dialog dapat dibuka dari tombol **Explore project** atau dengan mengklik card. Dialog memakai elemen native `<dialog>`, menutup lewat tombol close, klik backdrop, atau `Escape`, mengunci scroll halaman, menjebak fokus keyboard, dan mengembalikan fokus ke card asal.

### Menambah Screenshot

1. Simpan gambar di `img/portfolio/`.
2. Gunakan rasio **16:10** (disarankan 1200 × 750 px), format WebP (disarankan) atau PNG, ukuran di bawah 300 KB.
3. Isi `image: "./img/portfolio/nama-file.png"`.
4. Tulis `imageAlt` yang menjelaskan isi screenshot, bukan sekadar nama file.

Card memakai gambar sebagai full-bleed background dan dialog menampilkan gambar dengan `object-cover`. Pastikan konten penting tetap terlihat saat gambar dipotong ke rasio 16:9 di dialog.

Jika gambar belum tersedia, biarkan `image: null`; card dan dialog akan menampilkan placeholder, bukan gambar rusak.

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

- tombol **Email me** dengan `mailto:aldi.putra.nawasta@gmail.com`;
- tombol **Copy email**;
- tautan sosial yang sudah ada (LinkedIn, GitHub, Instagram, YouTube, Facebook, X, TikTok).

Untuk mengganti email, cari `aldi.putra.nawasta@gmail.com` di `index.html` dan ganti semua kemunculannya (termasuk `data-copy-email` dan JSON-LD).

## Jam, Kutipan, dan Animasi

Semua animasi dibuat dengan CSS dan JavaScript vanilla; tidak ada library animasi tambahan.

### Jam Jakarta

- Konfigurasi ada di objek `CLOCK` pada bagian atas `js/main.js`: `timeZone: "Asia/Jakarta"` dan `label: "WIB"`.
- Semua elemen `[data-local-clock]` menampilkan waktu **HH:mm:ss WIB**, memakai `Intl.DateTimeFormat` dan `hourCycle: "h23"`.
- Jam diperbarui setiap detik tanpa reload, memakai angka tabular agar lebar tidak berubah. Nilai `datetime` diisi ISO timestamp.
- Timer dibersihkan saat tab disembunyikan atau `pagehide`; saat tab kembali terlihat, jam langsung disinkronkan lewat `visibilitychange`.
- Tanpa JavaScript, teks fallback `--:--:-- WIB` tetap tampil.

### Kutipan

Quote interlude memakai kutipan terverifikasi:

> “Simplicity is prerequisite for reliability.” — Edsger W. Dijkstra

Section ini berada di antara hero dan About, dengan reveal `clip`, tanda kutip dekoratif, dan metadata “A note on craft”. Tidak ada data pengalaman atau prestasi baru yang ditambahkan.

### Karakter motion per section

- **Hero** — entrance bertahap, efek mengetik, parallax foto, dan highlight portrait yang mengikuti pointer.
- **Quote** — heading clip reveal, tanda kutip berputar masuk, dan kicker dari kiri.
- **About** — heading clip reveal, paragraf bertahap, kartu fakta masuk dari kanan.
- **Skills** — header clip reveal, kartu muncul dengan scale dan stagger.
- **Projects** — header clip reveal, card muncul dari blur ke fokus, lalu image zoom dan lift saat hover/focus.
- **Contact** — panel masuk dari kiri dengan ambient glow.

### Konfigurasi `MOTION`

Objek `MOTION` di bagian atas `js/main.js` mengatur:

- `reveal.stagger`, `threshold`, `rootMargin`, dan `replay`;
- `launcher.showAfter` — jarak scroll sebelum launcher menggantikan navbar (default **420 px**);
- `magnetic.max` (default **8 px**), `magnetic.strength` (default **0.16**), dan `magnetic.lerp`;
- `cursor.enabled` dan `cursor.lerp`;
- `parallax.lerp`, `tilt.max`, `menu.*`, dan `modal.closeDuration`.

Durasi/easing CSS ada di variabel `:root` pada `src/input.css` (`--duration-fast`, `--duration-base`, `--duration-slow`, `--ease-out-expo`, `--reveal-distance`).

### Magnetic hover

- Hanya elemen dengan atribut `[data-magnetic]` yang bergerak: CTA hero, tombol kontak, social links, dan launcher.
- Intensitas per elemen dapat diatur dengan `data-magnetic-strength="0.16"`. Pergeseran dibatasi `MOTION.magnetic.max` (8 px) agar tetap subtle dan tidak mengubah layout.
- Efek hanya aktif pada pointer presisi (`hover: hover` dan `pointer: fine`), tidak pada layar sentuh.
- Gerak memakai `requestAnimationFrame` dan kembali halus ke posisi awal saat pointer keluar.
- Untuk mematikan magnetic pada elemen tertentu, hapus atribut `data-magnetic`; untuk mematikannya secara global, ubah `initMagneticElements()` agar langsung `return` atau hapus pemanggilannya.

### Floating menu setelah scroll

- Launcher bulat di kanan bawah muncul setelah scroll melewati `MOTION.launcher.showAfter` (420 px).
- Saat launcher aktif, navigasi desktop dan menu mobile `<details>` disembunyikan sehingga hanya ada satu sistem navigasi.
- Menu overlay berisi link bernomor 01–05, status aktif `aria-current`, jam Jakarta, social links, dan email.
- Launcher memakai `aria-expanded` dan `aria-controls`; menu memakai `role="dialog"`, `aria-modal`, focus trap, `Escape`, dan scroll lock.
- Latar belakang diberi `inert` selama menu terbuka. Setelah link dipilih, overlay ditutup, halaman menuju section, dan fokus dipindahkan ke heading section tersebut.
- Klik link, tombol close, atau `Escape` menutup menu. Tombol close tetap terlihat saat overlay di-scroll, dan pada layar sentuh seluruh kontrol dapat digunakan tanpa hover.
- Footer mendapat ruang tambahan saat launcher aktif agar tombol **Back to top** tidak tertutup.
- Tanpa JavaScript, launcher dan overlay tidak muncul; navigasi header biasa tetap berfungsi.

### Project detail dialog

- Card dan dialog memakai object project yang sama di `js/projects.js`.
- Detail memakai native `<dialog>`; fokus awal di tombol close, fokus keyboard dijebak di dalam modal, dan fokus kembali ke card setelah ditutup.
- Background scroll dikunci selama dialog terbuka. Custom cursor sementara dikembalikan ke kursor native karena dialog berada di top layer.
- Bagian opsional yang tidak diisi tidak dirender; tidak ada placeholder palsu.
- Lihat bagian **Detail Project Dialog** di atas untuk skema `details`.

### Reduced motion dan opsi mematikan efek

Jika `prefers-reduced-motion: reduce` aktif:

- entrance hero, typing, scroll reveal, ambient background, parallax, tilt, magnetic, dan custom cursor dinonaktifkan;
- konten dan quote tetap terlihat tanpa menunggu observer;
- menu dan dialog tetap berfungsi, dengan transisi yang dipersingkat dan penutupan dialog tanpa animasi.

Untuk mematikan efek tertentu:

- **Custom cursor:** ubah `MOTION.cursor.enabled` menjadi `false`.
- **Magnetic:** hapus `data-magnetic` dari elemen atau lewati `initMagneticElements()`.
- **Parallax/tilt:** hapus pemanggilan `initHeroParallax()` / `initProjectTilt()` atau set `MOTION` terkait.
- **Jam:** ubah `CLOCK.timeZone` dan `CLOCK.label` jika lokasi berubah.
- **Launcher:** ubah `MOTION.launcher.showAfter` ke angka lebih besar, atau hapus markup `#menu-launcher` dan `#site-menu`.

### Tanpa JavaScript

Konten tidak disembunyikan karena class reveal hanya ditambahkan setelah observer siap. Menu header tetap memakai `<details>`. Card project membutuhkan JavaScript; `<noscript>` menyediakan link ke GitHub. Launcher, overlay menu, dan dialog detail tidak dirender tanpa JavaScript.

## Deployment

Website ini sepenuhnya statis. Jalankan `npm run build`, lalu deploy `index.html`, folder `css/`, `js/`, `img/`, dan `ico/` ke hosting statis (GitHub Pages, Netlify, Vercel, cPanel, dsb.).

## Aksesibilitas & Performa

- Skip link, landmark, hierarki heading, dan `aria` pada navigasi.
- Focus state yang jelas untuk keyboard.
- Menu mobile header memakai `<details>` sehingga tetap berfungsi tanpa JavaScript.
- Overlay menu setelah scroll memakai `role="dialog"`, `aria-modal`, `aria-expanded`, focus trap, `Escape`, dan pengembalian fokus ke launcher.
- Dialog project memakai native `<dialog>`, `aria-labelledby` dinamis, fokus awal pada tombol close, focus trap, `Escape`, scroll lock, dan pengembalian fokus ke card asal.
- Animasi mengetik, entrance hero, scroll reveal, parallax, tilt, magnetic, dan custom cursor menghormati `prefers-reduced-motion`; custom cursor dan magnetic juga dinonaktifkan pada perangkat sentuh.
- Tombol **Explore project** selalu terlihat, sehingga detail project tidak bergantung pada hover di layar sentuh.
- Gambar project memakai `loading="lazy"` dan `decoding="async"`.
- Meta description, Open Graph, Twitter Card, dan JSON-LD dasar sudah disertakan.
