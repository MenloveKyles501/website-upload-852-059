(function () {
  function createPlayer(root) {
    var video = root.querySelector('video[data-src]');
    var playCover = root.querySelector('[data-player-play]');
    var toggleButton = root.querySelector('[data-player-toggle]');
    var muteButton = root.querySelector('[data-player-mute]');
    var fullscreenButton = root.querySelector('[data-player-fullscreen]');
    var loading = root.querySelector('[data-player-loading]');
    var errorBox = root.querySelector('[data-player-error]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var ready = false;

    function showLoading(show) {
      if (loading) {
        loading.classList.toggle('show', show);
      }
    }

    function showError(message) {
      if (errorBox) {
        errorBox.textContent = message || '';
        errorBox.classList.toggle('show', Boolean(message));
      }
    }

    function prepare() {
      if (!video || ready || !source) {
        return;
      }

      ready = true;
      showLoading(true);
      showError('');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          showLoading(false);
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          showLoading(false);
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showError('网络加载异常');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showError('播放解码异常');
            hls.recoverMediaError();
          } else {
            showError('视频暂时无法播放');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          showLoading(false);
        });
      } else {
        showLoading(false);
        showError('当前浏览器不支持播放');
      }
    }

    function playOrPause() {
      if (!video) {
        return;
      }
      prepare();
      if (video.paused) {
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            showError('请再次点击播放');
          });
        }
      } else {
        video.pause();
      }
    }

    if (playCover) {
      playCover.addEventListener('click', playOrPause);
    }

    if (toggleButton) {
      toggleButton.addEventListener('click', playOrPause);
    }

    if (video) {
      video.addEventListener('click', playOrPause);
      video.addEventListener('play', function () {
        root.classList.add('playing');
        if (toggleButton) {
          toggleButton.textContent = '暂停';
        }
      });
      video.addEventListener('pause', function () {
        root.classList.remove('playing');
        if (toggleButton) {
          toggleButton.textContent = '播放';
        }
      });
      video.addEventListener('loadeddata', function () {
        showLoading(false);
      });
    }

    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton && video) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(createPlayer);
})();
