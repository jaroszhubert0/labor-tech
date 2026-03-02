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
    let closeTimer = null;

    const setState = (nextOpen) => {
      btn.setAttribute('aria-expanded', String(nextOpen));
      btn.setAttribute('aria-label', nextOpen ? 'Zamknij menu' : 'Otwórz menu');
      btn.classList.toggle('is-open', nextOpen);
    };

    const finishClose = () => {
      if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      panel.removeEventListener('transitionend', finishClose);
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const open = () => {
      panel.removeEventListener('transitionend', finishClose);
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      panel.hidden = false;
      setState(true);

      if (prefersReduced) {
        panel.classList.add('is-open');
        return;
      }

      window.requestAnimationFrame(() => {
        panel.classList.add('is-open');
      });
    };

    const close = (immediate = false) => {
      panel.removeEventListener('transitionend', finishClose);
      setState(false);
      panel.classList.remove('is-open');

      if (immediate || prefersReduced) {
        panel.hidden = true;
        if (closeTimer) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }
        return;
      }

      panel.addEventListener('transitionend', finishClose, { once: true });
      closeTimer = window.setTimeout(finishClose, 320);
    };

    const toggle = () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        close();
        return;
      }
      open();
    };

    btn.addEventListener('click', toggle);
    panel.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => close());
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) close(true);
    });

    // Start closed
    close(true);
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

  // Optional file input feedback (contact forms)
  const fileInput = document.querySelector('[data-file-input]');
  const feedback = document.querySelector('[data-file-feedback]');
  if (fileInput && feedback) {
    fileInput.addEventListener('change', () => {
      const files = fileInput.files ? Array.from(fileInput.files) : [];
      if (!files.length) {
        feedback.textContent = 'Brak wybranych plików.';
        return;
      }
      feedback.textContent =
        files.length === 1
          ? `Wybrano plik: ${files[0].name}`
          : `Wybrano plików: ${files.length}`;
    });
  }
})();
