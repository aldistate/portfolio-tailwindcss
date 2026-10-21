// ==================================================
// DATA PROJECT PORTOFOLIO
// ==================================================
// File ini adalah SATU-SATUNYA tempat yang perlu diedit
// untuk menambah, mengubah, atau menyembunyikan project.
// Card project dirender otomatis oleh js/main.js, jadi
// tidak perlu menyalin markup HTML.
//
// CARA MENAMBAH PROJECT
// 1. Salin satu object { ... } di bawah (termasuk koma).
// 2. Ganti seluruh nilainya dengan data project yang benar.
// 3. Simpan file, lalu jalankan `npm run build` agar CSS
//    Tailwind diperbarui (diperlukan hanya jika ada class baru).
//
// FIELD
// - title       (wajib)  Nama project.
// - category    (wajib)  Jenis project, mis. "Website" atau "REST API".
// - description (wajib)  Deskripsi singkat: apa yang dibangun dan untuk apa.
// - techStack   (wajib)  Array teknologi yang benar-benar dipakai.
//
// - image       (opsional) Path gambar, mis. "./img/portfolio/4.png".
//                          Jika null/kosong, card memakai placeholder.
// - imageAlt    (opsional) Deskripsi gambar untuk aksesibilitas.
// - context     (opsional) Konteks project, mis. "Final project · Bootcamp".
// - role        (opsional) Peran/kontribusi Anda, mis. "Backend developer".
// - demoUrl     (opsional) URL demo. Gunakan null jika belum ada.
// - repoUrl     (opsional) URL repository publik. Gunakan null jika
//                          tidak boleh dipublikasikan / belum ada.
// - published   (opsional) false = sembunyikan project dari website.
//                          Default-nya true jika field ini dihapus.
//
// URUTAN
// Project tampil sesuai urutan array: object paling atas tampil
// paling kiri/awal. Pindahkan object untuk mengubah urutan.
//
// GAMBAR
// Simpan gambar di folder img/portfolio/. Rasio yang disarankan
// 16:10 (mis. 1200 x 750 px). Format WebP lebih ringan dan
// direkomendasikan; PNG juga didukung. Usahakan < 300 KB.
// Tambahkan teks alt yang menjelaskan isi screenshot.
//
// URL
// demoUrl dan repoUrl harus berupa URL lengkap yang diawali
// https:// (atau http://). Jangan mengisi URL contoh/dummy.
// Link otomatis dibuka di tab baru dengan rel="noopener noreferrer".

const portfolioProjects = [
  {
    title: "E-Commerce Aldistate",
    category: "Website",
    description:
      "An e-commerce web application built as the final project of the Coding Studio Bootcamp using the Laravel 9 framework.",
    context: "Final project · Coding Studio Bootcamp",
    techStack: ["Laravel 9", "PHP"],
    image: "./img/portfolio/1.webp",
    imageAlt: "Screenshot of the E-Commerce Aldistate product listing page",
    demoUrl: null,
    repoUrl: null,
    published: true,
  },
  {
    title: "Blog Aldistate",
    category: "Website",
    description:
      "A blog-based web application for publishing and managing articles, developed with the Laravel 8 framework.",
    techStack: ["Laravel 8", "PHP"],
    image: "./img/portfolio/2.webp",
    imageAlt: "Screenshot of the Aldistate blog post listing page",
    demoUrl: null,
    repoUrl: null,
    published: true,
  },
  {
    title: "Bookshelf API",
    category: "REST API",
    description:
      "A RESTful API built as the final project of the Dicoding Bootcamp using Node.js, including automated test scenarios written and run with Postman.",
    context: "Final project · Dicoding Bootcamp",
    techStack: ["Node.js", "REST API", "Postman"],
    image: "./img/portfolio/3.webp",
    imageAlt: "Illustration for the Bookshelf API project",
    demoUrl: null,
    repoUrl: null,
    published: true,
  },

  // ==================================================
  // TAMBAHKAN PROJECT BARU DI BAWAH INI
  // ==================================================
  // Salin struktur object di atas, lalu ubah seluruh nilainya.
  // Hapus komentar ini dan tanda komentar pada contoh jika dipakai.
  //
  // {
  //   title: "Nama Project Baru",
  //   category: "Website",
  //   description: "Deskripsi singkat mengenai project dan masalah yang diselesaikan.",
  //   context: "Personal project",
  //   role: "Full-stack developer",
  //   techStack: ["Laravel", "MySQL"],
  //   image: "./img/portfolio/nama-project.png",
  //   imageAlt: "Screenshot halaman utama Nama Project Baru",
  //   demoUrl: "https://example.com",
  //   repoUrl: "https://github.com/aldistate/nama-project",
  //   published: true,
  // },
];
