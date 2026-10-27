(function () {
  'use strict';
  var frame = document.getElementById('vslframe');
  var cover = document.getElementById('vclick');
  if (!frame || !cover) return;
  var shell = frame.closest('.video-shell');
  var status = document.getElementById('vsl-status');
  var busy = false;
  var player = null;

  function revealPlayer() {
    cover.hidden = true;
    if (shell) shell.classList.add('is-playing');
    frame.focus();
  }

  function nativeFallback() {
    // A fresh native player still starts at zero; controls remain available.
    var url = new URL(frame.src);
    url.searchParams.set('autoplay', '1');
    url.searchParams.set('muted', '0');
    url.hash = 't=0s';
    frame.src = url.href;
    revealPlayer();
    if (status) {
      status.textContent = 'אם הסרטון לא מתחיל, לחצי על כפתור ההפעלה בנגן.';
      status.hidden = false;
    }
  }

  function bounded(promise) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () { reject(new Error('Player timeout')); }, 10000);
      Promise.resolve(promise).then(function (value) {
        clearTimeout(timer);
        resolve(value);
      }, function (error) {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  try {
    if (window.Vimeo && window.Vimeo.Player) player = new Vimeo.Player(frame);
  } catch (error) {
    player = null;
  }

  cover.addEventListener('click', async function () {
    if (busy) return;
    busy = true;
    cover.disabled = true;
    cover.setAttribute('aria-busy', 'true');
    if (status) status.hidden = true;
    try {
      if (!player) {
        nativeFallback();
        return;
      }
      await bounded(player.ready());
      await bounded(player.pause());
      await bounded(player.setCurrentTime(0));
      await bounded(player.setVolume(1));
      await bounded(player.setMuted(false));
      await bounded(player.play());
      revealPlayer();
    } catch (error) {
      nativeFallback();
    } finally {
      busy = false;
      cover.disabled = false;
      cover.removeAttribute('aria-busy');
    }
  });
})();
