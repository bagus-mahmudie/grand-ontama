const APP_BASE = "/";

function responsiveImageAttributes(source) {
  const image = window.responsiveImages?.[source];
  return image ? `src="${image.src}" srcset="${image.srcset}" sizes="(max-width: 639px) 85vw, (max-width: 1023px) 45vw, 420px" width="${image.width}" height="${image.height}"` : `src="${source}"`;
}

function localIcon(name, className = "", altText = name) {
  return `<img src="${APP_BASE}assets/icons/${name}.webp" alt="${altText}" class="local-icon ${className}" decoding="async">`;
}

document.addEventListener("DOMContentLoaded", () => {
  fixHomeLinks();
  initNavbar();
  initServiceWorker();
  runWhenIdle(initGlobalAudio);
  initScrollTop();
  initSmoothScroll();


  initHomepageCarousels();
  initHomepageInteriorSlider();
  initVideoModal();
  initLocationSection();
  initWhatsappContactForm();
  initWhatsappQuestionForms();


  initFaqAccordion();
  initAboutTabs();
  initAboutValueCards();
  initCounters();
  initPropertyReadMore();
  initPropertyAccordions();
  initPropertyDetailGallery();
  initKprOptions();
  initMobileKprCard();
  initDestinationFilter();
  initVisitModal();
  initArticleShareButtons();
  initShareModal();
  initBlogIndex();
  initRelatedPosts();
  runWhenIdle(initAosAnimations);
});

function runWhenIdle(callback) {
  const schedule = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 2500 });
    } else {
      window.setTimeout(callback, 800);
    }
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }
}

function fixHomeLinks() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) return;

    const isHomeLink =
      href === "/" ||
      href === "beranda" ||
      href === "beranda.html" ||
      href === "index" ||
      href === "index.html";

    if (isHomeLink) {
      link.setAttribute("href", APP_BASE);
    }
  });
}

function initNavbar() {
  const navbar = document.querySelector("[data-navbar]");
  const openButton = document.querySelector("[data-mobile-open]");
  const closeButton = document.querySelector("[data-mobile-close]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  const mobileOverlay = document.querySelector("[data-mobile-overlay]");

  initActiveNavlink();
  initMobileMenu();
  initDirectionalVisibility();

  function initMobileMenu() {
    function openMenu() {
      mobilePanel?.classList.remove("translate-x-full");
      mobileOverlay?.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      openButton?.setAttribute("aria-expanded", "true");
      navbar?.classList.remove("nav-hidden");
    }

    function closeMenu() {
      mobilePanel?.classList.add("translate-x-full");
      mobileOverlay?.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      openButton?.setAttribute("aria-expanded", "false");
    }

    openButton?.addEventListener("click", openMenu);
    closeButton?.addEventListener("click", closeMenu);
    mobileOverlay?.addEventListener("click", closeMenu);

    document.querySelectorAll("[data-mobile-panel] a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function initDirectionalVisibility() {
    if (!navbar) return;

    let lastScroll = window.scrollY;
    let ticking = false;

    function updateNavbarVisibility() {
      const currentScroll = Math.max(window.scrollY, 0);
      const mobileMenuOpen = !mobilePanel?.classList.contains("translate-x-full");

      if (currentScroll < 80 || currentScroll < lastScroll || mobileMenuOpen) {
        navbar.classList.remove("nav-hidden");
      } else if (currentScroll > lastScroll + 4) {
        navbar.classList.add("nav-hidden");
      }

      lastScroll = currentScroll;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateNavbarVisibility);
      },
      { passive: true },
    );
  }
}

function initHomepageCarousels() {
  document.querySelectorAll("[data-home-carousel]").forEach((carousel) => {
    const wrapper = carousel.parentElement;
    const previous = wrapper?.querySelector("[data-carousel-prev]");
    const next = wrapper?.querySelector("[data-carousel-next]");
    const shouldLoop = carousel.hasAttribute("data-loop-carousel");
    const canDrag = carousel.hasAttribute("data-drag-carousel");
    const originalItemCount = carousel.children.length;
    let isPointerDragging = false;
    let normalizeTimer = 0;

    if (shouldLoop && originalItemCount > 1) {
      const originals = Array.from(carousel.children);
      const beforeClones = originals.map((item) => item.cloneNode(true));
      const afterClones = originals.map((item) => item.cloneNode(true));

      [...beforeClones, ...afterClones].forEach((clone) => {
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a, button, input, select, textarea").forEach((element) => {
          element.setAttribute("tabindex", "-1");
        });
      });

      carousel.prepend(...beforeClones);
      carousel.append(...afterClones);
    }

    function getStep() {
      const firstItem = carousel.firstElementChild;
      const itemWidth = firstItem?.getBoundingClientRect().width || carousel.clientWidth * 0.82;
      const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 20;
      return itemWidth + gap;
    }

    function move(direction) {
      carousel.scrollBy({ left: direction * getStep(), behavior: "smooth" });
    }

    function jumpTo(left) {
      const previousBehavior = carousel.style.scrollBehavior;
      carousel.style.scrollBehavior = "auto";
      carousel.scrollTo({ left, behavior: "auto" });
      requestAnimationFrame(() => {
        carousel.style.scrollBehavior = previousBehavior;
      });
    }

    function normalizeLoopPosition() {
      if (!shouldLoop || originalItemCount < 2 || isPointerDragging) return;

      const groupWidth = getStep() * originalItemCount;
      const endOfMiddleGroup = groupWidth * 2;

      if (carousel.scrollLeft <= 1) {
        jumpTo(carousel.scrollLeft + groupWidth);
      } else if (carousel.scrollLeft >= endOfMiddleGroup - 1) {
        jumpTo(carousel.scrollLeft - groupWidth);
      }
    }

    if (shouldLoop && originalItemCount > 1) {
      requestAnimationFrame(() => jumpTo(getStep() * originalItemCount));

      carousel.addEventListener("scroll", () => {
        window.clearTimeout(normalizeTimer);
        normalizeTimer = window.setTimeout(normalizeLoopPosition, 120);
      }, { passive: true });

      carousel.addEventListener("scrollend", normalizeLoopPosition);
    }

    if (canDrag) {
      let pointerStartX = 0;
      let startingScrollLeft = 0;
      let hasDragged = false;
      let suppressClick = false;

      carousel.addEventListener("dragstart", (event) => event.preventDefault());

      carousel.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        isPointerDragging = true;
        hasDragged = false;
        pointerStartX = event.clientX;
        startingScrollLeft = carousel.scrollLeft;
      });

      carousel.addEventListener("pointermove", (event) => {
        if (!isPointerDragging) return;
        const distance = event.clientX - pointerStartX;
        if (!hasDragged && Math.abs(distance) <= 5) return;

        if (!hasDragged) {
          hasDragged = true;
          carousel.classList.add("is-dragging");
          carousel.setPointerCapture(event.pointerId);
        }

        carousel.scrollLeft = startingScrollLeft - distance;
      });

      function finishPointerDrag(event) {
        if (!isPointerDragging) return;
        isPointerDragging = false;
        carousel.classList.remove("is-dragging");

        if (carousel.hasPointerCapture(event.pointerId)) {
          carousel.releasePointerCapture(event.pointerId);
        }

        suppressClick = hasDragged;
        if (hasDragged && document.activeElement instanceof HTMLElement && carousel.contains(document.activeElement)) {
          document.activeElement.blur();
        }
        const stepWidth = getStep();
        const closestPosition = Math.round(carousel.scrollLeft / stepWidth) * stepWidth;
        carousel.scrollTo({ left: closestPosition, behavior: "smooth" });

        window.setTimeout(() => {
          suppressClick = false;
          normalizeLoopPosition();
        }, 420);
      }

      carousel.addEventListener("pointerup", finishPointerDrag);
      carousel.addEventListener("pointercancel", finishPointerDrag);
      carousel.addEventListener("click", (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);
    }

    previous?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
  });
}

