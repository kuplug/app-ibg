# Struktur Situs (Multi-Buku, JSON-Driven)

```
book/
├── index.html            ← landing page: daftar semua buku
├── book.html               ← template baca 1 buku (dulunya index.html)
├── css/
│   ├── theme.css            ← variabel warna + reset dasar + topbar/footer (dipakai KEDUA halaman)
│   ├── book.css              ← style khusus book.html (hero, bab, resep, modal, dst)
│   └── landing.css           ← style khusus index.html (grid kartu buku)
├── js/
│   ├── render.js              ← render book.html dari JSON + routing slug
│   ├── behavior.js             ← interaksi book.html (toggle index, scroll reveal, modal)
│   └── catalog.js              ← render index.html dari catalog.json
├── data/
│   ├── catalog.json            ← daftar semua buku (WAJIB didaftarkan di sini)
│   ├── book1.json               ← isi lengkap buku 1
│   └── book2.json, book3.json…  ← tambahkan sesuai jumlah buku
├── assets/
│   ├── book1/cover.jpg
│   └── book2/cover.jpg, …
├── _redirects                  ← opsional: pretty URL kalau hosting di Netlify
└── vercel.json                  ← opsional: pretty URL kalau hosting di Vercel
```

## Cara kerja routing

`book.html` membaca slug dari query string:

```
book.html?slug=obat-toxic-dari-ibnul-jauzi-resep-kedua
```

lalu mencocokkannya ke `data/catalog.json` untuk tahu file JSON mana
(`dataPath`) yang harus di-fetch. Kalau slug tidak ada di query string,
otomatis fallback ke buku pertama di katalog. Kalau slug ada tapi tidak
ditemukan di katalog, tampil halaman 404 sederhana dengan tautan balik
ke `index.html`.

## Cara menambah buku baru

1. Siapkan `data/bookN.json` (pakai skema yang sama seperti `book1.json`
   — lihat prompt ekstraksi HTML/PDF yang sudah dibuat sebelumnya untuk
   menghasilkan file ini dari sumber HTML/PDF lain).
2. Taruh gambar sampulnya di `assets/bookN/cover.jpg`.
3. Tambahkan satu entri baru di `data/catalog.json`:

```json
{
  "slug": "judul-buku-baru-yang-seo-friendly",
  "dataPath": "data/bookN.json",
  "title": "Judul Buku Baru",
  "tagline": "Satu kalimat ringkas untuk kartu di landing page & meta description.",
  "cover": "assets/bookN/cover.jpg",
  "tags": ["Tag1", "Tag2"],
  "publishedAt": "2026"
}
```

4. Selesai — landing page (`index.html`) otomatis menampilkan kartu
   baru, dan buku bisa diakses lewat `book.html?slug=judul-buku-baru-yang-seo-friendly`.
   Tidak perlu sentuh HTML/CSS/JS.

### Aturan slug

- Huruf kecil semua, pisahkan kata dengan tanda hubung (`-`).
- Idealnya mengandung kata kunci judul buku (bagus untuk SEO), bukan ID
  angka acak. Contoh baik: `obat-toxic-dari-ibnul-jauzi-resep-kedua`.
  Contoh buruk: `buku-02`, `id-9f3a`.
- Harus unik di seluruh `catalog.json`.

## Pretty URL (opsional)

Secara default URL buku berbentuk `book.html?slug=...` — ini selalu
jalan di hosting statis mana pun tanpa konfigurasi tambahan, dan slug-nya
sendiri sudah SEO-friendly (kata kunci ada di URL).

Kalau kamu deploy ke **Netlify** atau **Vercel** dan mau URL path asli
tanpa `book.html?slug=` (misalnya `/buku/obat-toxic-dari-ibnul-jauzi-resep-kedua`),
file `_redirects` (Netlify) dan `vercel.json` (Vercel) sudah disiapkan —
tinggal deploy, tidak perlu langkah tambahan. Rewrite ini transparan:
alamat di address bar tetap `/buku/<slug>`, tapi di belakang layar tetap
memuat `book.html` dengan slug yang sama.

Kalau hosting kamu tidak mendukung rewrite (mis. GitHub Pages tanpa
konfigurasi tambahan), cukup gunakan format default `book.html?slug=...`
— slug-nya tetap deskriptif dan terbaca mesin pencari maupun manusia.
