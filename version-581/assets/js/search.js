(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var movies = window.MOVIE_SEARCH_INDEX || [];

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
      '<span class="category-pill">' + escapeHtml(movie.category) + '</span>',
      '<span class="year-pill">' + escapeHtml(movie.year) + '</span>',
      '<span class="play-hover">▶</span>',
      '</a>',
      '<div class="movie-info">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="genre-line">' + escapeHtml(movie.genre) + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function runSearch() {
    if (!results || !empty) {
      return;
    }

    if (!query) {
      empty.textContent = '请输入关键词开始搜索';
      empty.classList.add('show');
      results.innerHTML = '';
      return;
    }

    var keyword = query.toLowerCase();
    var matched = movies.filter(function (movie) {
      return movie.search.indexOf(keyword) !== -1;
    }).slice(0, 240);

    results.innerHTML = matched.map(renderCard).join('');

    if (matched.length) {
      empty.classList.remove('show');
    } else {
      empty.textContent = '没有找到匹配内容';
      empty.classList.add('show');
    }
  }

  runSearch();
})();
