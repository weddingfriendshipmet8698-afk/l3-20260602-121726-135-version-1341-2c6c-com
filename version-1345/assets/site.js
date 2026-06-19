(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    if (slides.length > 1) {
      start();
    }
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-search-year]");
    var typeSelect = document.querySelector("[data-search-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var count = document.querySelector("[data-search-count]");

    if (!input || !cards.length) {
      return;
    }

    function includesValue(text, value) {
      return !value || text.indexOf(value.toLowerCase()) !== -1;
    }

    function filterCards() {
      var keyword = input.value.trim().toLowerCase();
      var yearValue = yearSelect ? yearSelect.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : "";
      var shown = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search-text") || "";
        var matched = includesValue(text, keyword) && includesValue(text, yearValue) && includesValue(text, typeValue);
        card.style.display = matched ? "" : "none";

        if (matched) {
          shown += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + shown + " 部影片";
      }
    }

    input.addEventListener("input", filterCards);

    if (yearSelect) {
      yearSelect.addEventListener("change", filterCards);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", filterCards);
    }

    filterCards();
  }

  ready(function () {
    initMobileNav();
    initHero();
    initSearch();
  });
})();
