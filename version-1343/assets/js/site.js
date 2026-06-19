(function() {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function() {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function(dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            dots.forEach(function(dot, dotIndex) {
                dot.addEventListener("click", function() {
                    showSlide(dotIndex);
                });
            });
            setInterval(function() {
                showSlide(current + 1);
            }, 5800);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var activeFilter = "all";

        function applySearch() {
            var query = searchInputs.map(function(input) {
                return input.value.trim().toLowerCase();
            }).filter(Boolean).join(" ");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
                var matchesSearch = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                card.hidden = !(matchesSearch && matchesFilter);
            });
        }

        searchInputs.forEach(function(input) {
            input.addEventListener("input", applySearch);
        });

        filterButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                activeFilter = button.getAttribute("data-filter-value") || "all";
                filterButtons.forEach(function(item) {
                    item.classList.toggle("is-active", item === button);
                });
                applySearch();
            });
        });
    });
})();

function initMoviePlayer(videoId, playId, streamUrl) {
    var video = document.getElementById(videoId);
    var play = document.getElementById(playId);
    if (!video || !play || !streamUrl) {
        return;
    }

    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        loadStream();
        play.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function() {});
        }
    }

    play.addEventListener("click", start);
    video.addEventListener("click", function() {
        if (video.paused) {
            start();
        }
    });
    window.addEventListener("pagehide", function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
