(function () {
  'use strict';
  var frame = document.getElementById('vslframe');
  var cover = document.getElementById('vclick');
  if (!frame || !cover) return;
  var shell = frame.closest('.video-shell');
  var status = document.getElementById('vsl-status');
  var requested = false;
  var started = false;

  function revealPlayer() {
    cover.hidden = true;
    if (shell) shell.classList.add('is-playing');
    frame.focus();
  }

  function startFromBeginning() {
    // Send in the click itself. Keep the already-loaded player and its buffer.
    [
      {method:'setCurrentTime',value:0},
      {method:'setVolume',value:1},
      {method:'setMuted',value:false},
      {method:'play'}
    ].forEach(function (message) {
      frame.contentWindow.postMessage(JSON.stringify(message), 'https://player.vimeo.com');
    });
  }

  // Retain an early click if the frame finishes loading afterwards.
  window.addEventListener('message', function (event) {
    if (!requested || started || event.source !== frame.contentWindow || event.origin !== 'https://player.vimeo.com') return;
    var data = event.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch (error) { return; } }
    if (!data) return;
    if (data.method === 'play') { started = true; return; }
    if (data.event === 'ready' || data.method === 'ping') startFromBeginning();
  });

  frame.addEventListener('load', function () {
    if (requested && !started) frame.contentWindow.postMessage(JSON.stringify({method:'ping'}), 'https://player.vimeo.com');
  });

  cover.addEventListener('click', function () {
    if (requested) return;
    requested = true;
    if (status) status.hidden = true;
    // The full image is one button; give visual feedback without any timer.
    revealPlayer();
    try {
      startFromBeginning();
    } catch (error) {
      if (status) {
        status.textContent = 'לא הצלחנו להפעיל את הסרטון. נסי דרך כפתור ההפעלה בנגן.';
        status.hidden = false;
      }
    }
  });
})();
