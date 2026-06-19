import { H as Hls } from "./hls-vendor-dru42stk.js";

function whenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setStatus(panel, message) {
  var status = panel.querySelector("[data-player-status]");

  if (status) {
    status.textContent = message;
  }
}

function hideLayer(panel) {
  var layer = panel.querySelector("[data-play-layer]");

  if (layer) {
    layer.classList.add("is-hidden");
  }
}

function initVideoPanel(panel) {
  var video = panel.querySelector("video[data-video-src]");
  var button = panel.querySelector("[data-play-button]");
  var source = video ? video.getAttribute("data-video-src") : "";
  var hls = null;

  if (!video || !button || !source) {
    return;
  }

  function playNative() {
    video.src = source;
    video.controls = true;
    return video.play();
  }

  function playWithHls() {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.controls = true;
      video.play().catch(function () {
        setStatus(panel, "浏览器阻止了自动播放，请再次点击播放器播放。");
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(panel, "网络连接中断，正在重新连接播放源。");
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(panel, "播放器正在恢复视频解码。");
        hls.recoverMediaError();
      } else {
        setStatus(panel, "当前浏览器暂时无法播放该视频源。");
        hls.destroy();
      }
    });
  }

  button.addEventListener("click", function () {
    button.disabled = true;
    hideLayer(panel);
    setStatus(panel, "正在连接播放源...");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      playNative()
        .then(function () {
          setStatus(panel, "正在播放");
        })
        .catch(function () {
          button.disabled = false;
          setStatus(panel, "请再次点击播放按钮启动视频。");
        });
      return;
    }

    if (Hls && Hls.isSupported()) {
      playWithHls();
      return;
    }

    button.disabled = false;
    setStatus(panel, "当前浏览器不支持 HLS 播放。");
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}

whenReady(function () {
  var panels = document.querySelectorAll("[data-video-player]");
  Array.prototype.forEach.call(panels, initVideoPanel);
});
