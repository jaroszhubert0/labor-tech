// Minimal, classy interactions (mobile menu + scroll reveal + lightbox)
(function () {
  // Mark that JS is active (so CSS can safely enable animations)
  document.documentElement.classList.add('js');

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Mobile menu ---
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
      const t = e.target;
      if (t && t.matches('a')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    close();
  }

  // --- Scroll reveal (Apple-ish) ---
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!prefersReduced && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { root: null, threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // --- Lightbox for gallery ---
  const dialog = document.querySelector('dialog.lightbox');
  const dialogImg = dialog ? dialog.querySelector('[data-lightbox-img]') : null;
  const dialogTitle = dialog ? dialog.querySelector('[data-lightbox-title]') : null;
  const closeBtn = dialog ? dialog.querySelector('[data-lightbox-close]') : null;

  const openLightbox = (src, title) => {
    if (!dialog || !dialogImg) return;
    dialogImg.src = src;
    dialogImg.alt = title || 'Zdjęcie';
    if (dialogTitle) dialogTitle.textContent = title || 'Zdjęcie';
    if (typeof dialog.showModal === 'function') dialog.showModal();
  };

  if (dialog && closeBtn) {
    closeBtn.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
      // click on backdrop closes
      const rect = dialog.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  }

  const cards = Array.from(document.querySelectorAll('[data-lightbox]'));
  cards.forEach((c) => {
    c.addEventListener('click', () => {
      const src = c.getAttribute('data-full');
      const title = c.getAttribute('data-title') || '';
      if (src) openLightbox(src, title);
    });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src = c.getAttribute('data-full');
        const title = c.getAttribute('data-title') || '';
        if (src) openLightbox(src, title);
      }
    });
  });

  // --- Subtle hero parallax (optional) ---
  const heroImg = document.querySelector('[data-hero-parallax]');
  if (!prefersReduced && heroImg) {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        const t = Math.min(18, y * 0.03);
        heroImg.style.transform = `translateY(${t}px) scale(1.02)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
