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
    let lastFocused = null;

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

    const setInert = (nextInert) => {
      if ('inert' in panel) panel.inert = nextInert;
      panel.setAttribute('aria-hidden', String(nextInert));
    };

    const setState = (nextOpen) => {
      btn.setAttribute('aria-expanded', String(nextOpen));
      btn.setAttribute('aria-label', nextOpen ? 'Zamknij menu' : 'Otwórz menu');
      btn.classList.toggle('is-open', nextOpen);
      document.body.classList.toggle('menu-open', nextOpen);
      setInert(!nextOpen);
    };

    const finishClose = () => {
      if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      panel.removeEventListener('transitionend', finishClose);
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    };

    const focusFirstLink = () => {
      const [firstLink] = getFocusable();
      if (firstLink) firstLink.focus({ preventScroll: true });
    };

    const open = ({ moveFocus = false } = {}) => {
      lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      panel.removeEventListener('transitionend', finishClose);
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }

      panel.hidden = false;
      setState(true);

      if (prefersReduced) {
        panel.classList.add('is-open');
        if (moveFocus) focusFirstLink();
        return;
      }

      window.requestAnimationFrame(() => {
        panel.classList.add('is-open');
      });

      if (moveFocus) {
        window.setTimeout(() => {
          focusFirstLink();
        }, 40);
      }
    };

    const close = (immediate = false, returnFocus = false) => {
      panel.removeEventListener('transitionend', finishClose);
      setState(false);
      panel.classList.remove('is-open');

      if (immediate || prefersReduced) {
        panel.hidden = true;
        if (closeTimer) {
          window.clearTimeout(closeTimer);
          closeTimer = null;
        }
        if (returnFocus && lastFocused instanceof HTMLElement) {
          lastFocused.focus({ preventScroll: true });
        }
        return;
      }

      panel.addEventListener('transitionend', finishClose, { once: true });
      closeTimer = window.setTimeout(finishClose, 320);
      if (returnFocus && lastFocused instanceof HTMLElement) {
        window.setTimeout(() => lastFocused && lastFocused.focus({ preventScroll: true }), 20);
      }
    };

    const toggle = ({ moveFocus = false } = {}) => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        close(false, true);
        return;
      }
      open({ moveFocus });
    };

    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Menu mobilne');

    btn.addEventListener('click', () => {
      toggle({ moveFocus: btn.matches(':focus-visible') });
    });
    panel.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => close(true));
    });
    document.addEventListener('keydown', (e) => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close(false, true);
        return;
      }

      if (e.key !== 'Tab' || !isOpen) return;

      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    document.addEventListener('click', (e) => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;
      if (!(e.target instanceof Node)) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) close(true);
    });

    // Start closed
    setInert(true);
    close(true);
  }

  // Header "scrolled" state (glass + shadow)
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Scroll reveal (premium)
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
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
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
