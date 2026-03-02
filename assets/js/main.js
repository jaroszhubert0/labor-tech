// Minimal JS: mobile menu + subtle scroll reveals (Apple-like, no heavy libs)
(function () {
  // Allow CSS to progressively enhance animations without hiding content when JS fails.
  document.documentElement.classList.add('js');

  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu (optional on some pages)
  const btn = document.querySelector('[data-menu-btn]');
  const panel = document.querySelector('[data-menu-panel]');
  if (btn && panel) {
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
  }

  // Scroll reveal
  const targets = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!targets.length) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('reveal-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  targets.forEach((el) => io.observe(el));
})();