function initHomepageInteriorSlider() {
  const stage = document.querySelector("[data-interior-stage]");
  const slider = document.querySelector("[data-interior-slider]");
  if (!stage || !slider) return;

  const originals = Array.from(slider.querySelectorAll(".home-interior-panel"));
  if (originals.length < 2) return;

  const previous = stage.querySelector("[data-interior-prev]");
  const next = stage.querySelector("[data-interior-next]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const beforeClones = originals.map((panel) => panel.cloneNode(true));
  const afterClones = originals.map((panel) => panel.cloneNode(true));

  [...beforeClones, ...afterClones].forEach((clone) => {
    clone.setAttribute("aria-hidden", "true");
  });

  slider.prepend(...beforeClones);
  slider.append(...afterClones);

  let panels = Array.from(slider.querySelectorAll(".home-interior-panel"));
  let isDragging = false;
  let pointerStartX = 0;
  let startingScrollLeft = 0;
  let scrollTimer = 0;
  let navigationFrame = 0;

  function getGap() {
    return Number.parseFloat(getComputedStyle(slider).columnGap) || 12;
  }

  function getStep() {
    return (panels[0]?.getBoundingClientRect().width || slider.clientWidth * 0.78) + getGap();
  }

  function getGroupWidth() {
    return getStep() * originals.length;
  }

  function getMobileCenterOffset() {
    if (!window.matchMedia("(max-width: 639px)").matches) return 0;

    const panelWidth = panels[0]?.getBoundingClientRect().width || slider.clientWidth * 0.78;
    return Math.max(0, (slider.clientWidth - panelWidth) / 2);
  }

  function jumpTo(left) {
    const behavior = slider.style.scrollBehavior;
    slider.style.scrollBehavior = "auto";
    slider.scrollLeft = left;
    slider.style.scrollBehavior = behavior;
  }

  function normalizeLoopPosition() {
    if (isDragging) return;
    const groupWidth = getGroupWidth();
    if (slider.scrollLeft < groupWidth * 0.5) {
      jumpTo(slider.scrollLeft + groupWidth);
    } else if (slider.scrollLeft > groupWidth * 1.5) {
      jumpTo(slider.scrollLeft - groupWidth);
    }
  }

  function move(direction) {
    slider.scrollBy({
      left: direction * getStep(),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function updateInteriorNavigationPosition() {
    navigationFrame = 0;

    if (window.innerWidth >= 1024) {
      [previous, next].forEach((button) => {
        button?.style.removeProperty("left");
        button?.style.removeProperty("right");
        button?.style.removeProperty("transform");
      });
      return;
    }

    const stageRect = stage.getBoundingClientRect();
    const visiblePanels = panels
      .map((panel, index) => ({ panel, index, rect: panel.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > stageRect.left && rect.left < stageRect.right);

    if (!visiblePanels.length) return;

    const stageCenter = stageRect.left + stageRect.width / 2;
    const activePanel = visiblePanels.reduce((closest, candidate) => {
      const closestDistance = Math.abs((closest.rect.left + closest.rect.right) / 2 - stageCenter);
      const candidateDistance = Math.abs((candidate.rect.left + candidate.rect.right) / 2 - stageCenter);
      return candidateDistance < closestDistance ? candidate : closest;
    });

    function placeButton(button, adjacentPanel, isPrevious) {
      if (!button || !adjacentPanel) return;

      const gapCenter = isPrevious
        ? (adjacentPanel.getBoundingClientRect().right + activePanel.rect.left) / 2
        : (activePanel.rect.right + adjacentPanel.getBoundingClientRect().left) / 2;
      const halfButton = button.offsetWidth / 2;
      const localPosition = Math.min(
        stageRect.width - halfButton,
        Math.max(halfButton, gapCenter - stageRect.left),
      );

      button.style.left = `${localPosition}px`;
      button.style.right = "auto";
      button.style.transform = "translate(-50%, -50%)";
    }

    placeButton(previous, panels[activePanel.index - 1], true);
    placeButton(next, panels[activePanel.index + 1], false);
  }

  function queueInteriorNavigationPosition() {
    if (navigationFrame) return;
    navigationFrame = window.requestAnimationFrame(updateInteriorNavigationPosition);
  }

  slider.addEventListener("scroll", () => {
    queueInteriorNavigationPosition();
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(normalizeLoopPosition, 180);
  }, { passive: true });

  slider.addEventListener("scrollend", normalizeLoopPosition);
  slider.addEventListener("dragstart", (event) => event.preventDefault());
  slider.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("button")) return;
    isDragging = true;
    pointerStartX = event.clientX;
    startingScrollLeft = slider.scrollLeft;
    stage.classList.add("is-dragging");
    slider.setPointerCapture(event.pointerId);
  });

  slider.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    slider.scrollLeft = startingScrollLeft - (event.clientX - pointerStartX);
  });

  function finishDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove("is-dragging");
    if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);

    const step = getStep();
    slider.scrollTo({
      left: Math.round((slider.scrollLeft + getMobileCenterOffset()) / step) * step - getMobileCenterOffset(),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  slider.addEventListener("pointerup", finishDrag);
  slider.addEventListener("pointercancel", finishDrag);
  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  previous?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  requestAnimationFrame(() => {
    jumpTo(getGroupWidth() - getMobileCenterOffset());
    queueInteriorNavigationPosition();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      panels = Array.from(slider.querySelectorAll(".home-interior-panel"));
      normalizeLoopPosition();
      queueInteriorNavigationPosition();
    }, 160);
  });
}

function initActiveNavlink() {
  const currentPage = getCurrentPage();

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const page = link.dataset.page;

    if (page === currentPage) {
      link.dataset.active = "true";
      link.setAttribute("aria-current", "page");
    } else {
      link.dataset.active = "false";
      link.removeAttribute("aria-current");
    }
  });
}

