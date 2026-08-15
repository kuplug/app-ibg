/* ============================================================
   catalog.js — render halaman index.html (daftar buku) dari
   data/catalog.json. Setiap kartu mengarah ke:
   book.html?slug=<slug-seo-friendly>
   ============================================================ */

async function initLanding() {
  const res = await fetch('data/catalog.json');
  const catalog = await res.json();

  document.getElementById('siteBrand').textContent = catalog.siteName;
  document.getElementById('landingTagline').textContent = catalog.siteTagline;

  const grid = document.getElementById('bookGrid');
  const empty = document.getElementById('bookGridEmpty');
  grid.innerHTML = '';

  if (!catalog.books || catalog.books.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  catalog.books.forEach(book => {
    const card = document.createElement('a');
    card.className = 'book-card';
    card.href = `book.html?slug=${encodeURIComponent(book.slug)}`;
    card.innerHTML = `
      <div class="cover-wrap">
        <img src="${book.cover}" alt="Sampul ${book.title}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${book.title}</h3>
        <p>${book.tagline}</p>
        <div class="card-tags">
          ${(book.tags || []).map(t => `<span class="pill">${t}</span>`).join('')}
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', initLanding);
