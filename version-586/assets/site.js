(() => {
    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    const normalize = (value) => (value || "").toString().toLowerCase().trim();

    const initNavigation = () => {
        const toggle = document.querySelector("[data-nav-toggle]");
        const menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", () => {
            menu.classList.toggle("open");
        });
    };

    const initHero = () => {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        let activeIndex = 0;
        let timer = null;

        const show = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === activeIndex);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === activeIndex);
            });
        };

        const start = () => {
            stop();
            timer = window.setInterval(() => show(activeIndex + 1), 5200);
        };

        const stop = () => {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        };

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    };

    const initFilters = () => {
        document.querySelectorAll("[data-filter-scope]").forEach((scope) => {
            const input = scope.querySelector("[data-filter-input]");
            const select = scope.querySelector("[data-filter-select]");
            const count = scope.querySelector("[data-filter-count]");
            const list = scope.parentElement.querySelector("[data-filter-list]");
            const cards = list ? Array.from(list.querySelectorAll(".movie-card")) : [];
            if (!input || !cards.length) {
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const q = params.get("q");
            if (q) {
                input.value = q;
            }

            const apply = () => {
                const keyword = normalize(input.value);
                const selected = normalize(select ? select.value : "");
                let visible = 0;

                cards.forEach((card) => {
                    const haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    const keywordMatched = !keyword || haystack.includes(keyword);
                    const selectedMatched = !selected || haystack.includes(selected);
                    const shouldShow = keywordMatched && selectedMatched;
                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = `${visible} 部影片`;
                }
            };

            input.addEventListener("input", apply);
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    };

    const initImages = () => {
        document.querySelectorAll("img").forEach((image) => {
            image.addEventListener("error", () => {
                const frame = image.closest(".poster-frame, .hero-poster, .category-tile");
                if (frame) {
                    frame.classList.add("image-missing");
                }
            }, { once: true });
        });
    };

    const initPlayers = () => {
        document.querySelectorAll(".movie-player").forEach((player) => {
            const video = player.querySelector("video");
            const overlay = player.querySelector(".player-overlay");
            const hlsSource = player.dataset.hls;
            const mp4Source = player.dataset.mp4;
            let initialized = false;
            let hlsInstance = null;

            if (!video || !overlay) {
                return;
            }

            const setupSource = () => {
                if (initialized) {
                    return;
                }
                initialized = true;

                if (hlsSource && video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = hlsSource;
                    return;
                }

                if (hlsSource && window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(hlsSource);
                    hlsInstance.attachMedia(video);
                    return;
                }

                if (mp4Source) {
                    video.src = mp4Source;
                }
            };

            const play = async () => {
                setupSource();
                try {
                    await video.play();
                    player.classList.add("is-playing");
                } catch (error) {
                    player.classList.remove("is-playing");
                    overlay.querySelector("em").textContent = "请再次点击或使用浏览器播放控件";
                }
            };

            overlay.addEventListener("click", play);
            video.addEventListener("play", () => player.classList.add("is-playing"));
            video.addEventListener("pause", () => player.classList.remove("is-playing"));
            video.addEventListener("ended", () => player.classList.remove("is-playing"));
            window.addEventListener("beforeunload", () => {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(() => {
        initNavigation();
        initHero();
        initFilters();
        initImages();
        initPlayers();
    });
})();
