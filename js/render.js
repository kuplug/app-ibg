/* ============================================================
   render.js — builds the entire page from data/book.json
   Pure DOM templating: no framework, no build step.
   ============================================================ */

const svgRxIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`;
const svgCheckIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="#0f1a17" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;

function el(tag, opts = {}) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.id) node.id = opts.id;
  if (opts.html !== undefined) node.innerHTML = opts.html;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  return node;
}

/* ---------- theme: CSS custom properties per buku ---------- */
/* data.theme (opsional, dari book*.json) meng-override variabel CSS
   di theme.css (--bg, --blue, --hero-bg, --hero-before-bg, dst). Key
   JSON camelCase otomatis dipetakan ke nama variabel CSS kebab-case,
   jadi menambah key baru di theme.css TIDAK perlu ubah kode ini —
   cukup tambahkan key yang sama di book*.json.
   Kalau sebuah buku tidak mengisi satu key, nilai default di
   theme.css tetap dipakai (tidak di-reset ke apa pun). */

function camelToKebabVar(key) {
  return '--' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

function applyTheme(theme) {
  const root = document.documentElement.style;
  if (!theme) return;
  Object.entries(theme).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    root.setProperty(camelToKebabVar(key), value);
  });
}

/* ---------- section builders ---------- */

function renderMeta(data, catalogEntry) {
  document.documentElement.lang = data.meta.lang;
  document.title = data.meta.title;

  setMetaTag('description', catalogEntry ? catalogEntry.tagline : data.hero.subtitle);
  setMetaTag('og:title', data.meta.title, 'property');
  setMetaTag('og:description', catalogEntry ? catalogEntry.tagline : data.hero.subtitle, 'property');
  if (catalogEntry && catalogEntry.cover) {
    setMetaTag('og:image', catalogEntry.cover, 'property');
  }
  setCanonical(catalogEntry ? catalogEntry.slug : null);
}

function setMetaTag(name, content, attr = 'name') {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(slug) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  link.setAttribute('href', slug ? `${base}book.html?slug=${slug}` : window.location.href);
}

function renderTopbar(data) {
  const brand = document.querySelector('.topbar .brand');
  brand.innerHTML = `${data.brand.main} <span>${data.brand.accent}</span>`;
  document.getElementById('navToggle').textContent = data.navToggleLabel;
}

function renderIndexPanel(data) {
  const list = document.getElementById('indexList');
  list.innerHTML = '';
  data.chapters.forEach(ch => {
    const li = el('li');
    li.innerHTML = `<a href="#${ch.id}"><span class="num">${ch.num}</span> ${ch.title}</a>`;
    list.appendChild(li);
  });
  document.getElementById('indexLabel').textContent = data.toc.label;
}

function renderHero(data) {
  const h = data.hero;
  const eyebrow = document.getElementById('heroEyebrow');
  eyebrow.innerHTML = h.badges.map(b => `<span class="badge">${b}</span>`).join('');

  document.getElementById('heroTitle').innerHTML = h.titleHtml;
  document.getElementById('heroSub').textContent = h.subtitle;

  const metaRow = document.getElementById('heroMetaRow');
  metaRow.innerHTML = h.pills.map(p => `<span class="pill">${p}</span>`).join('');

  document.querySelector('.pulse-line').setAttribute('d', h.pulsePath);
  document.getElementById('scrollCue').textContent = h.scrollCue;

  const thumbImg = document.getElementById('bookThumbImg');
  thumbImg.src = h.thumb.src;
  thumbImg.alt = h.thumb.alt;
  document.getElementById('bookThumbCap').textContent = h.thumb.caption;
}

function renderIntro(data) {
  document.getElementById('introLabel').textContent = data.intro.label;
  const body = document.getElementById('introBody');
  body.innerHTML = data.intro.paragraphsHtml.map(p => `<p>${p}</p>`).join('');
}

function renderToc(data) {
  document.getElementById('tocLabel').textContent = data.toc.label;
  document.getElementById('tocTitle').textContent = data.toc.title;
  const grid = document.getElementById('tocGrid');
  grid.innerHTML = '';
  data.chapters.forEach(ch => {
    const a = el('a', { class: 'toc-item', attrs: { href: `#${ch.id}` } });
    a.innerHTML = `<span class="toc-num">${ch.num}</span><span class="toc-title">${ch.title}</span><span class="toc-page">${ch.page}</span>`;
    grid.appendChild(a);
  });
}

function renderChapters(data) {
  const mount = document.getElementById('chaptersMount');
  mount.innerHTML = '';
  data.chapters.forEach(ch => {
    const article = el('article', { class: 'chapter', id: ch.id });
    article.innerHTML = `
      <div class="chapter-head">
        <span class="big-num">${ch.num} / ${ch.total}</span>
        <div>
          <h2>${ch.title}</h2>
          <div class="chapter-sub">${ch.sub}</div>
        </div>
      </div>
      <div class="chapter-body">
        ${ch.bodyHtml}
        <div class="resep">
          <div class="resep-head">
            <div class="rx">${svgRxIcon} Obatnya?</div>
            <span class="resep-no">${ch.resep.no}</span>
          </div>
          <div class="resep-body">
            ${ch.resep.bodyHtml}
          </div>
        </div>
      </div>`;
    mount.appendChild(article);
  });
}

