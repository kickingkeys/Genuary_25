// Site embed helper: opened with ?autostart, the sketch begins the way a first click would.
(function () {
  if (!/[?&]autostart\b/.test(location.search)) return;
  var tries = 0, t = setInterval(function () {
    if (++tries > 200) return clearInterval(t);
    if (typeof frameCount === 'number' && frameCount > 2 && typeof mousePressed === 'function') {
      clearInterval(t);
      try { mousePressed(); } catch (e) {}
    }
  }, 100);
})();
