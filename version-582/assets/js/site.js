import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const toggle = $('.mobile-toggle');
  const panel = $('.mobile-panel');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
  });
}

function normalizePrefix(prefix) {
  return prefix && prefix !== '.' ? prefix : '.';
}

function setupSearchForms() {
  $$('[data-search-form="true"]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const prefix = normalizePrefix(form.dataset.prefix || document.documentElement.dataset.base || '.');
      const target = `${prefix}/search.html${query ? `?q=${encodeURIComponent(query)}` : ''}`;
      window.location.href = target;
    });
  });
}

function setupHero() {
  const hero = $('[data-hero="true"]');
  if (!hero) return;
  const slides = $$('[data-hero-slide="true"]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const next = $('[data-hero-next="true"]', hero);
  const prev = $('[data-hero-prev="true"]', hero);
  if (slides.length < 2) return;
  let index = 0;
  let timer;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };

  const start = () => {
    clearInterval(timer);
    timer = setInterval(() => show(index + 1), 5200);
  };

  next && next.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  prev && prev.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot));
      start();
    });
  });

  start();
}

function setupLocalFilters() {
  const list = $('.filter-list');
  if (!list) return;
  const cards = $$('.movie-card', list);
  const input = $('.local-filter-input');
  const year = $('.local-year-filter');
  const reset = $('.local-filter-reset');
  const empty = $('.empty-state');

  const apply = () => {
    const keyword = input ? input.value.trim().toLowerCase() : '';
    const yearValue = year ? year.value : '';
    let visible = 0;
    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ''} ${card.dataset.tags || ''}`.toLowerCase();
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchYear = !yearValue || card.dataset.year === yearValue;
      const ok = matchKeyword && matchYear;
      card.hidden = !ok;
      if (ok) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
  };

  input && input.addEventListener('input', apply);
  year && year.addEventListener('change', apply);
  reset && reset.addEventListener('click', () => {
    if (input) input.value = '';
    if (year) year.value = '';
    apply();
  });
}

function setupPlayers() {
  $$('video[data-m3u8]').forEach((video) => {
    const box = video.closest('.player-box');
    const overlay = box ? $('.play-overlay', box) : null;
    const message = $('.player-message');
    let hls = null;
    let loaded = false;
    let wantsPlay = false;

    const showMessage = (text) => {
      if (!message) return;
      message.textContent = text;
      message.hidden = false;
    };

    const tryPlay = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => showMessage('请再次点击播放按钮开始播放'));
      }
    };

    const bindSource = () => {
      if (loaded) return;
      const source = video.dataset.m3u8;
      if (!source) {
        showMessage('播放源暂不可用');
        return;
      }
      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        loaded = true;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (wantsPlay) tryPlay();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage('网络连接异常，请稍后重试');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage('媒体加载异常，正在尝试恢复');
            hls.recoverMediaError();
          } else {
            showMessage('播放出现异常，请刷新后重试');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
      } else {
        showMessage('当前浏览器不支持 HLS 播放');
      }
    };

    const play = () => {
      wantsPlay = true;
      bindSource();
      tryPlay();
    };

    overlay && overlay.addEventListener('click', play);
    video.addEventListener('play', () => {
      box && box.classList.add('is-playing');
      overlay && overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', () => {
      if (!video.ended) return;
      box && box.classList.remove('is-playing');
      overlay && overlay.classList.remove('is-hidden');
    });
    video.addEventListener('click', () => {
      if (video.paused) play();
    });
    window.addEventListener('beforeunload', () => {
      if (hls) hls.destroy();
    });
  });
}

async function setupSearchPage() {
  const results = $('[data-search-results="true"]');
  if (!results) return;
  const form = $('[data-search-page-form="true"]');
  const input = form ? form.querySelector('input[name="q"]') : null;
  const yearSelect = $('[data-search-year="true"]');
  const categorySelect = $('[data-search-category="true"]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  const { movies } = await import('./search-data.js');
  const years = [...new Set(movies.map((movie) => movie.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  const categories = [...new Set(movies.map((movie) => movie.category).filter(Boolean))];

  if (input) input.value = initialQuery;
  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = `${year}年`;
    yearSelect && yearSelect.appendChild(option);
  });
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect && categorySelect.appendChild(option);
  });

  const createCard = (movie) => {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
    return `<article class="movie-card">
  <a href="./movies/${movie.file}" class="movie-link" aria-label="观看${escapeHtml(movie.title)}">
    <div class="poster-wrap">
      <img src="./${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
      <span class="year-badge">${escapeHtml(movie.year)}</span>
      <span class="play-dot">▶</span>
    </div>
    <div class="movie-info">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.one)}</p>
      <div class="movie-meta">
        <span>${escapeHtml(movie.region)}</span>
        <span>${escapeHtml(movie.type)}</span>
      </div>
      <div class="tag-row">${tags}</div>
    </div>
  </a>
</article>`;
  };

  const render = () => {
    const keyword = input ? input.value.trim().toLowerCase() : '';
    const year = yearSelect ? yearSelect.value : '';
    const category = categorySelect ? categorySelect.value : '';
    const filtered = movies.filter((movie) => {
      const haystack = `${movie.title} ${movie.region} ${movie.type} ${movie.genre} ${movie.tags.join(' ')} ${movie.one}`.toLowerCase();
      return (!keyword || haystack.includes(keyword)) && (!year || movie.year === year) && (!category || movie.category === category);
    }).slice(0, 96);
    results.innerHTML = filtered.length ? filtered.map(createCard).join('') : '<div class="empty-state">未找到匹配影片</div>';
  };

  form && form.addEventListener('submit', (event) => {
    event.preventDefault();
    render();
  });
  input && input.addEventListener('input', render);
  yearSelect && yearSelect.addEventListener('change', render);
  categorySelect && categorySelect.addEventListener('change', render);
  render();
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

setupMobileMenu();
setupSearchForms();
setupHero();
setupLocalFilters();
setupPlayers();
setupSearchPage();