function renderClosing(data) {
  document.getElementById('closingLabel').textContent = data.closing.label;
  document.getElementById('closingTitle').textContent = data.closing.title;
  document.getElementById('closingBody').innerHTML =
    data.closing.paragraphsHtml.map(p => `<p>${p}</p>`).join('');
}

function renderAbout(data) {
  document.getElementById('aboutLabel').textContent = data.about.label;
  document.getElementById('aboutTitle').textContent = data.about.title;
  document.getElementById('aboutParagraph').textContent = data.about.paragraph;
  document.getElementById('aboutTags').innerHTML =
    data.about.tags.map(t => `<span class="pill">${t}</span>`).join('');
}

function renderDownloadCta(data) {
  const c = data.downloadCta;
  const section = document.getElementById('downloadCta');
  // buku tanpa jualan PDF (title kosong) -> sembunyikan section CTA + trigger modal
  if (!c || !c.title) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';
  document.getElementById('ctaLabel').textContent = c.label;
  document.getElementById('ctaTitle').textContent = c.title;
  document.getElementById('ctaParagraph').textContent = c.paragraph;
  document.getElementById('ctaButtonText').textContent = c.buttonText;
}

function renderModal(data) {
  const m = data.modal;
  document.getElementById('modalStep1Label').textContent = m.step1Label;
  document.getElementById('modalTitle').textContent = m.title;
  document.getElementById('modalDesc').innerHTML = m.desc;

  const qrisImg = document.getElementById('qrisImg');
  qrisImg.src = m.qris.src;
  document.getElementById('qrisAmount').textContent = m.qris.amount;
  document.getElementById('qrisNote').textContent = m.qris.note;

  document.getElementById('cfNameLabel').textContent = m.form.nameLabel;
  document.getElementById('cfName').placeholder = m.form.namePlaceholder;
  document.getElementById('cfContactLabel').textContent = m.form.contactLabel;
  document.getElementById('cfContact').placeholder = m.form.contactPlaceholder;
  document.getElementById('cfNoteLabel').innerHTML =
    `${m.form.noteLabel} <span style="text-transform:none; letter-spacing:0;">${m.form.noteOptional}</span>`;
  document.getElementById('cfNote').placeholder = m.form.notePlaceholder;
  document.getElementById('cfCheckLabel').textContent = m.form.checkLabel;
  document.getElementById('confirmError').textContent = m.form.errorText;
  document.getElementById('submitBtnText').textContent = m.form.submitText;

  document.querySelector('#modalSuccessState .check').innerHTML = svgCheckIcon;
  document.getElementById('successTitle').textContent = m.success.title;
  document.getElementById('successText').textContent = m.success.text;
  document.getElementById('manualDownloadWrap').innerHTML =
    `${m.success.manualBefore}<a href="#" id="manualDownloadLink" style="color:var(--blue-light); text-decoration:underline;">${m.success.manualLinkText}</a>${m.success.manualAfter}`;
}

function renderFooter(data) {
  document.getElementById('siteFooter').textContent = data.footer;
}

/* ---------- master render ---------- */

function renderAll(data, catalogEntry) {
  renderMeta(data, catalogEntry);
  renderTopbar(data);
  renderIndexPanel(data);
  renderHero(data);
  renderIntro(data);
  renderToc(data);
  renderChapters(data);
  renderClosing(data);
  renderAbout(data);
  renderDownloadCta(data);
  renderModal(data);
  renderFooter(data);
}

/* ---------- routing: resolve ?slug= against data/catalog.json ---------- */

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

function showNotFound(slug) {
  document.body.innerHTML = `
    <section style="min-height:100vh; display:flex; flex-direction:column;
      align-items:center; justify-content:center; text-align:center;
      padding:40px; background:var(--bg); color:var(--ink); gap:14px;">
      <span class="label">404</span>
      <h1 style="font-family:'Fraunces', serif;">Buku tidak ditemukan</h1>
      <p style="color:var(--ink-dim); max-width:420px;">
        ${slug ? `Slug <code>${slug}</code> tidak ada di katalog.` : 'Tidak ada slug buku yang diminta.'}
      </p>
      <a href="index.html" style="color:var(--blue-light); text-decoration:underline;">
        Kembali ke daftar buku
      </a>
    </section>`;
}

async function init() {
  const slug = getSlugFromUrl();

  const catalogRes = await fetch('data/catalog.json');
  const catalog = await catalogRes.json();

  const entry = slug
    ? catalog.books.find(b => b.slug === slug)
    : catalog.books[0]; // fallback: buku pertama kalau tidak ada slug di URL

  if (!entry) {
    showNotFound(slug);
    return;
  }

  const res = await fetch(entry.dataPath);
  if (!res.ok) {
    showNotFound(slug);
    return;
  }
  const data = await res.json();

  applyTheme(data.theme); // set CSS vars sebelum konten dirender -> hindari flash warna default
  renderAll(data, entry);
  window.__bookData = data; // exposed for behavior.js (PDF url/filename etc.)
  document.dispatchEvent(new CustomEvent('book:rendered', { detail: data }));
}

document.addEventListener('DOMContentLoaded', init);