function getCurrentPage() {
  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);
  let fileName = segments.pop() || "beranda";

  // Jika URL berakhir dengan folder, contoh:
  // localhost/grand-revamp/
  // maka anggap sebagai beranda
  if (path.endsWith("/")) {
    fileName = "beranda";
  }

  let page = fileName.replace(".html", "");

  // Jika pakai index.html, tetap aktifkan Beranda
  if (page === "index") {
    page = "beranda";
  }

  // Mapping halaman detail properti agar nav "Rumah Dijual" tetap aktif
  const rumahDijualPages = ["rumah-dijual", "luxora", "verona", "melodia"];

  if (rumahDijualPages.includes(page)) {
    return "rumah-dijual";
  }

  // Mapping halaman artikel blog agar nav "Blog" tetap aktif
  const blogPages = [
    "blogs",
    "tips-jual-rumah",
    "harga-pasaran-rumah-2026",
    "mimpi-beli-rumah",
    "pajak-jual-beli-rumah",
    "pemasaran-properti",
    "tips-foto-rumah-dijual",
    "renovasi-sebelum-jual-rumah",
    "cara-jual-rumah-ke-bank",
  ];

  if (
    path === "/blogs" ||
    path.startsWith("/blogs/") ||
    blogPages.includes(page) ||
    page.startsWith("blog") ||
    page.startsWith("artikel")
  ) {
    return "blogs";
  }

  return page || "beranda";
}

function initScrollTop() {
  const scrollButton = document.getElementById("scrollTopBtn");

  if (!scrollButton) return;

  function toggleScrollButton() {
    const showButton = window.scrollY > 300;

    scrollButton.classList.toggle("opacity-100", showButton);
    scrollButton.classList.toggle("opacity-0", !showButton);
    scrollButton.classList.toggle("pointer-events-auto", showButton);
    scrollButton.classList.toggle("pointer-events-none", !showButton);
  }

  toggleScrollButton();

  window.addEventListener("scroll", toggleScrollButton);

  scrollButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function initVideoModal() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");
  const openButtons = document.querySelectorAll("[data-video-open]");
  const closeButton = document.querySelector("[data-video-close]");

  if (!modal || !video || !openButtons.length) return;

  function openModal(src) {
    video.src = src;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    video.play().catch(() => {
      // Browser bisa menolak autoplay, user tetap bisa klik play manual.
    });
  }

  function closeModal() {
    video.pause();
    video.removeAttribute("src");
    video.load();

    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const src = button.dataset.videoSrc;
      if (!src) return;

      openModal(src);
    });
  });

  closeButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function initLocationSection() {
  const slider = document.getElementById("locationImageSlider");
  const cards = document.querySelectorAll("[data-location-card]");
  const dotsWrapper = document.querySelector("[data-location-dots]");

  if (!slider || !cards.length) return;

  let images = [];
  let currentIndex = 0;
  let autoSlideTimer = null;

  function setActiveCard(activeCard) {
    cards.forEach((card) => {
      card.dataset.active = card === activeCard ? "true" : "false";
    });
  }

  function renderImages(newImages, newAlts) {
    images = newImages;
    currentIndex = 0;

    slider.innerHTML = images
      .map((src, index) => {
        return `
          <img
            ${responsiveImageAttributes(src)}
            alt="${newAlts[index] || "lokasi-grand-ontama"}"
            class="sm:max-h-157 min-h-full w-full shrink-0 object-cover"
          />
        `;
      })
      .join("");

    renderDots();
    updateSlider();
    restartAutoSlide();
  }

  function renderDots() {
    if (!dotsWrapper) return;

    dotsWrapper.innerHTML = images
      .map((_, index) => {
        return `
          <button
            type="button"
            data-location-dot="${index}"
            class="h-2.5 w-2.5 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"
          }"
            aria-label="Gambar ${index + 1}"
          ></button>
        `;
      })
      .join("");

    dotsWrapper.querySelectorAll("[data-location-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        currentIndex = Number(dot.dataset.locationDot);
        updateSlider();
        restartAutoSlide();
      });
    });
  }

  function updateDots() {
    if (!dotsWrapper) return;

    dotsWrapper
      .querySelectorAll("[data-location-dot]")
      .forEach((dot, index) => {
        dot.classList.toggle("bg-white", index === currentIndex);
        dot.classList.toggle("bg-white/50", index !== currentIndex);
      });
  }

  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  }

  function goToNextImage() {
    if (!images.length) return;

    currentIndex = (currentIndex + 1) % images.length;
    updateSlider();
  }

  function restartAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
    }

    if (images.length <= 1) return;

    autoSlideTimer = setInterval(goToNextImage, 3500);
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const imageList = card.dataset.locationImages;

      if (!imageList) return;

      const newImages = imageList.split("|").map((item) => item.trim());
      const newAlts = (card.dataset.locationAlts || "")
        .split("|")
        .map((item) => item.trim());

      setActiveCard(card);
      renderImages(newImages, newAlts);
    });
  });

  const firstCard = document.querySelector("[data-location-default]") || cards[0];

  if (firstCard) {
    setActiveCard(firstCard);

    const firstImages = firstCard.dataset.locationImages
      .split("|")
      .map((item) => item.trim());
    const firstAlts = (firstCard.dataset.locationAlts || "")
      .split("|")
      .map((item) => item.trim());

    renderImages(firstImages, firstAlts);
  }
}

