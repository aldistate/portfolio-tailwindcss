// ==================================================
// INTERAKSI UI PORTOFOLIO
// ==================================================
// File ini menangani:
// 1. Render card project dari js/projects.js.
// 2. Header saat halaman di-scroll.
// 3. Navigasi mobile (<details>).
// 4. Penanda menu aktif sesuai section yang terlihat.
// 5. Efek mengetik pada hero.
// 6. Tombol salin email dan tahun copyright.
//
// Edit data project di js/projects.js, BUKAN di file ini.

(() => {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ==================================================
  // 1. PROJECT CARDS
  // ==================================================
  const projectGrid = document.querySelector("#project-grid");
  const projectCount = document.querySelector("#project-count");

  /**
   * Mengubah teks menjadi aman sebelum dimasukkan ke innerHTML.
   * Data project ditulis sendiri, tetapi escaping tetap membantu
   * mencegah markup rusak jika ada karakter seperti <, >, atau &.
   */
  const escapeHtml = (value = "") =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );

  /**
   * Hanya izinkan URL http/https untuk demo dan repository.
   * URL kosong, null, atau protokol lain akan diabaikan.
   */
  const safeUrl = (value) => {
    if (typeof value !== "string" || value.trim() === "") return null;

    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };

  const externalLinkIcon = `
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M14 5h5v5M19 5l-8 8M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </svg>
  `;

  const imageFallbackIcon = `
    <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 16-4.5-4.5L9 19" />
    </svg>
  `;

  const createProjectCard = (project) => {
    const title = escapeHtml(project.title || "Untitled project");
    const category = escapeHtml(project.category || "Project");
    const description = escapeHtml(project.description || "");
    const context = project.context ? escapeHtml(project.context) : "";
    const role = project.role ? escapeHtml(project.role) : "";
    const imageSource =
      typeof project.image === "string" && project.image.trim() !== ""
        ? project.image
        : null;
    const imageAlt = escapeHtml(
      project.imageAlt || `Preview of ${project.title || "project"}`,
    );
    const techStack = Array.isArray(project.techStack)
      ? project.techStack
      : [];
    const demoUrl = safeUrl(project.demoUrl);
    const repoUrl = safeUrl(project.repoUrl);

    const actions = [
      demoUrl
        ? `<a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">Live demo ${externalLinkIcon}</a>`
        : "",
      repoUrl
        ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">Source code ${externalLinkIcon}</a>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    const techList = techStack.length
      ? `<ul class="flex flex-wrap gap-2" aria-label="Technologies used">
          ${techStack
            .map((technology) => `<li class="badge">${escapeHtml(technology)}</li>`)
            .join("")}
        </ul>`
      : "";

    // Tech stack dan link didorong ke bawah agar sejajar antar-card.
    const cardFooter =
      techStack.length || actions
        ? `<div class="mt-auto pt-5">
            ${techList}
            ${
              actions
                ? `<div class="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">${actions}</div>`
                : ""
            }
          </div>`
        : "";

    const card = document.createElement("article");
    card.className =
      "group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift";

    card.innerHTML = `
      <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
        ${
          imageSource
            ? `<img
                src="${escapeHtml(imageSource)}"
                alt="${imageAlt}"
                width="1200"
                height="750"
                loading="lazy"
                decoding="async"
                data-thumb-img
                class="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
              />`
            : ""
        }
        <div
          data-thumb-fallback
          class="${imageSource ? "hidden" : "flex"} absolute inset-0 items-center justify-center bg-brand-50 text-brand-700"
          aria-hidden="true"
        >
          ${imageFallbackIcon}
        </div>
        <span class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          ${category}
        </span>
      </div>

      <div class="flex flex-1 flex-col p-6">
        <h3 class="text-lg font-semibold tracking-tight text-slate-900">${title}</h3>
        ${context ? `<p class="mt-1.5 text-xs font-medium text-slate-500">${context}</p>` : ""}
        <p class="mt-3 text-sm leading-6 text-slate-600">${description}</p>
        ${role ? `<p class="mt-3 text-xs font-medium text-slate-500">Role: ${role}</p>` : ""}
        ${cardFooter}
      </div>
    `;

    // Jika gambar gagal dimuat, tampilkan placeholder tanpa teks rusak.
    const image = card.querySelector("[data-thumb-img]");
    const fallback = card.querySelector("[data-thumb-fallback]");

    if (image && fallback) {
      const showFallback = () => {
        image.classList.add("hidden");
        fallback.classList.remove("hidden");
        fallback.classList.add("flex");
      };

      image.addEventListener("error", showFallback, { once: true });

      // Kasus gambar sudah gagal dimuat sebelum listener terpasang.
      if (image.complete && image.naturalWidth === 0) showFallback();
    }

    return card;
  };

  if (projectGrid) {
    // `typeof` mencegah error jika js/projects.js gagal dimuat.
    const allProjects =
      typeof portfolioProjects !== "undefined" &&
      Array.isArray(portfolioProjects)
        ? portfolioProjects
        : [];

    // Urutan mengikuti array. Project dengan published: false disembunyikan.
    const visibleProjects = allProjects.filter(
      (project) => project && project.published !== false,
    );

    if (projectCount) {
      projectCount.textContent = String(visibleProjects.length);
    }

    if (visibleProjects.length > 0) {
      const fragment = document.createDocumentFragment();
      visibleProjects.forEach((project) => {
        fragment.appendChild(createProjectCard(project));
      });
      projectGrid.appendChild(fragment);
    } else {
      const emptyState = document.createElement("p");
      emptyState.className =
        "rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 md:col-span-2 lg:col-span-3";
      emptyState.textContent =
        "No projects are published yet. Add one in js/projects.js.";
      projectGrid.appendChild(emptyState);
    }
  }

  // ==================================================
  // 2. HEADER SAAT SCROLL
  // ==================================================
  const header = document.querySelector("#site-header");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("header-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  // ==================================================
  // 3. NAVIGASI MOBILE
  // ==================================================
  const mobileNav = document.querySelector("#mobile-nav");

  if (mobileNav) {
    const summary = mobileNav.querySelector("summary");

    // Tutup menu setelah salah satu link diklik.
    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) mobileNav.open = false;
    });

    // Tutup saat klik di luar menu.
    document.addEventListener("click", (event) => {
      if (mobileNav.open && !mobileNav.contains(event.target)) {
        mobileNav.open = false;
      }
    });

    // Tutup dengan tombol Escape dan kembalikan fokus ke tombol menu.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileNav.open) {
        mobileNav.open = false;
        summary?.focus();
      }
    });
  }

  // ==================================================
  // 4. MENU AKTIF SESUAI SECTION
  // ==================================================
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    const setActiveSection = (id) => {
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      {
        // Section dianggap aktif saat berada di sekitar tengah viewport.
        rootMargin: "-45% 0px -50% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // ==================================================
  // 5. EFEK MENGETIK DI HERO
  // ==================================================
  const typingTarget = document.querySelector("#typing");
  const roles = [
    "Backend Developer",
    "Laravel Developer",
    "REST API Developer",
    "Payment Gateway Integration",
    "IT Supervisor",
  ];

  if (typingTarget) {
    if (prefersReducedMotion) {
      // Hormati preferensi pengguna: tampilkan teks statis.
      typingTarget.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      const type = () => {
        const currentRole = roles[roleIndex];
        typingTarget.textContent = currentRole.slice(0, characterIndex);

        let delay = deleting ? 35 : 65;

        if (!deleting && characterIndex === currentRole.length) {
          deleting = true;
          delay = 1800;
        } else if (deleting && characterIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 300;
        }

        characterIndex += deleting ? -1 : 1;
        window.setTimeout(type, delay);
      };

      type();
    }
  }

  // ==================================================
  // 6. SALIN EMAIL & TAHUN FOOTER
  // ==================================================
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback untuk browser lama atau halaman yang tidak memakai HTTPS.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) throw new Error("Copy command failed");
  };

  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      const email = button.getAttribute("data-copy-email");
      const label = button.querySelector("[data-copy-label]");
      const status = document.querySelector("[data-copy-status]");
      const originalLabel = label ? label.textContent : "Copy email";

      try {
        await copyText(email);
        if (label) label.textContent = "Copied!";
        if (status) status.textContent = `${email} copied to clipboard.`;
      } catch {
        if (status) {
          status.textContent = `Could not copy automatically. Please use ${email}.`;
        }
      }

      window.setTimeout(() => {
        if (label) label.textContent = originalLabel;
        if (status) status.textContent = "";
      }, 2500);
    });
  });

  const currentYear = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(currentYear);
  });
})();
