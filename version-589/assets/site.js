(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
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
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initRails() {
    document.querySelectorAll(".rail-section").forEach(function (section) {
      var rail = section.querySelector("[data-rail]");
      var left = section.querySelector("[data-rail-left]");
      var right = section.querySelector("[data-rail-right]");
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          rail.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          rail.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function initPanels() {
    document.querySelectorAll("[data-panel-button]").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-panel-button");
        var group = key.split("-")[0];
        document.querySelectorAll('[data-panel-button^="' + group + '-"]').forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        document.querySelectorAll('[data-panel^="' + group + '-"]').forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-panel") === key);
        });
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initSearch() {
    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      var target = document.querySelector(input.getAttribute("data-search-input"));
      if (!target) {
        return;
      }
      var items = Array.prototype.slice.call(target.querySelectorAll("[data-filter]"));
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        items.forEach(function (item) {
          var text = normalize(item.getAttribute("data-filter"));
          item.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
      });
    });
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".video-cover");
    var stream = shell.getAttribute("data-stream");
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !video || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      if (!video) {
        return;
      }
      var playResult = video.play();
      if (playResult && typeof playResult.then === "function") {
        playResult.then(function () {
          shell.classList.add("is-playing");
        }).catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initRails();
    initPanels();
    initSearch();
    initPlayer();
  });
})();