function showCustomAlert({
  type = "success",
  title = "Berhasil",
  message = "Pesan Anda telah terkirim.",
  buttonText = "Oke",
} = {}) {
  const oldAlert = document.querySelector("#custom-alert-overlay");
  if (oldAlert) oldAlert.remove();

  const isSuccess = type === "success";

  const iconName = isSuccess ? "check" : "close";

  const iconWrapperClass = isSuccess
    ? "bg-brand/30 text-brand"
    : "bg-red-100 text-red-700";

  const buttonClass = isSuccess
    ? "bg-brand hover:bg-brand/65"
    : "bg-red-600 hover:bg-red-700";

  const overlay = document.createElement("div");
  overlay.id = "custom-alert-overlay";
  overlay.className =
    "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 opacity-0 transition-opacity duration-300";

  overlay.innerHTML = `
    <div
      id="custom-alert-box"
      class="w-full max-w-md scale-95 rounded-2xl bg-white p-4 text-center shadow-2xl transition-all duration-300"
    >
      <div class="mx-auto my-5 flex h-16 w-16 items-center justify-center rounded-full ${iconWrapperClass}">
        ${localIcon(iconName, "size-10 leading-none", isSuccess ? "berhasil" : "gagal")}
      </div>

      <h3 class=" text-2xl font-medium text-gray-900">
        ${title}
      </h3>

      <p class="mb-7 text-sm leading-relaxed text-gray-600">
        ${message}
      </p>

      <button
        type="button"
        id="custom-alert-close"
        class="mx-auto w-fit rounded-full ${buttonClass} px-6 py-3 font-semibold text-white transition"
      >
        ${buttonText}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const box = overlay.querySelector("#custom-alert-box");
  const closeButton = overlay.querySelector("#custom-alert-close");

  requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
    overlay.classList.add("opacity-100");

    box.classList.remove("scale-95");
    box.classList.add("scale-100");
  });

  function closeAlert() {
    overlay.classList.remove("opacity-100");
    overlay.classList.add("opacity-0");

    box.classList.remove("scale-100");
    box.classList.add("scale-95");

    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = "";
    }, 300);
  }

  closeButton.addEventListener("click", closeAlert);

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeAlert();
    }
  });

  document.addEventListener(
    "keydown",
    function handleEsc(event) {
      if (event.key === "Escape") {
        closeAlert();
      }
    },
    { once: true }
  );
}

function initWhatsappContactForm() {
  const form = document.querySelector("[data-whatsapp-contact]");

  if (!form) return;

  const dateInput = form.querySelector("[data-contact-date]");
  const calendar = form.querySelector("[data-contact-calendar]");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  if (dateInput) {
    dateInput.min = today;
    if (!dateInput.value) dateInput.value = today;
  }

  if (dateInput && calendar) {
    const trigger = calendar.querySelector("[data-calendar-trigger]");
    const selectedLabel = calendar.querySelector("[data-calendar-selected]");
    const popover = calendar.querySelector("[data-calendar-popover]");
    const monthLabel = calendar.querySelector("[data-calendar-month]");
    const daysGrid = calendar.querySelector("[data-calendar-days]");
    const previousMonth = calendar.querySelector("[data-calendar-prev]");
    const nextMonth = calendar.querySelector("[data-calendar-next]");
    const minimumDate = new Date(year, now.getMonth(), now.getDate());
    let selectedDate = new Date(year, now.getMonth(), now.getDate());
    let visibleMonth = new Date(year, now.getMonth(), 1);

    function toDateValue(date) {
      return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
    }

    function updateSelectedLabel() {
      if (!selectedLabel) return;
      selectedLabel.textContent = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate);
    }

    function renderCalendar() {
      if (!monthLabel || !daysGrid) return;

      const viewYear = visibleMonth.getFullYear();
      const viewMonth = visibleMonth.getMonth();
      const firstDay = new Date(viewYear, viewMonth, 1);
      const firstDayOffset = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
      const gridStart = new Date(viewYear, viewMonth, 1 - firstDayOffset);

      monthLabel.textContent = new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(firstDay);

      daysGrid.innerHTML = Array.from({ length: totalCells }, (_, index) => {
        const date = new Date(
          gridStart.getFullYear(),
          gridStart.getMonth(),
          gridStart.getDate() + index,
        );
        const value = toDateValue(date);
        const isOutside = date.getMonth() !== viewMonth;
        const isSelected = value === toDateValue(selectedDate);
        const isToday = value === today;
        const isPast = date < minimumDate;
        const classNames = [
          "contact-calendar-day",
          isOutside ? "is-outside" : "",
          isSelected ? "is-selected" : "",
          isToday ? "is-today" : "",
        ].filter(Boolean).join(" ");
        const label = new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date);

        return `<button type="button" class="${classNames}" data-calendar-date="${value}" aria-label="${label}" aria-pressed="${isSelected}" ${isPast ? "disabled" : ""}>${date.getDate()}</button>`;
      }).join("");

      const currentMonth = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1);
      if (previousMonth) previousMonth.disabled = visibleMonth <= currentMonth;
    }

    function openCalendar() {
      if (!popover || !trigger) return;
      popover.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      renderCalendar();
    }

    function closeCalendar({ restoreFocus = false } = {}) {
      if (!popover || !trigger) return;
      popover.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    }

    trigger?.addEventListener("click", () => {
      if (popover?.hidden) openCalendar();
      else closeCalendar();
    });

    previousMonth?.addEventListener("click", () => {
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
      renderCalendar();
    });

    nextMonth?.addEventListener("click", () => {
      visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
      renderCalendar();
    });

    daysGrid?.addEventListener("click", (event) => {
      const dayButton = event.target.closest("[data-calendar-date]");
      if (!dayButton || dayButton.disabled) return;

      const [selectedYear, selectedMonth, selectedDay] = dayButton.dataset.calendarDate
        .split("-")
        .map(Number);
      selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
      visibleMonth = new Date(selectedYear, selectedMonth - 1, 1);
      dateInput.value = toDateValue(selectedDate);
      dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      updateSelectedLabel();
      closeCalendar({ restoreFocus: true });
    });

    document.addEventListener("click", (event) => {
      if (!calendar.contains(event.target)) closeCalendar();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && popover && !popover.hidden) {
        closeCalendar({ restoreFocus: true });
      }
    });

    updateSelectedLabel();
    renderCalendar();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const dateValue = String(formData.get("date") || "").trim();
    const visitorMessage = String(formData.get("message") || "").trim();
    const whatsappNumber = String(form.dataset.whatsappNumber || "").replace(/\D/g, "");
    const visitDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${dateValue}T00:00:00`));

    const message = [
      "Halo Grand Ontama, saya ingin booking jadwal kunjungan.",
      "",
      `*Nama:* ${name}`,
      `*Nomor Telepon:* ${phone}`,
      `*Tanggal Kunjungan:* ${visitDate}`,
      `*Pesan:* ${visitorMessage || "-"}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}

function initWhatsappQuestionForms() {
  document.querySelectorAll("[data-whatsapp-question]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const question = String(formData.get("message") || "").trim();
      const whatsappNumber = String(form.dataset.whatsappNumber || "").replace(/\D/g, "");
      const message = [
        "Halo Grand Ontama, saya ingin mendapatkan informasi mengenai hunian.",
        "",
        `*Nama:* ${name}`,
        `*Email:* ${email}`,
        `*Nomor Telepon:* ${phone}`,
        `*Pertanyaan:* ${question}`,
      ].join("\n");

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  });
}

function initFaqAccordion() {
  const faqItems = document.querySelectorAll("[data-faq-item]");

  if (!faqItems.length) return;

  function closeItem(item) {
    const button = item.querySelector("[data-faq-button]");
    const content = item.querySelector("[data-faq-content]");
    const icon = item.querySelector("[data-faq-icon]");
    const title = button?.querySelector("span");
    const text = content?.querySelector("p");

    item.dataset.active = "false";
    button?.setAttribute("aria-expanded", "false");

    item.classList.remove("bg-brand");
    item.classList.add("bg-white");

    content?.classList.add("hidden");

    if (icon) {
      icon.dataset.icon = "plus";
      icon.src = `${APP_BASE}assets/icons/plus.webp`;
      icon.alt = "buka-pertanyaan";
      icon.classList.remove("icon-white");
      icon.classList.add("icon-brand");
    }

    title?.classList.remove("text-white");
    title?.classList.add("text-content-title");

    text?.classList.remove("text-white/90");
    text?.classList.add("text-content-grey");
  }

  function openItem(item) {
    const button = item.querySelector("[data-faq-button]");
    const content = item.querySelector("[data-faq-content]");
    const icon = item.querySelector("[data-faq-icon]");
    const title = button?.querySelector("span");
    const text = content?.querySelector("p");

    item.dataset.active = "true";
    button?.setAttribute("aria-expanded", "true");

    item.classList.remove("bg-white");
    item.classList.add("bg-brand");

    content?.classList.remove("hidden");

    if (icon) {
      icon.dataset.icon = "minus";
      icon.src = `${APP_BASE}assets/icons/minus.webp`;
      icon.alt = "tutup-pertanyaan";
      icon.classList.remove("icon-brand");
      icon.classList.add("icon-white");
    }

    title?.classList.remove("text-content-title");
    title?.classList.add("text-white");

    text?.classList.remove("text-content-grey");
    text?.classList.add("text-white/90");
  }

  faqItems.forEach((item) => {
    const button = item.querySelector("[data-faq-button]");

    button?.addEventListener("click", () => {
      const isActive = item.dataset.active === "true";

      faqItems.forEach(closeItem);

      if (!isActive) {
        openItem(item);
      }
    });
  });

  // Pastikan FAQ ke-2 aktif saat awal.
  const activeItem =
    document.querySelector('[data-faq-item][data-active="true"]') ||
    faqItems[1];

  faqItems.forEach(closeItem);

  if (activeItem) {
    openItem(activeItem);
  }
}

function initAosAnimations() {
  if (document.body.dataset.page === "beranda") return;

  const sections = document.querySelectorAll("main > section");
  if (!sections.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -60px" },
  );

  sections.forEach((section) => {
    section.setAttribute("data-reveal", "");
    observer.observe(section);
  });
}

function initSmoothScroll() {
  const links = document.querySelectorAll("[data-smooth-scroll]");

  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      const extraDown = 30;
      const navbarOffset = 60;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navbarOffset +
        extraDown;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });
  });
}

function initAboutTabs() {
  const tabs = document.querySelectorAll("[data-about-tab]");
  const contents = document.querySelectorAll("[data-about-content]");

  if (!tabs.length || !contents.length) return;

  function activateTab(activeTab) {
    const targetId = activeTab.dataset.aboutTarget;

    tabs.forEach((tab) => {
      tab.dataset.active = tab === activeTab ? "true" : "false";
    });

    contents.forEach((content) => {
      content.classList.toggle("hidden", content.id !== targetId);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  const defaultTab =
    document.querySelector('[data-about-tab][data-active="true"]') || tabs[0];

  activateTab(defaultTab);
}

function initAboutValueCards() {
  const preview = document.getElementById("aboutValuePreview");
  const cards = document.querySelectorAll("[data-about-value-card]");

  if (!preview || !cards.length) return;

  function activateCard(activeCard) {
    cards.forEach((card) => {
      card.dataset.active = card === activeCard ? "true" : "false";
    });

    const img = activeCard.dataset.img;
    const alt = activeCard.dataset.alt || "Nilai inti Grand Ontama";

    if (img) {
      preview.style.opacity = "0";

      setTimeout(() => {
        preview.src = img;
        preview.alt = alt;
        preview.style.opacity = "1";
      }, 180);
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => activateCard(card));
  });

  activateCard(cards[0]);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");

  if (!counters.length) return;

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.counterEnd || 0);
    const duration = 1300;
    const startTime = performance.now();

    function update(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const value = Math.floor(progress * target);

      counter.textContent = String(value);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = String(target);
      }
    }

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.4,
    },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initPropertyReadMore() {
  const buttons = document.querySelectorAll("[data-readmore-button]");

  if (!buttons.length) return;

  buttons.forEach((button) => {
    const targetSelector = button.dataset.target;
    const target = document.querySelector(targetSelector);

    if (!target) return;

    button.addEventListener("click", () => {
      const expanded = target.dataset.expanded === "true";

      target.dataset.expanded = expanded ? "false" : "true";
      target.classList.toggle("line-clamp-3", expanded);

      button.textContent = expanded ? "Read More..." : "Show Less";
    });
  });
}

function initPropertyAccordions() {
  const accordions = [...document.querySelectorAll("[data-property-accordion]")];

  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const button = accordion.querySelector("[data-property-accordion-button]");
    const content = accordion.querySelector(
      "[data-property-accordion-content]",
    );
    const icon = accordion.querySelector("[data-property-accordion-icon]");

    if (!button || !content) return;

    function setState(isOpen) {
      accordion.dataset.active = isOpen ? "true" : "false";
      button.setAttribute("aria-expanded", String(isOpen));

      content.classList.toggle("hidden", !isOpen);
      icon?.classList.toggle("rotate-180", isOpen);
    }

    setState(accordion.dataset.active === "true");

    button.addEventListener("click", () => {
      const isOpen = accordion.dataset.active === "true";

      if (!isOpen) {
        accordions.forEach((otherAccordion) => {
          if (otherAccordion === accordion) return;

          const otherButton = otherAccordion.querySelector(
            "[data-property-accordion-button]",
          );
          const otherContent = otherAccordion.querySelector(
            "[data-property-accordion-content]",
          );
          const otherIcon = otherAccordion.querySelector(
            "[data-property-accordion-icon]",
          );

          otherAccordion.dataset.active = "false";
          otherButton?.setAttribute("aria-expanded", "false");
          otherContent?.classList.add("hidden");
          otherIcon?.classList.remove("rotate-180");
        });
      }

      setState(!isOpen);
    });
  });
}

function initDestinationFilter() {
  const filters = document.querySelectorAll("[data-destination-filter]");
  const items = document.querySelectorAll("[data-destination-item]");

  if (!filters.length || !items.length) return;

  function activateFilter(activeFilter) {
    const category = activeFilter.dataset.destinationFilter;

    filters.forEach((filter) => {
      filter.dataset.active = filter === activeFilter ? "true" : "false";

      filter.classList.toggle("bg-brand", filter === activeFilter);
      filter.classList.toggle("text-white", filter === activeFilter);
      filter.classList.toggle("bg-neutral-100", filter !== activeFilter);
      filter.classList.toggle("text-content-grey", filter !== activeFilter);
    });

    items.forEach((item) => {
      const show = item.dataset.cat === category;

      item.classList.toggle("hidden", !show);
      item.classList.toggle("flex", show);
    });
  }

  filters.forEach((filter) => {
    filter.addEventListener("click", () => activateFilter(filter));
  });

  const activeFilter =
    document.querySelector('[data-destination-filter][data-active="true"]') ||
    filters[0];

  activateFilter(activeFilter);
}

function initVisitModal() {
  const modal = document.getElementById("visitModal");
  const openButton = document.getElementById("openVisitModal");
  const submitButton = document.getElementById("vmSubmit");
  const dateInput = document.getElementById("vmDate");
  const notesInput = document.getElementById("vmNotes");

  if (!modal || !openButton) return;

  function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
  }

  openButton.addEventListener("click", openModal);

  modal
    .querySelectorAll('[data-modal-close="visitModal"]')
    .forEach((button) => {
      button.addEventListener("click", closeModal);
    });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  submitButton?.addEventListener("click", () => {
    const dateValue = dateInput?.value || "";
    const notesValue = notesInput?.value || "";
    const propertyName =
      document.querySelector("[data-property-name]")?.dataset.propertyName ||
      "Grand Ontama";

    const message = encodeURIComponent(
      `Halo Grand Ontama, saya ingin jadwalkan kunjungan rumah ${propertyName}.\nTanggal: ${dateValue || "-"
      }\nCatatan: ${notesValue || "-"}`,
    );

    window.open(`https://wa.me/6285888090888?text=${message}`, "_blank");
  });
}

