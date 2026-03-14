(function () {
  const formConfigs = [
    {
      formId: 'b2bForm',
      iframeId: 'hidden_iframe_b2b',
      statusId: 'b2bStatus',
      okText: 'Dziękujemy. Odezwiemy się najszybciej jak to możliwe.',
      formKey: 'b2b'
    },
    {
      formId: 'pricingForm',
      iframeId: 'hidden_iframe_pricing',
      statusId: 'pricingStatus',
      okText: 'Gotowe!',
      formKey: 'pricing'
    }
  ];

  const forms = formConfigs
    .map((config) => ({
      ...config,
      form: document.getElementById(config.formId),
      iframe: document.getElementById(config.iframeId),
      status: document.getElementById(config.statusId)
    }))
    .filter(({ form, iframe, status }) => form && iframe && status);

  if (!forms.length) return;

  const MIN_FILL_MS = 4000;
  const FALLBACK_OK_DELAY_MS = 1200;
  const RECAPTCHA_SRC =
    'https://www.google.com/recaptcha/api.js?render=explicit&onload=__ltRecaptchaOnLoad';

  let recaptchaPromise = null;

  function setStatus(statusEl, text, isError) {
    statusEl.textContent = text;
    statusEl.dataset.state = isError ? 'error' : 'ok';
  }

  function getRecaptchaValue(form) {
    const input = form.querySelector('textarea[name="g-recaptcha-response"]');
    return input ? input.value.trim() : '';
  }

  function loadRecaptcha() {
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      return Promise.resolve(window.grecaptcha);
    }

    if (recaptchaPromise) return recaptchaPromise;

    recaptchaPromise = new Promise((resolve, reject) => {
      window.__ltRecaptchaOnLoad = function () {
        if (!window.grecaptcha) {
          reject(new Error('Brak obiektu grecaptcha.'));
          return;
        }

        if (typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(() => resolve(window.grecaptcha));
          return;
        }

        resolve(window.grecaptcha);
      };

      const script = document.createElement('script');
      script.src = RECAPTCHA_SRC;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Nie udało się załadować reCAPTCHA.'));
      document.head.appendChild(script);
    });

    return recaptchaPromise;
  }

  function ensureRecaptcha(form) {
    const slot = form.querySelector('.g-recaptcha');
    if (!slot) return Promise.resolve(null);

    if (slot.dataset.widgetId) {
      return Promise.resolve(Number(slot.dataset.widgetId));
    }

    return loadRecaptcha().then((grecaptcha) => {
      if (slot.dataset.widgetId) {
        return Number(slot.dataset.widgetId);
      }

      const widgetId = grecaptcha.render(slot, {
        sitekey: slot.dataset.sitekey
      });

      slot.dataset.widgetId = String(widgetId);
      return widgetId;
    });
  }

  function resetRecaptcha(form) {
    const slot = form.querySelector('.g-recaptcha');
    const widgetId = slot ? slot.dataset.widgetId : null;

    if (
      widgetId &&
      window.grecaptcha &&
      typeof window.grecaptcha.reset === 'function'
    ) {
      window.grecaptcha.reset(Number(widgetId));
    }
  }

  function attachRecaptchaTriggers(form) {
    let primed = false;
    let observer = null;

    const prime = () => {
      if (primed) return;
      primed = true;

      if (observer) {
        observer.disconnect();
        observer = null;
      }

      ensureRecaptcha(form).catch(() => {});
    };

    form.addEventListener('focusin', prime, { once: true });
    form.addEventListener('pointerdown', prime, { once: true });

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              prime();
            }
          });
        },
        { rootMargin: '240px 0px' }
      );

      observer.observe(form);
    }
  }

  function bindIFrameForm({ form, iframe, status, okText, formKey }) {
    const startInput = form.querySelector('input[name="form_start"]');
    const sentInput = form.querySelector('input[name="form_sent"]');
    const timeInput = form.querySelector('input[name="form_time_ms"]');
    const jsInput = form.querySelector('input[name="js_enabled"]');

    if (startInput) startInput.value = String(Date.now());
    if (jsInput) jsInput.value = '1';

    attachRecaptchaTriggers(form);

    let submitted = false;
    let awaitingMessage = false;

    form.addEventListener('submit', (event) => {
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
        event.preventDefault();
        return;
      }

      const now = Date.now();
      const startTs = startInput ? Number(startInput.value || 0) : 0;
      const elapsed = startTs ? now - startTs : 0;

      if (sentInput) sentInput.value = String(now);
      if (timeInput) timeInput.value = String(elapsed);

      if (elapsed > 0 && elapsed < MIN_FILL_MS) {
        event.preventDefault();
        setStatus(status, 'Wyślij po minimum 4 sekundach.', true);
        return;
      }

      if (!getRecaptchaValue(form)) {
        event.preventDefault();
        ensureRecaptcha(form)
          .then(() => {
            setStatus(status, 'Potwierdź, że nie jesteś botem (reCAPTCHA).', true);
          })
          .catch(() => {
            setStatus(
              status,
              'Nie udało się załadować reCAPTCHA. Odśwież stronę i spróbuj ponownie.',
              true
            );
          });
        return;
      }

      submitted = true;
      awaitingMessage = true;
      setStatus(status, 'Wysyłanie…', false);
    });

    iframe.addEventListener('load', () => {
      if (!submitted) return;
      submitted = false;

      if (awaitingMessage) {
        window.setTimeout(() => {
          if (!awaitingMessage) return;

          awaitingMessage = false;
          setStatus(status, okText, false);
          form.reset();
          resetRecaptcha(form);
          if (startInput) startInput.value = String(Date.now());
        }, FALLBACK_OK_DELAY_MS);
      }
    });

    window.addEventListener('message', (event) => {
      const data = event && event.data ? event.data : null;
      if (!data || data.type !== 'LT_FORM_STATUS') return;
      if (data.formId && data.formId !== formKey) return;

      awaitingMessage = false;

      if (data.status === 'ok') {
        setStatus(status, data.message || okText, false);
        form.reset();
        resetRecaptcha(form);
        if (startInput) startInput.value = String(Date.now());
        return;
      }

      setStatus(status, data.message || 'Wystąpił błąd. Spróbuj ponownie.', true);
    });
  }

  forms.forEach(bindIFrameForm);
})();
