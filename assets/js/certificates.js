(function () {
  const triggers = Array.from(document.querySelectorAll('[data-certificate-full-src]'));
  if (!triggers.length) return;

  const dialog = document.querySelector('[data-certificates-dialog]');

  if (!dialog || typeof dialog.showModal !== 'function') {
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        window.open(trigger.dataset.certificateFullSrc, '_blank', 'noopener');
      });
    });
    return;
  }

  const titleEl = dialog.querySelector('[data-certificate-title-display]');
  const metaEl = dialog.querySelector('[data-certificate-meta-display]');
  const imageEl = dialog.querySelector('[data-certificate-image]');
  const closeButton = dialog.querySelector('[data-certificates-close]');

  let lastTrigger = null;
  let lastSize = { width: 1200, height: 1700 };

  function applyDialogSize(width, height) {
    const ratio = width / height;
    const availableWidth = Math.max(320, window.innerWidth - (window.innerWidth <= 640 ? 20 : 52));
    const availableHeight = Math.max(360, window.innerHeight - (window.innerWidth <= 640 ? 188 : 210));
    const imageWidth = Math.max(320, Math.min(availableWidth, availableHeight * ratio));
    const chromeWidth = window.innerWidth <= 640 ? 28 : 42;
    const maxDialogWidth = ratio < 0.82 ? 760 : 920;
    const dialogWidth = Math.min(availableWidth, maxDialogWidth, imageWidth + chromeWidth);

    dialog.style.setProperty('--cert-dialog-width', `${dialogWidth}px`);
  }

  function openDialog(trigger) {
    lastTrigger = trigger;

    titleEl.textContent = trigger.dataset.certificateTitle || 'Certyfikat';
    metaEl.textContent = trigger.dataset.certificateMeta || '';
    imageEl.alt = trigger.querySelector('img') ? trigger.querySelector('img').alt : '';
    imageEl.width = Number(trigger.dataset.certificateFullWidth || 1200);
    imageEl.height = Number(trigger.dataset.certificateFullHeight || 1700);
    lastSize = { width: imageEl.width, height: imageEl.height };
    applyDialogSize(lastSize.width, lastSize.height);
    imageEl.src = trigger.dataset.certificateFullSrc || '';

    dialog.showModal();
  }

  function closeDialog() {
    dialog.close();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openDialog(trigger));
  });

  closeButton.addEventListener('click', closeDialog);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  dialog.addEventListener('close', () => {
    imageEl.removeAttribute('src');
    imageEl.alt = '';
    dialog.style.removeProperty('--cert-dialog-width');

    if (lastTrigger) {
      lastTrigger.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (!dialog.open) return;
    applyDialogSize(lastSize.width, lastSize.height);
  });
})();