function initArticleShareButtons() {
  document.querySelectorAll("main[data-current-post]").forEach((main) => {
    const meta = main.querySelector(
      "section > div > .flex[data-aos='fade-down']",
    );
    const title = main.querySelector("h1")?.textContent?.trim();

    if (!meta || !title || meta.querySelector("[data-property-share]")) return;

    meta.classList.add("w-full", "justify-between", "gap-4");

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.dataset.propertyShare = "";
    shareButton.dataset.shareText = `Baca artikel ${title} di Grand Ontama.`;
    shareButton.className =
      "interactive-text-icon inline-flex items-center gap-2 font-medium text-neutral-700 transition hover:text-[#0866AE]";
    shareButton.innerHTML = `${localIcon("share", "size-5", "bagikan")}<span>Bagikan</span>`;
    meta.append(shareButton);
  });
}

function initShareModal() {
  const modal = document.getElementById("shareModal");
  const triggers = document.querySelectorAll("[data-property-share]");
  const dialog = modal?.querySelector("[data-share-dialog]");
  const linkInput = modal?.querySelector("[data-share-url]");
  const copyButton = modal?.querySelector("[data-share-copy]");
  const status = modal?.querySelector("[data-share-status]");

  if (!modal || !dialog || !triggers.length) return;

  let lastTrigger = null;
  let shareText = "Lihat hunian Grand Ontama.";

  function openModal(trigger) {
    lastTrigger = trigger;
    shareText = trigger.dataset.shareText || "Lihat hunian Grand Ontama.";
    if (linkInput) linkInput.value = window.location.href;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("overflow-hidden");
    window.setTimeout(() => {
      if (!modal.classList.contains("hidden")) dialog.focus();
    }, 0);
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overflow-hidden");
    lastTrigger?.focus();
  }

  function getShareUrl(app) {
    const pageUrl = window.location.href;
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedText = encodeURIComponent(shareText);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      instagram: `https://www.instagram.com/`,
      tiktok: `https://www.tiktok.com/`,
      discord: `https://discord.com/channels/@me`,
    };

    return urls[app] || pageUrl;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openModal(trigger));
  });

  modal.querySelectorAll("[data-share-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  modal.querySelectorAll("[data-share-app]").forEach((button) => {
    button.addEventListener("click", async () => {
      const app = button.dataset.shareApp;

      if (!app) return;

      if (["instagram", "tiktok", "discord"].includes(app)) {
        try {
          await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
          status.textContent = "Tautan disalin. Tempelkan di aplikasi tujuan.";
        } catch {
          linkInput?.select();
          document.execCommand("copy");
        }
      }

      window.open(getShareUrl(app), "_blank", "noopener,noreferrer");
    });
  });

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      linkInput?.select();
      document.execCommand("copy");
    }

    status.textContent = "Tautan halaman berhasil disalin.";
  });

  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    } else if (event.key === "Tab") {
      const focusable = [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
        .filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
  });

  document.addEventListener("focusin", (event) => {
    if (!modal.classList.contains("hidden") && !dialog.contains(event.target)) dialog.focus();
  });
}

