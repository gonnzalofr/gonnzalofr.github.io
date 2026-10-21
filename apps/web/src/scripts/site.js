/* site.js — (1) --head-h: the sticky head's real height, so anchors and focused elements land below it.
   (2) wide figures are a tab stop only when they actually scroll. */
(function () {
  var head = document.querySelector('.head');
  if (!head || !('ResizeObserver' in window)) return;
  var root = document.documentElement.style;
  new ResizeObserver(function () {
    if (getComputedStyle(head).position === 'sticky') root.setProperty('--head-h', head.offsetHeight + 'px');
    else root.removeProperty('--head-h');
  }).observe(head);
})();

(function () {
  var figs = document.querySelectorAll('.fig__scroll');
  if (!figs.length) return;
  function update() {
    Array.prototype.forEach.call(figs, function (f) { f.tabIndex = f.scrollWidth > f.clientWidth ? 0 : -1; });
  }
  update(); window.addEventListener('resize', update);
})();
