(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var next = document.querySelector(".hero-next");
    var prev = document.querySelector(".hero-prev");
    var current = 0;
    var timer = null;

    function setSlide(index) {
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

    function startCarousel() {
      if (slides.length < 2) {
        return;
      }
      stopCarousel();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 6200);
    }

    function stopCarousel() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
        startCarousel();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        setSlide(current + 1);
        startCarousel();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(current - 1);
        startCarousel();
      });
    }

    startCarousel();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
    var activeFilter = "";

    function getSearchText() {
      for (var i = 0; i < searchInputs.length; i += 1) {
        if (searchInputs[i].value.trim()) {
          return searchInputs[i].value.trim().toLowerCase();
        }
      }
      return "";
    }

    function applySearch() {
      var query = getSearchText();
      var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedFilter = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle("search-hidden", !(matchedQuery && matchedFilter));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", applySearch);
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var group = chip.closest(".filter-chips");
        if (group) {
          Array.prototype.slice.call(group.querySelectorAll(".chip-filter")).forEach(function (item) {
            item.classList.remove("active");
          });
        }
        chip.classList.add("active");
        activeFilter = chip.getAttribute("data-filter") || "";
        applySearch();
      });
    });
  });
})();