function initBlogIndex() {
  const root = document.querySelector("[data-blog-index]");

  if (!root) return;

  const filters = [...root.querySelectorAll("[data-blog-filter]")];
  const cards = [...root.querySelectorAll("[data-blog-card]")];
  const pagination = root.querySelector("[data-blog-pagination]");
  const emptyState = root.querySelector("[data-blog-empty]");
  const grid = root.querySelector("[data-blog-grid]");
  const categorySlider = root.querySelector(".blog-category-slider");
  const mobileQuery = window.matchMedia("(max-width: 639px)");
  const tabletQuery = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");
  let activeCategory = "";
  let currentPage = 1;
  let categoryPointerStart = null;
  let suppressCategoryClick = false;

  function scrollToBlogGrid() {
    if (!grid) return;

    const navbar = document.querySelector("[data-navbar]");
    const navbarOffset = navbar
      ? navbar.getBoundingClientRect().height + 16
      : 16;
    const targetPosition = Math.max(
      0,
      grid.getBoundingClientRect().top + window.scrollY - navbarOffset,
    );

    window.scrollTo({ top: targetPosition, behavior: "smooth" });
  }

  if (categorySlider) {
    categorySlider.addEventListener("pointerdown", (event) => {
      categoryPointerStart = { x: event.clientX, y: event.clientY };
      suppressCategoryClick = false;
    });

    categorySlider.addEventListener("pointermove", (event) => {
      if (!categoryPointerStart) return;

      const distanceX = Math.abs(event.clientX - categoryPointerStart.x);
      const distanceY = Math.abs(event.clientY - categoryPointerStart.y);

      if (distanceX > 8 && distanceX > distanceY) {
        suppressCategoryClick = true;
      }
    });

    const finishCategoryPointer = () => {
      categoryPointerStart = null;
      if (!suppressCategoryClick) return;

      window.setTimeout(() => {
        suppressCategoryClick = false;
      }, 250);
    };

    categorySlider.addEventListener("pointerup", finishCategoryPointer);
    categorySlider.addEventListener("pointercancel", finishCategoryPointer);
  }

  function itemsPerPage() {
    if (mobileQuery.matches) return 3;
    if (tabletQuery.matches) return 4;
    return 9;
  }

  function eligibleCards() {
    return cards.filter(
      (card) => !activeCategory || card.dataset.category === activeCategory,
    );
  }

  function pageButton(label, page, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "blog-page-button";
    button.innerHTML = label;

    if (options.active) {
      button.dataset.active = "true";
      button.setAttribute("aria-current", "page");
    }

    if (options.disabled) {
      button.disabled = true;
    } else {
      button.addEventListener("click", () => {
        currentPage = page;
        render();
        scrollToBlogGrid();
      });
    }

    return button;
  }

  function renderPagination(totalPages) {
    if (!pagination) return;

    pagination.replaceChildren();

    if (totalPages <= 1) {
      pagination.classList.add("hidden");
      return;
    }

    pagination.classList.remove("hidden");
    pagination.append(
      pageButton(localIcon("arrow-right", "size-5 blog-pagination-icon blog-pagination-icon-prev", "prev"), currentPage - 1, {
        disabled: currentPage === 1,
      }),
    );

    for (let page = 1; page <= totalPages; page += 1) {
      pagination.append(
        pageButton(String(page), page, { active: page === currentPage }),
      );
    }

    pagination.append(
      pageButton(localIcon("arrow-right", "size-5 blog-pagination-icon", "next"), currentPage + 1, {
        disabled: currentPage === totalPages,
      }),
    );
  }

  function render() {
    const filteredCards = eligibleCards();
    const perPage = itemsPerPage();
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / perPage));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * perPage;
    const visibleCards = new Set(filteredCards.slice(start, start + perPage));

    cards.forEach((card) => card.classList.toggle("hidden", !visibleCards.has(card)));
    emptyState?.classList.toggle("hidden", filteredCards.length !== 0);
    renderPagination(totalPages);
  }

  filters.forEach((filter) => {
    filter.addEventListener("click", (event) => {
      if (suppressCategoryClick) {
        event.preventDefault();
        return;
      }

      const selectedCategory = filter.dataset.blogFilter || "";
      activeCategory = activeCategory === selectedCategory ? "" : selectedCategory;
      currentPage = 1;

      filters.forEach((item) => {
        item.dataset.active = String(item.dataset.blogFilter === activeCategory);
      });

      render();
    });
  });

  mobileQuery.addEventListener("change", render);
  tabletQuery.addEventListener("change", render);

  render();
}

