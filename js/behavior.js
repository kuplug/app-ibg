/* ============================================================
   behavior.js — all interactive behavior, wired up once the
   DOM has been built by render.js (listens for 'book:rendered')
   ============================================================ */

document.addEventListener('book:rendered', (e) => {
  const data = e.detail;

  initIndexToggle();
  initChapterReveal();
  initDownloadModal(data.modal.pdf);
});

/* ---------- side index toggle ---------- */
function initIndexToggle() {
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('indexPanel');
  const backdrop = document.getElementById('indexBackdrop');

  function closeIndex() {
    panel.classList.remove('open');
    backdrop.classList.remove('open');
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    backdrop.classList.toggle('open');
  });
  backdrop.addEventListener('click', closeIndex);
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeIndex));
}

/* ---------- chapter reveal on scroll ---------- */
function initChapterReveal() {
  const chapters = document.querySelectorAll('.chapter');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    chapters.forEach(c => io.observe(c));
  } else {
    chapters.forEach(c => c.classList.add('in-view'));
  }
}

/* ---------- download / QRIS confirmation modal ---------- */
function initDownloadModal(pdf) {
  const PDF_URL = pdf.url;
  const PDF_FILENAME = pdf.filename;

  const modalBackdrop = document.getElementById('qrisModalBackdrop');
  const openBtn = document.getElementById('openQrisModal');
  const closeBtn = document.getElementById('closeQrisModal');
  const formState = document.getElementById('modalFormState');
  const successState = document.getElementById('modalSuccessState');
  const confirmForm = document.getElementById('confirmForm');
  const confirmError = document.getElementById('confirmError');
  const manualDownloadLink = document.getElementById('manualDownloadLink');

  if (manualDownloadLink) {
    manualDownloadLink.setAttribute('href', PDF_URL);
    manualDownloadLink.setAttribute('download', PDF_FILENAME);
  }

  function openModal() {
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    formState.style.display = '';
    successState.classList.remove('show');
    confirmForm.reset();
    confirmError.classList.remove('show');
  }

  function triggerPdfDownload() {
    const a = document.createElement('a');
    a.href = PDF_URL;
    a.download = PDF_FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
  });

  confirmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const contact = document.getElementById('cfContact').value.trim();
    const paid = document.getElementById('cfPaid').checked;

    if (!name || !contact || !paid) {
      confirmError.classList.add('show');
      return;
    }
    confirmError.classList.remove('show');

    formState.style.display = 'none';
    successState.classList.add('show');
    triggerPdfDownload();

    setTimeout(closeModal, 3200);
  });
}
