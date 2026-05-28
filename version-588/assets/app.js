(function () {
    const navButton = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');

    if (navButton && nav) {
        navButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        const show = function (index) {
            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        const start = function () {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        };

        const restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || '0'));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    const filterBar = document.querySelector('[data-filter-bar]');
    const cardList = document.querySelector('[data-card-list]');

    if (filterBar && cardList) {
        const searchInput = filterBar.querySelector('[data-search-input]');
        const categorySelect = filterBar.querySelector('[data-filter-category]');
        const typeSelect = filterBar.querySelector('[data-filter-type]');
        const yearSelect = filterBar.querySelector('[data-filter-year]');
        const cards = Array.from(cardList.querySelectorAll('.film-card'));
        const params = new URLSearchParams(window.location.search);

        if (searchInput && params.get('q')) {
            searchInput.value = params.get('q') || '';
        }

        if (categorySelect && params.get('category')) {
            categorySelect.value = params.get('category') || '';
        }

        const getValue = function (element) {
            return element ? element.value.trim().toLowerCase() : '';
        };

        const apply = function () {
            const query = getValue(searchInput);
            const category = getValue(categorySelect);
            const type = getValue(typeSelect);
            const year = getValue(yearSelect);

            cards.forEach(function (card) {
                const title = card.getAttribute('data-title') || '';
                const region = (card.getAttribute('data-region') || '').toLowerCase();
                const cardType = (card.getAttribute('data-type') || '').toLowerCase();
                const cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                const tags = card.getAttribute('data-tags') || '';
                const haystack = [title, region, cardType, cardYear, tags].join(' ');
                const matchQuery = !query || haystack.indexOf(query) !== -1;
                const matchCategory = !category || cardCategory === category;
                const matchType = !type || cardType.indexOf(type) !== -1;
                const matchYear = !year || cardYear === year;

                card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchType && matchYear));
            });
        };

        [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        apply();
    }

    const player = document.querySelector('[data-player]');

    if (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const stream = player.getAttribute('data-stream') || '';
        let hlsInstance = null;
        let prepared = false;

        const prepare = function () {
            if (!video || !stream || prepared) {
                return;
            }

            prepared = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        };

        const play = function () {
            if (!video) {
                return;
            }

            prepare();
            player.classList.add('is-playing');

            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    player.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