const BLOG_POSTS = (() => {
  const source = document.getElementById("site-blog-posts");

  if (!source?.textContent) return [];

  try {
    return JSON.parse(source.textContent);
  } catch (error) {
    return [];
  }
})();

function getCurrentPostSlug() {
  const fromDataset = document.querySelector("[data-current-post]")?.dataset
    .currentPost;

  if (fromDataset) return fromDataset;

  const pathname = window.location.pathname;
  const filename = pathname.split("/").filter(Boolean).pop() || "";

  return filename.replace(".html", "");
}

function createRelatedPostCard(post) {
  return `
    <article
      class="w-[78vw] shrink-0 overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl sm:w-[46vw] md:w-[42vw] lg:w-auto lg:shrink"
    >
      <div>
        <img
          ${responsiveImageAttributes(post.image)}
          alt="${post.alt}"
          loading="lazy" decoding="async"
          class="h-56 w-full object-cover"
        />

        <div class="p-5">
          <span class="text-xs font-medium text-[#0879bd]">
            ${post.categoryLabel}
          </span>
          <span class="mt-2 block text-xs font-medium text-content-grey">
            ${post.date}
          </span>

          <h3
            class="lg:mt-3 line-clamp-2 text-xl font-semibold leading-6.2 text-content-title"
          >
            ${post.title}
          </h3>

          <p
            class="mt-4 line-clamp-2 text-base leading-6.2 text-content-grey"
          >
            ${post.description}
          </p>

          <a
            href="${post.href}"
            aria-label="Baca artikel ${post.title}"
            class="blog-read-more mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 lg:px-7 lg:py-3 text-base font-medium text-white transition hover:bg-[#0879BD]"
          >
            Read More
            ${localIcon("arrow-left", "size-5", "read-more")}
          </a>
        </div>
      </div>
    </article>
  `;
}

function initRelatedPosts() {
  const container = document.querySelector("[data-related-posts]");
  if (!container) return;

  const currentSlug = getCurrentPostSlug();

  const relatedPosts = BLOG_POSTS.filter(
    (post) => post.slug !== currentSlug,
  ).slice(0, 3);

  container.innerHTML = relatedPosts.map(createRelatedPostCard).join("");

}

function initPropertyDetailGallery() {
  document.querySelectorAll("[data-property-gallery]").forEach((gallery) => {
    const mainImage = gallery.querySelector("[data-gallery-main]");
    const thumbs = [...gallery.querySelectorAll("[data-gallery-thumb]")];
    const thumbStrip = gallery.querySelector(".property-gallery-thumbs");
    const previous = gallery.querySelector("[data-gallery-prev]");
    const next = gallery.querySelector("[data-gallery-next]");

    if (!mainImage || !thumbs.length) return;

    let activeIndex = 0;
    let thumbPointerStart = null;
    let suppressThumbnailClick = false;

    if (thumbStrip) {
      thumbStrip.addEventListener("pointerdown", (event) => {
        thumbPointerStart = { x: event.clientX, y: event.clientY };
        suppressThumbnailClick = false;
      });

      thumbStrip.addEventListener("pointermove", (event) => {
        if (!thumbPointerStart) return;

        const distanceX = Math.abs(event.clientX - thumbPointerStart.x);
        const distanceY = Math.abs(event.clientY - thumbPointerStart.y);

        if (distanceX > 8 && distanceX > distanceY) {
          suppressThumbnailClick = true;
        }
      });

      const finishThumbnailPointer = () => {
        thumbPointerStart = null;
        if (!suppressThumbnailClick) return;

        window.setTimeout(() => {
          suppressThumbnailClick = false;
        }, 250);
      };

      thumbStrip.addEventListener("pointerup", finishThumbnailPointer);
      thumbStrip.addEventListener("pointercancel", finishThumbnailPointer);
    }

    function revealActiveThumb() {
      if (!thumbStrip || !window.matchMedia("(max-width: 639px)").matches) return;

      const activeThumb = thumbs[activeIndex];
      const targetLeft = Math.max(
        0,
        activeThumb.offsetLeft - (thumbStrip.clientWidth - activeThumb.clientWidth) / 2,
      );

      thumbStrip.scrollTo({ left: targetLeft, behavior: "smooth" });
    }

    function showImage(index) {
      activeIndex = (index + thumbs.length) % thumbs.length;
      const image = thumbs[activeIndex].querySelector("img");

      if (!image) return;

      mainImage.classList.add("is-changing");

      window.setTimeout(() => {
        mainImage.src = image.src;
        if (image.srcset) mainImage.srcset = image.srcset;
        else mainImage.removeAttribute("srcset");
        mainImage.alt = image.alt;
        mainImage.classList.remove("is-changing");
      }, 110);

      thumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle("is-active", thumbIndex === activeIndex);
        thumb.setAttribute("aria-current", thumbIndex === activeIndex ? "true" : "false");
      });

      revealActiveThumb();
    }

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener("click", (event) => {
        if (suppressThumbnailClick) {
          event.preventDefault();
          return;
        }

        showImage(index);
      });
    });

    previous?.addEventListener("click", () => showImage(activeIndex - 1));
    next?.addEventListener("click", () => showImage(activeIndex + 1));
  });
}

function initKprOptions() {
  document.querySelectorAll("[data-kpr-options]").forEach((group) => {
    const options = [...group.querySelectorAll("[data-kpr-option]")];
    const status = group.parentElement?.querySelector("[data-kpr-status]");

    options.forEach((option) => {
      option.addEventListener("click", () => {
        options.forEach((item) => {
          item.dataset.active = item === option ? "true" : "false";
        });

        if (status) {
          status.textContent = `Estimasi cicilan ${option.dataset.period}: ${option.dataset.payment} per bulan`;
        }
      });
    });
  });
}

