(function () {
  var ready = function (fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  };

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide") || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInput = document.getElementById("searchInput") || document.getElementById("categoryFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-cards .movie-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var emptyState = document.querySelector(".empty-state");
    var activeFilter = "all";

    function applyFilters() {
      if (!cards.length) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var group = card.getAttribute("data-group") || "";
        var type = card.getAttribute("data-type") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = activeFilter === "all" || group === activeFilter || type.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter) !== -1;
        var visible = matchQuery && matchFilter;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("show", shown === 0);
      }
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        searchInput.value = q;
      }
      searchInput.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "all";
        applyFilters();
      });
    });

    applyFilters();

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".play-cover");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream") || "";
      var attached = false;

      function attachStream() {
        if (attached || !streamUrl) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          video._hls = hls;
          attached = true;
          return;
        }
        video.src = streamUrl;
        attached = true;
      }

      function playVideo() {
        attachStream();
        video.controls = true;
        if (cover) {
          cover.classList.add("hidden");
        }
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            if (cover) {
              cover.classList.remove("hidden");
            }
          });
        }
      }

      if (cover) {
        cover.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
    });
  });
}());
