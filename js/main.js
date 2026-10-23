// ==================================================
// INTERAKSI UI PORTOFOLIO
// ==================================================
// File ini menangani:
// 1. Render card project + detail dialog dari js/projects.js.
// 2. Header, progress bar, menu aktif, dan launcher fixed.
// 3. Navigasi mobile <details> dan overlay menu penuh.
// 4. Scroll reveal dengan variasi arah per section.
// 5. Custom cursor (hanya pointer presisi / non-touch).
// 6. Parallax hero, tilt card, dan magnetic hover.
// 7. Jam real-time Asia/Jakarta, efek mengetik, salin email, tahun.
//
// Semua konfigurasi animasi ada di objek MOTION di bawah.
// Edit data project di js/projects.js, BUKAN di file ini.

(() => {
  "use strict";

  // ==================================================
  // KONFIGURASI MOTION
  // ==================================================
  // Ubah angka di sini untuk menyetel perilaku animasi.
  // Durasi/easing CSS ada di :root pada src/input.css.
  const MOTION = {
    reveal: {
      // Jarak antar-card saat muncul (ms).
      stagger: 90,
      // Seberapa banyak elemen harus terlihat sebelum animasi jalan.
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
      // false = animasi hanya sekali. true = animasi diulang saat keluar/masuk.
      replay: false,
    },
    menu: {
      openDuration: 220,
      closeDuration: 160,
      // Durasi fade overlay penuh sebelum elemen `hidden` kembali.
      overlayCloseDuration: 260,
    },
    navigation: {
      // Navbar disembunyikan setelah melewati jarak ini.
      hideAfter: 96,
      // Muncul lagi hanya saat benar-benar kembali ke atas (hysteresis).
      // Jangan samakan dengan hideAfter agar scroll kecil ke atas di tengah
      // halaman tidak memunculkan navbar kembali.
      showAt: 12,
    },
    cursor: {
      enabled: true,
      // Semakin kecil, semakin "trailing" lingkaran kursor.
      lerp: 0.18,
    },
    parallax: {
      // Intensitas parallax foto hero (px di CSS = nilai ini x 10px).
      lerp: 0.09,
    },
    tilt: {
      // Maksimal kemiringan card project dalam derajat.
      max: 3.2,
    },
    magnetic: {
      // Pergeseran maksimum dari posisi asli (px).
      max: 8,
      // Kekuatan default; bisa dioverride via data-magnetic-strength.
      strength: 0.16,
      // Semakin kecil, semakin halus gerak menyusul pointer.
      lerp: 0.18,
    },
    modal: {
      // Waktu animasi keluar sebelum dialog.close() dipanggil.
      closeDuration: 180,
    },
  };

  // Zona waktu jam. Ubah keduanya jika portofolio pindah lokasi.
  const CLOCK = {
    timeZone: "Asia/Jakarta",
    label: "WIB",
  };

  // Data project yang sedang dirender, dipakai oleh dialog detail.
  let renderedProjects = [];

  // Kunci scroll bersama untuk overlay menu dan dialog project.
  const pageLocks = new Set();

  const lockPageScroll = (key) => {
    if (pageLocks.has(key)) return;
    if (pageLocks.size === 0) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.documentElement.classList.add("page-locked");
    }
    pageLocks.add(key);
  };

  const unlockPageScroll = (key) => {
    pageLocks.delete(key);
    if (pageLocks.size === 0) {
      document.body.style.paddingRight = "";
      document.documentElement.classList.remove("page-locked");
    }
  };

  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  let prefersReducedMotion = Boolean(reducedMotionQuery?.matches);

  const finePointerQuery = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : null;
  const hasFinePointer = () => Boolean(finePointerQuery?.matches);

  if (reducedMotionQuery?.addEventListener) {
    reducedMotionQuery.addEventListener("change", (event) => {
      prefersReducedMotion = event.matches;
    });
  }

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

  const createProjectCard = (project, index) => {
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
      ? project.techStack.filter(
          (technology) =>
            typeof technology === "string" && technology.trim() !== "",
        )
      : [];
    const demoUrl = safeUrl(project.demoUrl);
    const repoUrl = safeUrl(project.repoUrl);
    const projectIndex = String(index + 1).padStart(2, "0");

    const actionLinks = [
      demoUrl
        ? `<a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="project-card-link">Live demo ${externalLinkIcon}</a>`
        : "",
      repoUrl
        ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="project-card-link">Source code ${externalLinkIcon}</a>`
        : "",
    ]
      .filter(Boolean)
      .join("");

    const techList = techStack.length
      ? `<ul class="mt-4 flex flex-wrap gap-2" aria-label="Technologies used">
          ${techStack
            .map(
              (technology) =>
                `<li class="project-tech">${escapeHtml(technology)}</li>`,
            )
            .join("")}
        </ul>`
      : "";

    const card = document.createElement("article");
    card.className =
      "project-card group relative flex h-full min-h-[26rem] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-card";
    card.dataset.tilt = "";
    card.dataset.projectCard = "";
    card.dataset.projectIndex = String(index);
    card.dataset.cursor = "project";
    card.dataset.cursorLabel = "View details";

    card.innerHTML = `
      <div class="absolute inset-0 overflow-hidden bg-slate-900">
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
                class="absolute inset-0 h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
              />`
            : ""
        }
        <div
          data-thumb-fallback
          class="${imageSource ? "hidden" : "flex"} absolute inset-0 items-center justify-center bg-brand-950 text-brand-300"
          aria-hidden="true"
        >
          ${imageFallbackIcon}
        </div>
        <div class="project-card-shade" aria-hidden="true"></div>
      </div>

      <div class="relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div class="flex items-start justify-between gap-4">
          <span class="project-category">${category}</span>
          <span class="project-index" aria-hidden="true">${projectIndex}</span>
        </div>

        <div class="mt-16">
          ${
            context
              ? `<p class="project-context">${context}</p>`
              : ""
          }
          <h3 class="mt-2 text-2xl font-semibold tracking-tight text-white">
            ${title}
          </h3>
          ${
            description
              ? `<p class="project-card-description mt-3 text-sm leading-6 text-slate-200">${description}</p>`
              : ""
          }
          ${
            role
              ? `<p class="mt-2 text-xs font-medium text-slate-300">Role: ${role}</p>`
              : ""
          }
          ${techList}
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="project-detail-trigger"
              data-project-detail
              aria-haspopup="dialog"
              aria-controls="project-dialog"
              aria-label="View details for ${title}"
            >
              Explore project
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </button>
            ${actionLinks}
          </div>
        </div>
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
    renderedProjects = visibleProjects;

    if (projectCount) {
      projectCount.textContent = String(visibleProjects.length);
    }

    if (visibleProjects.length > 0) {
      const fragment = document.createDocumentFragment();
      visibleProjects.forEach((project, index) => {
        const card = createProjectCard(project, index);

        // Card baru otomatis ikut reveal fokus/blur dengan stagger.
        card.setAttribute("data-reveal", "focus");
        card.style.setProperty(
          "--reveal-delay",
          `${index * MOTION.reveal.stagger}ms`,
        );

        fragment.appendChild(card);
      });
      projectGrid.appendChild(fragment);
    } else {
      const emptyState = document.createElement("p");
      emptyState.className =
        "rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600 md:col-span-2 lg:col-span-3";
      emptyState.setAttribute("data-reveal", "");
      emptyState.textContent =
        "No projects are published yet. Add one in js/projects.js.";
      projectGrid.appendChild(emptyState);
    }
  }

  // Seluruh card bisa diklik; link demo/repository tetap berjalan normal.
  // Tombol "Explore project" adalah kontrol keyboard yang eksplisit.
  projectGrid?.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const card = event.target.closest("[data-project-card]");
    if (!card || !projectGrid.contains(card)) return;

    // Jangan buka dialog saat pengunjung mengklik link keluar.
    if (event.target.closest("a[href]")) return;

    const index = Number(card.dataset.projectIndex);
    const project = renderedProjects[index];
    if (!Number.isInteger(index) || !project) return;

    const trigger =
      card.querySelector("[data-project-detail]") ||
      card.querySelector("[data-project-card]") ||
      card;
    openProjectDialog(project, index, renderedProjects.length, trigger);
  });

  // ==================================================
  // 2. HEADER, PROGRESS BAR, DAN SCROLL
  // ==================================================
  const header = document.querySelector("#site-header");
  const progressBar = document.querySelector("#scroll-progress-bar");
  const menuLauncher = document.querySelector("#menu-launcher");
  let scrollTicking = false;
  let navigationHidden = false;

  const updateScrollUI = () => {
    const scrollY = Math.max(0, window.scrollY);

    // Hysteresis: sembunyikan setelah hideAfter, tetapi baru tampilkan lagi
    // saat pengunjung benar-benar kembali ke atas. Scroll naik kecil di tengah
    // halaman tidak akan memunculkan navbar kembali.
    if (!navigationHidden && scrollY > MOTION.navigation.hideAfter) {
      navigationHidden = true;
    } else if (navigationHidden && scrollY <= MOTION.navigation.showAt) {
      navigationHidden = false;
    }

    if (header) header.classList.toggle("header-scrolled", scrollY > 8);

    document.body.classList.toggle("launcher-active", navigationHidden);

    if (menuLauncher) {
      // Launcher selalu tersedia selama JS aktif, baik navbar terlihat
      // maupun sudah tersembunyi karena scroll.
      menuLauncher.setAttribute("aria-hidden", "false");
      menuLauncher.tabIndex = 0;
    }

    // Navbar yang sudah tersembunyi juga dikeluarkan dari urutan fokus/AT.
    if (header) {
      if (navigationHidden) {
        if (header.contains(document.activeElement) && menuLauncher) {
          menuLauncher.focus({ preventScroll: true });
        }
        header.setAttribute("aria-hidden", "true");
        header.setAttribute("inert", "");
      } else {
        header.removeAttribute("aria-hidden");
        // Jangan membuka fokus ke header saat overlay menu masih terbuka.
        if (!document.body.classList.contains("menu-open")) {
          header.removeAttribute("inert");
        }
      }
    }

    // Launcher menggantikan menu <details>; tutup menu lama saat transisi.
    if (navigationHidden) {
      const openMobileNav = document.querySelector("#mobile-nav[open]");
      if (openMobileNav) {
        const focusWasInside = openMobileNav.contains(document.activeElement);
        openMobileNav.removeAttribute("open");
        if (focusWasInside && menuLauncher) {
          menuLauncher.focus({ preventScroll: true });
        }
      }
    }

    if (progressBar) {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    scrollTicking = false;
  };

  const requestScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  updateScrollUI();
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });

  // ==================================================
  // 3. NAVIGASI MOBILE
  // ==================================================
  const mobileNav = document.querySelector("#mobile-nav");
  const desktopNavQuery = window.matchMedia("(min-width: 1024px)");

  if (mobileNav) {
    const summary = mobileNav.querySelector("summary");
    const panel = mobileNav.querySelector(":scope > div");
    let isClosing = false;

    const closeMenu = ({ focusSummary = false } = {}) => {
      if (!mobileNav.open) {
        if (focusSummary) summary?.focus();
        return;
      }

      const finish = () => {
        mobileNav.open = false;
        isClosing = false;
        if (focusSummary) summary?.focus();
      };

      // Fallback: tanpa animasi tetap bisa ditutup.
      if (
        prefersReducedMotion ||
        !panel ||
        typeof panel.animate !== "function"
      ) {
        finish();
        return;
      }

      if (isClosing) return;
      isClosing = true;

      panel.getAnimations().forEach((animation) => animation.cancel());
      const animation = panel.animate(
        [
          { opacity: 1, transform: "translateY(0)" },
          { opacity: 0, transform: "translateY(-8px)" },
        ],
        {
          duration: MOTION.menu.closeDuration,
          easing: "ease-in",
          fill: "forwards",
        },
      );

      animation.onfinish = finish;
      animation.oncancel = () => {
        isClosing = false;
      };
    };

    // Saat menu terbuka, klik summary akan dianimasikan menutup.
    // Saat tertutup, biarkan <details> membuka secara native.
    summary?.addEventListener("click", (event) => {
      if (mobileNav.open) {
        event.preventDefault();
        closeMenu();
      }
    });

    mobileNav.addEventListener("toggle", () => {
      if (!mobileNav.open || !panel) return;
      if (prefersReducedMotion || typeof panel.animate !== "function") return;

      panel.getAnimations().forEach((animation) => animation.cancel());
      panel.animate(
        [
          { opacity: 0, transform: "translateY(-8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: MOTION.menu.openDuration,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
      );
    });

    // Tutup menu setelah salah satu link diklik.
    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    // Tutup saat klik di luar menu.
    document.addEventListener("click", (event) => {
      if (
        mobileNav.open &&
        event.target instanceof Node &&
        !mobileNav.contains(event.target)
      ) {
        closeMenu();
      }
    });

    // Tutup dengan Escape dan kembalikan fokus ke tombol menu.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileNav.open) {
        closeMenu({ focusSummary: true });
      }
    });

    // Jika layar melebar ke desktop, tutup menu mobile.
    const closeOnDesktop = (event) => {
      if (event.matches) closeMenu();
    };

    if (desktopNavQuery.addEventListener) {
      desktopNavQuery.addEventListener("change", closeOnDesktop);
    } else if (desktopNavQuery.addListener) {
      desktopNavQuery.addListener(closeOnDesktop);
    }
  }

  // ==================================================
  // 4. OVERLAY MENU FIXED
  // ==================================================
  const initSiteMenu = () => {
    const menu = document.querySelector("#site-menu");
    const launcher = menuLauncher;
    const closeButton = document.querySelector("#site-menu-close");
    if (!menu || !launcher || !closeButton) return;

    const skipLink = document.querySelector(".skip-link");
    const main = document.querySelector("#main");
    const footer = document.querySelector("footer");
    const backgroundTargets = [header, main, footer, skipLink, launcher].filter(
      Boolean,
    );

    let isMenuOpen = false;
    let lastFocus = null;
    let closeTimer = null;

    const setBackgroundInert = (inert) => {
      backgroundTargets.forEach((element) => {
        if (inert) {
          element.setAttribute("inert", "");
          return;
        }

        // Navbar yang sedang tersembunyi harus tetap inert setelah overlay
        // ditutup; jangan biarkan cleanup menu membuka fokus ke header.
        if (element === header && navigationHidden) {
          element.setAttribute("aria-hidden", "true");
          element.setAttribute("inert", "");
          return;
        }

        element.removeAttribute("inert");
      });
    };

    const getFocusableElements = () =>
      Array.from(
        menu.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

    const openMenu = () => {
      if (isMenuOpen) return;

      isMenuOpen = true;
      // Overlay hanya dibuka dari launcher; selalu kembalikan fokus ke sana.
      lastFocus = launcher;

      if (closeTimer !== null) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      menu.hidden = false;
      menu.scrollTop = 0;
      document.body.classList.add("menu-open");
      launcher.setAttribute("aria-expanded", "true");
      lockPageScroll("site-menu");
      setBackgroundInert(true);

      // Paksa frame agar transition opacity berjalan dari kondisi tertutup.
      void menu.offsetWidth;
      window.requestAnimationFrame(() => menu.classList.add("is-open"));
      closeButton.focus({ preventScroll: true });
    };

    const closeMenu = ({ restoreFocus = true, afterClose = null } = {}) => {
      if (!isMenuOpen) return;

      isMenuOpen = false;
      launcher.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");

      const finish = () => {
        closeTimer = null;
        if (isMenuOpen) return;

        menu.hidden = true;
        document.body.classList.remove("menu-open");
        setBackgroundInert(false);
        unlockPageScroll("site-menu");

        if (restoreFocus && lastFocus instanceof HTMLElement) {
          lastFocus.focus({ preventScroll: true });
        }
        if (typeof afterClose === "function") afterClose();
      };

      if (prefersReducedMotion) {
        finish();
        return;
      }

      if (closeTimer !== null) window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(
        finish,
        MOTION.menu.overlayCloseDuration,
      );
    };

    launcher.addEventListener("click", openMenu);
    closeButton.addEventListener("click", () => closeMenu());

    // Link menu: tutup overlay, buka kunci scroll, lalu menuju section.
    menu.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("[data-menu-link]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      event.preventDefault();
      const target = document.querySelector(href);

      closeMenu({
        restoreFocus: false,
        afterClose: () => {
          if (!target) return;

          const heading = target.querySelector("h1, h2");
          const focusTarget = heading || target;

          if (!focusTarget.hasAttribute("tabindex")) {
            focusTarget.setAttribute("tabindex", "-1");
          }

          target.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });

          try {
            window.history.pushState(null, "", href);
          } catch {
            // file:// atau lingkungan tertentu bisa menolak pushState.
          }

          focusTarget.focus({ preventScroll: true });
        },
      });
    });

    // Fokus trap + Escape untuk overlay yang tidak memakai <dialog>.
    document.addEventListener("keydown", (event) => {
      if (!isMenuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        closeButton.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!menu.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  initSiteMenu();

  // ==================================================
  // 5. PROJECT DETAIL DIALOG
  // ==================================================
  const projectDialog = document.querySelector("#project-dialog");
  const dialogContent = projectDialog?.querySelector("[data-dialog-content]");
  const dialogScroll = projectDialog?.querySelector(".project-dialog-scroll");
  const dialogCloseButton = projectDialog?.querySelector("[data-dialog-close]");

  let lastDialogFocus = null;
  let dialogCloseTimer = null;
  let isDialogClosing = false;

  const textValue = (value) =>
    typeof value === "string" && value.trim() !== "" ? value.trim() : "";

  const renderProjectDialog = (project, index, total) => {
    if (!dialogContent) return;

    const details =
      project.details &&
      typeof project.details === "object" &&
      !Array.isArray(project.details)
        ? project.details
        : {};

    const titleText = textValue(project.title) || "Untitled project";
    const title = escapeHtml(titleText);
    const category = escapeHtml(textValue(project.category) || "Project");
    const context = escapeHtml(textValue(project.context));
    const overview = textValue(details.overview) || textValue(project.description);
    const problem = textValue(details.problem);
    const role = textValue(details.role) || textValue(project.role);
    const features = Array.isArray(details.features)
      ? details.features
          .map((feature) => textValue(feature))
          .filter(Boolean)
      : [];
    const techStack = Array.isArray(project.techStack)
      ? project.techStack.map((technology) => textValue(technology)).filter(Boolean)
      : [];
    const demoUrl = safeUrl(project.demoUrl);
    const repoUrl = safeUrl(project.repoUrl);
    const imageSource =
      typeof project.image === "string" && project.image.trim() !== ""
        ? project.image
        : null;
    const imageAlt = escapeHtml(
      project.imageAlt || `Preview of ${titleText}`,
    );
    const projectNumber = String(index + 1).padStart(2, "0");
    const projectTotal = String(total).padStart(2, "0");

    const imageBlock = `
      <div class="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        ${
          imageSource
            ? `<img
                src="${escapeHtml(imageSource)}"
                alt="${imageAlt}"
                width="1200"
                height="750"
                decoding="async"
                data-dialog-img
                class="h-full w-full object-cover object-top"
              />`
            : ""
        }
        <div
          data-dialog-fallback
          class="${imageSource ? "hidden" : "flex"} absolute inset-0 items-center justify-center bg-brand-50 text-brand-700"
          aria-hidden="true"
        >${imageFallbackIcon}</div>
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/35 to-transparent" aria-hidden="true"></div>
      </div>
    `;

    const overviewBlock = overview
      ? `<section aria-labelledby="project-detail-overview">
          <h3 id="project-detail-overview" class="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Overview</h3>
          <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">${escapeHtml(overview)}</p>
        </section>`
      : "";

    const problemBlock = problem
      ? `<section aria-labelledby="project-detail-problem">
          <h3 id="project-detail-problem" class="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">The challenge</h3>
          <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">${escapeHtml(problem)}</p>
        </section>`
      : "";

    const featuresBlock = features.length
      ? `<section aria-labelledby="project-detail-features">
          <h3 id="project-detail-features" class="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Key features</h3>
          <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            ${features
              .map(
                (feature) => `<li class="flex gap-2.5">
                  <svg class="mt-1 h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" />
                  </svg>
                  <span>${escapeHtml(feature)}</span>
                </li>`,
              )
              .join("")}
          </ul>
        </section>`
      : "";

    const roleBlock = role
      ? `<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">My role</p>
          <p class="mt-2 text-sm font-medium text-slate-900">${escapeHtml(role)}</p>
        </div>`
      : "";

    const techBlock = techStack.length
      ? `<div class="rounded-2xl border border-slate-200 p-5">
          <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tech stack</p>
          <ul class="mt-3 flex flex-wrap gap-2">
            ${techStack
              .map(
                (technology) =>
                  `<li class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">${escapeHtml(technology)}</li>`,
              )
              .join("")}
          </ul>
        </div>`
      : "";

    const linksBlock =
      demoUrl || repoUrl
        ? `<div class="rounded-2xl border border-slate-200 p-5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Project links</p>
            <div class="mt-3 flex flex-wrap gap-2">
              ${
                demoUrl
                  ? `<a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-800">Live demo ${externalLinkIcon}</a>`
                  : ""
              }
              ${
                repoUrl
                  ? `<a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-100">Source code ${externalLinkIcon}</a>`
                  : ""
              }
            </div>
          </div>`
        : "";

    const hasAside = Boolean(roleBlock || techBlock || linksBlock);

    dialogContent.innerHTML = `
      ${imageBlock}
      <div class="p-6 sm:p-8 lg:p-10">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span class="text-brand-700">Project ${projectNumber} / ${projectTotal}</span>
          <span aria-hidden="true">·</span>
          <span>${category}</span>
        </div>
        <h2 id="project-dialog-title" class="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">${title}</h2>
        ${context ? `<p class="mt-2 text-sm font-medium text-slate-500">${context}</p>` : ""}
        <div class="mt-7 grid gap-8 ${hasAside ? "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.75fr)]" : ""}">
          <div class="space-y-6">
            ${overviewBlock}
            ${problemBlock}
            ${featuresBlock}
          </div>
          ${
            hasAside
              ? `<aside class="space-y-4" aria-label="Project metadata">${roleBlock}${techBlock}${linksBlock}</aside>`
              : ""
          }
        </div>
      </div>
    `;

    // Placeholder juga dipakai jika file gambar dialog gagal dimuat.
    const dialogImage = dialogContent.querySelector("[data-dialog-img]");
    const dialogFallback = dialogContent.querySelector("[data-dialog-fallback]");
    if (dialogImage && dialogFallback) {
      const showDialogFallback = () => {
        dialogImage.classList.add("hidden");
        dialogFallback.classList.remove("hidden");
        dialogFallback.classList.add("flex");
      };

      dialogImage.addEventListener("error", showDialogFallback, { once: true });
      if (dialogImage.complete && dialogImage.naturalWidth === 0) {
        showDialogFallback();
      }
    }

    if (dialogScroll) dialogScroll.scrollTop = 0;
  };

  const openProjectDialog = (project, index, total, trigger) => {
    if (!projectDialog || !dialogContent) return;

    renderProjectDialog(project, index, total);

    lastDialogFocus =
      trigger instanceof HTMLElement ? trigger : document.activeElement;

    if (projectDialog.open) {
      dialogCloseButton?.focus({ preventScroll: true });
      return;
    }

    projectDialog.classList.remove("is-closing");
    isDialogClosing = false;

    if (typeof projectDialog.showModal === "function") {
      projectDialog.showModal();
    } else {
      // Fallback browser lama: tetap tampilkan konten tanpa top layer.
      projectDialog.setAttribute("open", "");
    }

    document.documentElement.classList.add("dialog-open");
    lockPageScroll("project-dialog");

    window.requestAnimationFrame(() => {
      dialogCloseButton?.focus({ preventScroll: true });
    });
  };

  const closeProjectDialog = () => {
    if (!projectDialog?.open || isDialogClosing) return;

    const finish = () => projectDialog.close();

    if (prefersReducedMotion) {
      finish();
      return;
    }

    isDialogClosing = true;
    projectDialog.classList.add("is-closing");
    if (dialogCloseTimer !== null) window.clearTimeout(dialogCloseTimer);
    dialogCloseTimer = window.setTimeout(finish, MOTION.modal.closeDuration);
  };

  if (projectDialog) {
    projectDialog
      .querySelector("[data-dialog-close]")
      ?.addEventListener("click", closeProjectDialog);

    // Klik area backdrop (target = dialog, bukan shell) menutup modal.
    projectDialog.addEventListener("click", (event) => {
      if (event.target === projectDialog) closeProjectDialog();
    });

    // Escape dianimasikan dulu, lalu dialog.close() dipanggil.
    projectDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeProjectDialog();
    });

    projectDialog.addEventListener("close", () => {
      isDialogClosing = false;
      if (dialogCloseTimer !== null) {
        window.clearTimeout(dialogCloseTimer);
        dialogCloseTimer = null;
      }

      projectDialog.classList.remove("is-closing");
      document.documentElement.classList.remove("dialog-open");
      unlockPageScroll("project-dialog");

      const focusTarget = lastDialogFocus;
      lastDialogFocus = null;
      if (focusTarget instanceof HTMLElement) {
        window.requestAnimationFrame(() =>
          focusTarget.focus({ preventScroll: true }),
        );
      }
    });

    // Native <dialog> menjaga background inert, tetapi Tab masih bisa jatuh
    // ke body di sebagian browser. Trap manual memastikan fokus tetap di modal.
    const getDialogFocusableElements = () =>
      Array.from(
        projectDialog.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

    document.addEventListener("keydown", (event) => {
      if (!projectDialog.open || event.key !== "Tab") return;

      const focusable = getDialogFocusableElements();
      if (!focusable.length) {
        event.preventDefault();
        dialogCloseButton?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        active === projectDialog ||
        !projectDialog.contains(active)
      ) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  // ==================================================
  // 6. MENU AKTIF SESUAI SECTION
  // ==================================================
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const navTargets = new Set(
    navLinks.map((link) => link.getAttribute("href")).filter(Boolean),
  );
  // Section seperti quote interlude tidak punya link navigasi; jangan biarkan
  // section itu menghapus status aktif dari navbar.
  const sections = Array.from(
    document.querySelectorAll("main section[id]"),
  ).filter((section) => navTargets.has(`#${section.id}`));

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
  // 7. SCROLL REVEAL
  // ==================================================
  const initScrollReveal = () => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!elements.length || prefersReducedMotion) return;

    // Tanpa IntersectionObserver, konten tetap terlihat (tidak ada class ini).
    if (!("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("reveal-ready");

    elements.forEach((element) => {
      const delay = Number(element.getAttribute("data-reveal-delay") || 0);
      if (delay > 0) element.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            // Default: cukup sekali agar konten tidak berkedip saat scroll naik.
            if (!MOTION.reveal.replay) observer.unobserve(entry.target);
          } else if (MOTION.reveal.replay) {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: MOTION.reveal.threshold,
        rootMargin: MOTION.reveal.rootMargin,
      },
    );

    elements.forEach((element) => observer.observe(element));
  };

  try {
    initScrollReveal();
  } catch (error) {
    // Jangan biarkan konten tersembunyi jika inisialisasi gagal.
    document.documentElement.classList.remove("reveal-ready");
    console.warn("Scroll reveal could not be initialized.", error);
  }

  // ==================================================
  // 8. JAM REAL-TIME (ASIA/JAKARTA)
  // ==================================================
  const initLocalClock = () => {
    const clocks = Array.from(document.querySelectorAll("[data-local-clock]"));
    if (!clocks.length) return;

    let timer = null;
    let formatter = null;

    try {
      formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: CLOCK.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });
    } catch (error) {
      console.warn("Local clock could not use the configured time zone.", error);
    }

    const render = () => {
      const now = new Date();

      if (!formatter) {
        clocks.forEach((clock) => {
          clock.textContent = `--:--:-- ${CLOCK.label}`;
        });
        return;
      }

      const value = formatter.format(now);
      clocks.forEach((clock) => {
        clock.textContent = `${value} ${CLOCK.label}`;
        clock.setAttribute("datetime", now.toISOString());
        clock.title = `${value} ${CLOCK.label} — ${CLOCK.timeZone}`;
      });

      // Selaraskan pembaruan ke detik berikutnya agar jam tidak melenceng.
      const delay = 1000 - (now.getTime() % 1000) + 20;
      timer = window.setTimeout(render, delay);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (timer !== null) {
          window.clearTimeout(timer);
          timer = null;
        }
        return;
      }

      if (timer !== null) window.clearTimeout(timer);
      render();
    };

    render();
    document.addEventListener("visibilitychange", onVisibilityChange);

    window.addEventListener(
      "pagehide",
      () => {
        if (timer !== null) window.clearTimeout(timer);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      },
      { once: true },
    );
  };

  initLocalClock();

  // ==================================================
  // 9. CUSTOM CURSOR
  // ==================================================
  // Hanya aktif pada perangkat dengan pointer presisi. Cursor asli baru
  // disembunyikan setelah pointer pertama bergerak, sehingga tidak ada
  // kondisi "tidak punya kursor" saat JavaScript belum siap.
  const initCustomCursor = () => {
    if (!MOTION.cursor.enabled || prefersReducedMotion || !hasFinePointer()) {
      return null;
    }

    const dot = document.createElement("div");
    dot.className = "cursor-dot is-hidden";
    dot.setAttribute("aria-hidden", "true");

    const ring = document.createElement("div");
    ring.className = "cursor-ring is-hidden";
    ring.setAttribute("aria-hidden", "true");

    document.body.append(dot, ring);

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let cursorFrame = null;
    let activated = false;

    const setPosition = (element, x, y) => {
      element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    setPosition(dot, pointerX, pointerY);
    setPosition(ring, pointerX, pointerY);

    const render = () => {
      const distanceX = pointerX - ringX;
      const distanceY = pointerY - ringY;

      // Interpolasi sederhana menghasilkan trailing ring yang halus.
      ringX += distanceX * MOTION.cursor.lerp;
      ringY += distanceY * MOTION.cursor.lerp;
      setPosition(ring, ringX, ringY);

      if (Math.abs(distanceX) > 0.15 || Math.abs(distanceY) > 0.15) {
        cursorFrame = window.requestAnimationFrame(render);
      } else {
        cursorFrame = null;
      }
    };

    const show = () => {
      dot.classList.remove("is-hidden");
      ring.classList.remove("is-hidden");
    };

    const hide = () => {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
      ring.classList.remove("is-pressed");
    };

    const onPointerMove = (event) => {
      // Abaikan sentuhan pada perangkat hybrid yang juga punya mouse.
      if (event.pointerType === "touch") {
        hide();
        return;
      }

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!activated) {
        activated = true;
        ringX = pointerX;
        ringY = pointerY;
        setPosition(ring, ringX, ringY);
        document.documentElement.classList.add("cursor-ready");
      }

      setPosition(dot, pointerX, pointerY);
      show();

      if (cursorFrame === null) {
        cursorFrame = window.requestAnimationFrame(render);
      }
    };

    const onPointerOver = (event) => {
      if (event.pointerType === "touch") return;
      if (!(event.target instanceof Element)) return;

      const labelledTarget = event.target.closest("[data-cursor-label]");
      const interactiveTarget = event.target.closest(
        "a, button, summary, [data-cursor]",
      );
      const label = labelledTarget?.getAttribute("data-cursor-label") || "";
      const isInteractive = Boolean(interactiveTarget);

      dot.classList.toggle("is-interactive", isInteractive);
      ring.classList.toggle("is-interactive", isInteractive && !label);
      ring.classList.toggle("has-label", Boolean(label));

      if (label) {
        ring.setAttribute("data-label", label);
      } else {
        ring.removeAttribute("data-label");
      }
    };

    const onPointerDown = (event) => {
      if (event.pointerType === "touch") return;
      ring.classList.add("is-pressed");
    };
    const onPointerUp = () => ring.classList.remove("is-pressed");
    const onPointerLeave = () => hide();
    const onPointerEnter = () => show();
    const onMouseOut = (event) => {
      if (!event.relatedTarget) hide();
    };
    const onWindowBlur = () => hide();

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    document.documentElement.addEventListener("pointerenter", onPointerEnter);
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("blur", onWindowBlur);

    const destroy = () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener(
        "pointerleave",
        onPointerLeave,
      );
      document.documentElement.removeEventListener(
        "pointerenter",
        onPointerEnter,
      );
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("blur", onWindowBlur);

      if (cursorFrame !== null) window.cancelAnimationFrame(cursorFrame);
      document.documentElement.classList.remove("cursor-ready");
      dot.remove();
      ring.remove();
    };

    // Jika pengguna mengaktifkan reduced motion saat halaman terbuka.
    const onReducedMotionChange = (event) => {
      if (event.matches) destroy();
    };

    reducedMotionQuery?.addEventListener?.("change", onReducedMotionChange);

    return () => {
      reducedMotionQuery?.removeEventListener?.("change", onReducedMotionChange);
      destroy();
    };
  };

  initCustomCursor();

  // ==================================================
  // 10. PARALLAX HERO + TILT PROJECT CARD
  // ==================================================
  const initHeroParallax = () => {
    if (prefersReducedMotion || !hasFinePointer()) return;

    const hero = document.querySelector("#home");
    const target = hero?.querySelector("[data-hero-parallax]");
    if (!hero || !target) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;

    const render = () => {
      currentX += (targetX - currentX) * MOTION.parallax.lerp;
      currentY += (targetY - currentY) * MOTION.parallax.lerp;

      target.style.setProperty("--parallax-x", currentX.toFixed(3));
      target.style.setProperty("--parallax-y", currentY.toFixed(3));

      if (
        Math.abs(targetX - currentX) > 0.002 ||
        Math.abs(targetY - currentY) > 0.002
      ) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = null;
      }
    };

    const onPointerMove = (event) => {
      if (event.pointerType === "touch") return;

      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      if (frame === null) frame = window.requestAnimationFrame(render);
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      if (frame === null) frame = window.requestAnimationFrame(render);
    };

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
  };

  const initProjectTilt = () => {
    if (prefersReducedMotion || !hasFinePointer()) return;

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let frame = null;
      let relativeX = 0;
      let relativeY = 0;

      const applyTilt = () => {
        card.style.setProperty(
          "--tilt-x",
          `${(-relativeY * MOTION.tilt.max).toFixed(2)}deg`,
        );
        card.style.setProperty(
          "--tilt-y",
          `${(relativeX * MOTION.tilt.max).toFixed(2)}deg`,
        );
        frame = null;
      };

      const onPointerMove = (event) => {
        if (event.pointerType === "touch") return;

        const rect = card.getBoundingClientRect();
        relativeX = (event.clientX - rect.left) / rect.width - 0.5;
        relativeY = (event.clientY - rect.top) / rect.height - 0.5;

        card.classList.add("is-tilting");
        if (frame === null) frame = window.requestAnimationFrame(applyTilt);
      };

      const onPointerLeave = () => {
        card.classList.remove("is-tilting");
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        if (frame !== null) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
      };

      card.addEventListener("pointermove", onPointerMove, { passive: true });
      card.addEventListener("pointerleave", onPointerLeave);
    });
  };

  // ==================================================
  // 11. MAGNETIC HOVER (KHUSUS ELEMEN [data-magnetic])
  // ==================================================
  const initMagneticElements = () => {
    if (prefersReducedMotion || !hasFinePointer()) return;

    const elements = Array.from(document.querySelectorAll("[data-magnetic]"));

    elements.forEach((element) => {
      const strengthAttribute = element.getAttribute("data-magnetic-strength");
      const parsedStrength =
        strengthAttribute === null ? Number.NaN : Number(strengthAttribute);
      const strength = Number.isFinite(parsedStrength)
        ? parsedStrength
        : MOTION.magnetic.strength;

      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let frame = null;
      let isActive = false;

      const render = () => {
        currentX += (targetX - currentX) * MOTION.magnetic.lerp;
        currentY += (targetY - currentY) * MOTION.magnetic.lerp;

        element.style.translate = `${currentX.toFixed(2)}px ${currentY.toFixed(
          2,
        )}px`;

        const settled =
          Math.abs(targetX - currentX) < 0.08 &&
          Math.abs(targetY - currentY) < 0.08;

        if (!settled) {
          frame = window.requestAnimationFrame(render);
        } else {
          frame = null;
          if (!isActive) element.style.translate = "";
        }
      };

      const start = () => {
        if (frame === null) frame = window.requestAnimationFrame(render);
      };

      const onPointerMove = (event) => {
        if (
          prefersReducedMotion ||
          event.pointerType === "touch" ||
          !hasFinePointer()
        ) {
          return;
        }

        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        let offsetX =
          (event.clientX - (rect.left + rect.width / 2)) * strength;
        let offsetY =
          (event.clientY - (rect.top + rect.height / 2)) * strength;

        // Batasi panjang vektor agar tombol tidak pernah menjauh terlalu jauh.
        const distance = Math.hypot(offsetX, offsetY);
        if (distance > MOTION.magnetic.max) {
          const scale = MOTION.magnetic.max / distance;
          offsetX *= scale;
          offsetY *= scale;
        }

        targetX = offsetX;
        targetY = offsetY;
        isActive = true;
        element.classList.add("is-magnetic-active");
        start();
      };

      const reset = () => {
        isActive = false;
        targetX = 0;
        targetY = 0;
        element.classList.remove("is-magnetic-active");
        start();
      };

      element.addEventListener("pointermove", onPointerMove, {
        passive: true,
      });
      element.addEventListener("pointerleave", reset);
      element.addEventListener("pointercancel", reset);
      element.addEventListener("blur", reset);
    });
  };

  initHeroParallax();
  initProjectTilt();
  initMagneticElements();

  // ==================================================
  // 12. EFEK MENGETIK DI HERO
  // ==================================================
  const typingTarget = document.querySelector("#typing");
  const roles = [
    "Backend Developer",
    "Laravel Developer",
    "REST API Developer",
    "Payment Gateway Integration",
    "IT Supervisor",
  ];
  let typingTimer = null;

  if (typingTarget) {
    if (prefersReducedMotion) {
      // Hormati preferensi pengguna: tampilkan teks statis.
      typingTarget.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      const type = () => {
        // Jika preferensi berubah saat halaman terbuka, hentikan animasi.
        if (prefersReducedMotion) {
          typingTarget.textContent = roles[0];
          return;
        }

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
        typingTimer = window.setTimeout(type, delay);
      };

      type();
    }
  }

  window.addEventListener(
    "pagehide",
    () => {
      if (typingTimer !== null) window.clearTimeout(typingTimer);
    },
    { once: true },
  );

  // ==================================================
  // 13. SALIN EMAIL & TAHUN FOOTER
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
