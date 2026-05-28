(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.querySelector(options.buttonSelector);
    var status = document.querySelector(options.statusSelector);
    var stream = options.stream;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add("hidden");
      }
    }

    function showButton() {
      if (button) {
        button.classList.remove("hidden");
      }
    }

    function attachStream() {
      if (!video || !stream) {
        setStatus("视频暂时无法播放");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络连接异常，正在重试");
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("视频加载异常，正在恢复");
            hlsInstance.recoverMediaError();
          } else {
            setStatus("视频暂时无法播放");
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        setStatus("视频暂时无法播放");
      }
    }

    function playOrPause() {
      if (!video) {
        return;
      }
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setStatus("点击视频即可继续观看");
          });
        }
      } else {
        video.pause();
      }
    }

    attachStream();

    if (button) {
      button.addEventListener("click", playOrPause);
    }

    if (video) {
      video.addEventListener("play", function () {
        hideButton();
        setStatus("");
      });
      video.addEventListener("pause", showButton);
      video.addEventListener("ended", showButton);
      video.addEventListener("click", function (event) {
        if (event.target === video) {
          playOrPause();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
