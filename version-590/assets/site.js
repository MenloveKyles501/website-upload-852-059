(() => {
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(() => showSlide(currentSlide + 1), 5200);
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  const searchInput = document.querySelector(".site-filter[data-filter='text']");

  if (query && searchInput) {
    searchInput.value = query;
  }

  const panels = Array.from(document.querySelectorAll(".filter-panel"));

  panels.forEach((panel) => {
    const controls = Array.from(panel.querySelectorAll(".site-filter"));
    const scope = panel.parentElement || document;
    const cards = Array.from(scope.querySelectorAll(".movie-card, .ranking-row"));
    const empty = panel.querySelector(".empty-state");

    function applyFilters() {
      let visibleCount = 0;

      cards.forEach((card) => {
        let visible = true;

        controls.forEach((control) => {
          const key = control.dataset.filter;
          const value = control.value.trim().toLowerCase();

          if (!value) {
            return;
          }

          if (key === "text") {
            const text = (card.dataset.text || "").toLowerCase();
            visible = visible && text.includes(value);
            return;
          }

          const dataValue = (card.dataset[key] || "").toLowerCase();
          visible = visible && dataValue.includes(value);
        });

        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    controls.forEach((control) => {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    });

    applyFilters();
  });
})();