function initMobileKprCard() {
  const mobileQuery = window.matchMedia("(max-width: 639px)");

  document.querySelectorAll("[data-property-kpr-card]").forEach((card) => {
    const gallerySection = document.querySelector("[data-property-gallery]")?.closest("section");
    const originalParent = card.parentElement;
    const marker = document.createComment("property-kpr-card-position");
    const label = card.querySelector("[data-kpr-start-label]");
    const price = card.querySelector("[data-kpr-start-price]");
    const summary = card.querySelector("[data-kpr-price-summary]");
    const orderLink = card.querySelector("[data-kpr-order]");
    const footer = document.querySelector(".site-footer");

    if (!gallerySection || !originalParent || !label || !price || !summary || !orderLink) return;

    originalParent.insertBefore(marker, card);

    const stickyCard = document.createElement("aside");
    stickyCard.className = "mobile-kpr-sticky";
    const stickyContent = document.createElement("div");
    stickyContent.append(
      label.cloneNode(true),
      price.cloneNode(true),
      summary.cloneNode(true),
      orderLink.cloneNode(true),
    );
    stickyCard.append(stickyContent);
    document.body.append(stickyCard);

    function updateStickyCard() {
      if (!mobileQuery.matches) {
        stickyCard.classList.remove("is-visible");
        return;
      }

      const footerIsVisible = footer && footer.getBoundingClientRect().top <= window.innerHeight;
      stickyCard.classList.toggle(
        "is-visible",
        card.getBoundingClientRect().bottom < 0 && !footerIsVisible,
      );
    }

    function updateCardPosition() {
      if (mobileQuery.matches) {
        gallerySection.after(card);
        card.classList.add("mobile-kpr-static");
      } else {
        marker.after(card);
        card.classList.remove("mobile-kpr-static");
      }

      updateStickyCard();
    }

    mobileQuery.addEventListener("change", updateCardPosition);
    window.addEventListener("scroll", updateStickyCard, { passive: true });
    updateCardPosition();
  });
}

function initGlobalAudio() {
  if (window.__grandAudioInit) return;
  window.__grandAudioInit = true;

  const TIME_KEY = "grand_ontama_audio_time";
  const PREF_KEY = "grand_ontama_audio_pref";
  const AUDIO_SRC = `${APP_BASE}assets/audio/Grand_Ontama.mp3`;

  let audio = null;
  let saveTimer = null;
  let hasRestoredTime = false;

  function loadPref() {
    try {
      return JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function savePref(pref) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(pref || {}));
    } catch (error) { }
  }

  function getSavedTime() {
    try {
      const savedTime = parseFloat(localStorage.getItem(TIME_KEY));

      if (Number.isFinite(savedTime) && savedTime > 0) {
        return savedTime;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  function ensureAudio() {
    if (audio) return audio;

    audio = document.getElementById("site-music");

    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "site-music";
      audio.loop = true;
      audio.preload = "metadata";
      audio.setAttribute("playsinline", "");
      audio.style.display = "none";

      const source = document.createElement("source");
      source.src = AUDIO_SRC;
      source.type = "audio/mpeg";

      audio.appendChild(source);
      document.body.appendChild(audio);
    }

    audio.muted = false;
    audio.volume = 1;

    return audio;
  }

  function restoreAudioTime(audioElement) {
    if (!audioElement || hasRestoredTime) return;

    const savedTime = getSavedTime();

    if (!savedTime) return;

    function applySavedTime() {
      try {
        audioElement.currentTime = savedTime;
        hasRestoredTime = true;
      } catch (error) { }
    }

    if (audioElement.readyState >= 1) {
      applySavedTime();
    } else {
      audioElement.addEventListener("loadedmetadata", applySavedTime, {
        once: true,
      });
    }
  }

  function saveAudioTime(audioElement = audio) {
    if (!audioElement || audioElement.ended) return;

    try {
      const currentTime = audioElement.currentTime;

      if (Number.isFinite(currentTime) && currentTime > 0) {
        localStorage.setItem(TIME_KEY, String(currentTime));
      }
    } catch (error) { }
  }

  function startSavingAudioTime(audioElement) {
    if (saveTimer) return;

    saveTimer = setInterval(() => {
      saveAudioTime(audioElement);
    }, 500);

    audioElement.addEventListener("timeupdate", () => {
      saveAudioTime(audioElement);
    });
  }

  async function playAudio({ fromInteraction = false } = {}) {
    const audioElement = ensureAudio();

    restoreAudioTime(audioElement);

    try {
      await audioElement.play();

      savePref({
        hasStartedMusic: true,
      });

      startSavingAudioTime(audioElement);
      removeInteractionListeners();
    } catch (error) {
      if (!fromInteraction) {
        addInteractionListeners();
      }
    }
  }

  function handleFirstInteraction() {
    playAudio({
      fromInteraction: true,
    });
  }

  function addInteractionListeners() {
    window.addEventListener("scroll", handleFirstInteraction, true);
    window.addEventListener("wheel", handleFirstInteraction, true);
    window.addEventListener("touchmove", handleFirstInteraction, true);
    window.addEventListener("pointerdown", handleFirstInteraction, true);
    window.addEventListener("mousedown", handleFirstInteraction, true);
    window.addEventListener("click", handleFirstInteraction, true);
    window.addEventListener("touchstart", handleFirstInteraction, true);
    window.addEventListener("keydown", handleFirstInteraction, true);
  }

  function removeInteractionListeners() {
    window.removeEventListener("scroll", handleFirstInteraction, true);
    window.removeEventListener("wheel", handleFirstInteraction, true);
    window.removeEventListener("touchmove", handleFirstInteraction, true);
    window.removeEventListener("pointerdown", handleFirstInteraction, true);
    window.removeEventListener("mousedown", handleFirstInteraction, true);
    window.removeEventListener("click", handleFirstInteraction, true);
    window.removeEventListener("touchstart", handleFirstInteraction, true);
    window.removeEventListener("keydown", handleFirstInteraction, true);
  }

  function isInternalLink(link) {
    if (!link || !link.href) return false;

    try {
      const url = new URL(link.href, window.location.href);

      return (
        url.origin === window.location.origin &&
        url.protocol !== "tel:" &&
        url.protocol !== "mailto:" &&
        !link.hasAttribute("download") &&
        link.target !== "_blank"
      );
    } catch (error) {
      return false;
    }
  }

  function saveBeforeNavigation(event) {
    const link = event.target.closest("a");

    if (!isInternalLink(link)) return;

    saveAudioTime(audio);
  }

  document.addEventListener("touchstart", saveBeforeNavigation, true);
  document.addEventListener("pointerdown", saveBeforeNavigation, true);
  document.addEventListener("click", saveBeforeNavigation, true);

  window.addEventListener("pagehide", () => {
    saveAudioTime(audio);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      saveAudioTime(audio);
    }
  });

  const pref = loadPref();

  if (pref.hasStartedMusic) {
    playAudio({
      fromInteraction: false,
    });
  } else {
    addInteractionListeners();
  }
}

function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        `${APP_BASE}sw.js`
      );

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("Versi baru website tersedia.");
          }
        });
      });

      console.log("Service worker aktif:", registration.scope);
    } catch (error) {
      console.warn("Service worker gagal didaftarkan:", error);
    }
  });
}
