import { H as Hls } from "./hls-vendor-dru42stk.js";

function selectAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function initMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  const slides = selectAll("[data-hero-slide]", carousel);
  const dots = selectAll("[data-hero-dot]", carousel);

  if (slides.length <= 1) {
    return;
  }

  let current = 0;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => show(index));
  });

  window.setInterval(() => {
    show(current + 1);
  }, 5200);
}

function initSiteSearchForms() {
  selectAll("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const base = form.getAttribute("data-search-target") || "search.html";
      const prefix = window.location.pathname.includes("/movies/") ? "../" : "./";
      window.location.href = `${prefix}${base}?q=${encodeURIComponent(query)}`;
    });
  });
}

function initFilters() {
  const form = document.querySelector("[data-filter-form]");

  if (!form) {
    return;
  }

  const queryInput = form.querySelector("[data-filter-query]");
  const yearInput = form.querySelector("[data-filter-year]");
  const typeInput = form.querySelector("[data-filter-type]");
  const categoryInput = form.querySelector("[data-filter-category]");
  const countNode = form.querySelector("[data-filter-count]");
  const cards = selectAll("[data-card]");
  const url = new URL(window.location.href);
  const queryFromUrl = url.searchParams.get("q");

  if (queryFromUrl && queryInput) {
    queryInput.value = queryFromUrl;
  }

  function applyFilters() {
    const query = queryInput ? queryInput.value.trim().toLowerCase() : "";
    const minYear = yearInput && yearInput.value ? Number(yearInput.value) : 0;
    const type = typeInput ? typeInput.value : "";
    const category = categoryInput ? categoryInput.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const searchText = card.dataset.search || "";
      const year = Number(card.dataset.year || 0);
      const cardType = card.dataset.type || "";
      const cardCategory = card.dataset.category || "";
      const matched =
        (!query || searchText.includes(query)) &&
        (!minYear || year >= minYear) &&
        (!type || cardType === type) &&
        (!category || cardCategory === category);

      card.classList.toggle("is-hidden", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(visible);
    }
  }

  form.addEventListener("input", applyFilters);
  form.addEventListener("change", applyFilters);
  form.addEventListener("reset", () => {
    window.setTimeout(applyFilters, 0);
  });
  applyFilters();
}

function initImageFallbacks() {
  selectAll("img[data-cover]").forEach((image) => {
    image.addEventListener("error", () => {
      const holder = image.closest(".poster, .hero-art, .rank-cover, .category-sample");
      if (holder) {
        holder.classList.add("poster-fallback");
      }
      image.remove();
    });
  });
}

function initPlayers() {
  selectAll("video[data-hls]").forEach((video) => {
    const source = video.dataset.hls;
    const button = video.parentElement ? video.parentElement.querySelector("[data-player-start]") : null;

    if (!source) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    if (button) {
      button.addEventListener("click", async () => {
        try {
          await video.play();
          button.classList.add("is-hidden");
        } catch (error) {
          button.textContent = "重试";
        }
      });

      video.addEventListener("play", () => {
        button.classList.add("is-hidden");
      });

      video.addEventListener("pause", () => {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initHeroCarousel();
  initSiteSearchForms();
  initFilters();
  initImageFallbacks();
  initPlayers();
});
