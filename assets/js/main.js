// Minimal JS only for mobile menu.
(function () {
  const btn = document.querySelector('[data-menu-btn]');
  const panel = document.querySelector('[data-menu-panel]');
  if (!btn || !panel) return;

  const open = () => {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  };
  const toggle = () => (panel.hidden ? open() : close());

  btn.addEventListener('click', toggle);
  panel.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.matches('a')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Start closed
  close();
})();
