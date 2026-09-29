# Suarik — Static Website

**Tagline:** Dengarkan dirimu, temukan langkahmu.

Suarik adalah platform refleksi dan perencanaan aksi mikro berbasis web untuk mahasiswa tingkat akhir. Versi ini adalah **static website** murni — HTML, CSS, dan JavaScript tanpa backend. Data disimpan lokal di browser (`localStorage`).

> Suarik bukan aplikasi diagnosis kesehatan mental, bukan pengganti psikolog, dan bukan layanan darurat.

## Teknologi

- HTML, CSS murni, JavaScript murni
- **Chart.js** via CDN untuk visualisasi
- **Plus Jakarta Sans** via Google Fonts CDN
- Penyimpanan data: **localStorage** browser (tidak ada server)

## Struktur

```
suarik-static/
├── index.html
├── checkin.html
├── result.html
├── dashboard.html
├── planner.html
├── journal.html
├── resources.html
├── help.html
├── about.html
├── 404.html
├── README.md
├── css/style.css
└── js/
    ├── data.js         # Helpers localStorage + logika rule-based
    ├── main.js         # Nav, toast, modal
    ├── checkin.js
    ├── result.js
    ├── dashboard.js
    ├── planner.js
    ├── journal.js
    └── resources.js
```

## Cara menjalankan lokal

Cukup buka `index.html` di browser. Karena semua static, tidak perlu server.

Kalau ingin uji dengan URL bersih (misal untuk memastikan path relatif):

```bash
# Python 3
python -m http.server 8000
# lalu buka http://localhost:8000
```

## Deploy online (gratis)

### Vercel (paling cepat)

1. Push folder ini ke GitHub.
2. Buka <https://vercel.com/new>, import repo, klik **Deploy**.
3. Selesai — dapat link `https://suarik-xxxxx.vercel.app`.

### Netlify

1. Buka <https://app.netlify.com/drop>.
2. Drag folder `suarik-static/` ke halaman itu.
3. Selesai.

### GitHub Pages

1. Push ke repo GitHub bernama `suarik`.
2. Settings → Pages → Source: `main` branch, folder `/` (root) → Save.
3. Link muncul di `https://USERNAME.github.io/suarik/`.

## Fitur interaktif (memenuhi syarat lomba)

1. **Multi-step Check-in Form** dengan validasi per langkah.
2. **Dashboard visualisasi data** (bar chart + line chart Chart.js).
3. **CRUD Planner** — tambah, edit, hapus, toggle status, filter.
4. **CRUD Jurnal** dengan insight rule-based.
5. **Search & Filter** untuk halaman Bekal.
6. **Recommendation System** rule-based berdasarkan hasil check-in.
7. **Breathing Timer** interaktif 4–4–6.

## Privasi

Semua data (check-in, langkah, cerita) hanya tersimpan di `localStorage` browser perangkatmu. Tidak ada request ke server, tidak ada tracking. Bersihkan data dengan menghapus site data browser.
