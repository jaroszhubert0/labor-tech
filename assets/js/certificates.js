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

  function openDialog(trigger) {
    lastTrigger = trigger;

    titleEl.textContent = trigger.dataset.certificateTitle || 'Certyfikat';
    metaEl.textContent = trigger.dataset.certificateMeta || '';
    imageEl.alt = trigger.querySelector('img') ? trigger.querySelector('img').alt : '';
    imageEl.width = Number(trigger.dataset.certificateFullWidth || 1200);
    imageEl.height = Number(trigger.dataset.certificateFullHeight || 1700);
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

    if (lastTrigger) {
      lastTrigger.focus();
    }
  });
})();
