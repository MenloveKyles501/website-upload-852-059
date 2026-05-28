document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
  applySearchQuery();
});

function setupMobileNavigation() {
  var button = document.querySelector(".nav-toggle");
  var panel = document.querySelector("[data-mobile-panel]");

  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", function () {
    var open = panel.classList.toggle("open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function setupHeroCarousel() {
  var carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
  var current = 0;
  var timer;

  function show(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    window.clearInterval(timer);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      stop();
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      start();
    });
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);

  if (slides.length > 1) {
    start();
  }
}

function setupFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function (panel) {
    var search = panel.querySelector("[data-filter-search]");
    var type = panel.querySelector("[data-filter-type]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function matchYear(cardYear, range) {
      if (!range) {
        return true;
      }

      var parts = range.split("-").map(Number);
      return cardYear >= parts[0] && cardYear <= parts[1];
    }

    function update() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var selectedType = type ? type.value : "";
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = Number(card.getAttribute("data-year")) || 0;
        var visible = true;

        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }

        if (selectedType && cardType !== selectedType) {
          visible = false;
        }

        if (selectedRegion && cardRegion !== selectedRegion) {
          visible = false;
        }

        if (!matchYear(cardYear, selectedYear)) {
          visible = false;
        }

        card.classList.toggle("filtered-out", !visible);
      });
    }

    [search, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", update);
        control.addEventListener("change", update);
      }
    });

    update();
  });
}

function applySearchQuery() {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");
  var input = document.querySelector("[data-filter-search]");

  if (query && input) {
    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function setupPlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var errorBox = player.querySelector("[data-player-error]");
    var source = player.getAttribute("data-video-url");
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.classList.add("show");
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showError("视频加载失败，请刷新后重试");
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showError("当前设备暂时无法播放该视频");
      }
    }

    function playVideo() {
      attachSource();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (!attached) {
        playVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}
