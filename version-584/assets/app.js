(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeaderSearch() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var target = form.getAttribute("data-target") || "categories/category-all.html";
        var keyword = input ? input.value.trim() : "";
        var url = target;
        if (keyword) {
          url += (target.indexOf("?") === -1 ? "?" : "&") + "q=" + encodeURIComponent(keyword);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase();
  }

  function initCards() {
    var input = document.querySelector("[data-movie-search]");
    var sort = document.querySelector("[data-sort]");
    var grid = document.querySelector("[data-card-grid]");
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
    var noResult = document.querySelector("[data-no-result]");

    if (!grid || !cards.length) {
      return;
    }

    function applyFilter() {
      var keyword = input ? normalize(input.value.trim()) : "";
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (noResult) {
        noResult.style.display = shown ? "none" : "block";
      }
    }

    function applySort() {
      if (!sort) {
        return;
      }
      var mode = sort.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "year") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (mode === "title") {
          return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
      try {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      } catch (error) {
        input.value = input.value;
      }
    }
    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }
    applySort();
    applyFilter();
  }

  function initPlayer() {
    var wrap = document.querySelector("[data-player]");
    if (!wrap) {
      return;
    }
    var video = wrap.querySelector("video");
    var layer = wrap.querySelector(".player-layer");
    var button = wrap.querySelector(".play-start");
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute("data-stream");
    var started = false;
    var attached = false;

    function attach() {
      if (attached || !streamUrl) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (name, data) {
          if (data && data.fatal) {
            video.setAttribute("data-error", "true");
          }
        });
      }
    }

    function begin() {
      attach();
      started = true;
      video.controls = true;
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    attach();
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        begin();
      });
    }
    if (layer) {
      layer.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        begin();
      }
    });
  }

  ready(function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initCards();
    initPlayer();
  });
})();
