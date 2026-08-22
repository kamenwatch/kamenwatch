# KamenWatch — panduan pasang di Netlify

Website statis (HTML/CSS/JS murni, tanpa build step) + panel admin Decap CMS.
Kamu edit lewat `/admin`, isinya tersimpan di GitHub, Netlify auto-deploy. Nol biaya server.

---

## Isi folder

```
index.html            halaman utama
assets/style.css      seluruh tampilan (warna, font, layout)
assets/app.js         logika: render produk, ganti bahasa, animasi dial
content/settings.json semua teks halaman  ← diedit dari /admin
content/products.json katalog produk       ← diedit dari /admin
admin/index.html      panel admin
admin/config.yml      daftar field yang muncul di panel admin
images/uploads/       foto produk yang kamu upload
netlify.toml          config Netlify
robots.txt sitemap.xml SEO dasar
```

---

## Langkah 1 — Naikkan ke GitHub

1. Buat repo baru di GitHub, namanya `kamenwatch`, set **Public** atau Private (dua-duanya jalan).
2. Upload semua isi folder ini ke root repo (drag-and-drop di halaman repo baru sudah cukup).
3. Pastikan branch utamanya bernama **`main`**. Kalau punyamu `master`, ubah baris `branch: main` di `admin/config.yml`.

## Langkah 2 — Deploy ke Netlify

1. Masuk ke netlify.com → **Add new site** → **Import an existing project** → pilih GitHub → pilih repo `kamenwatch`.
2. Build command: **kosongkan**. Publish directory: **`.`** (titik).
3. Klik **Deploy**. Sekitar 30 detik, situs sudah hidup di alamat `xxx.netlify.app`.

## Langkah 3 — Nyalakan login admin

Ini bagian yang bikin `/admin` bisa dipakai. Urutannya penting:

1. Di dashboard situs → **Site configuration** → **Identity** → **Enable Identity**.
2. Masih di Identity → **Registration preferences** → pilih **Invite only**. (Kalau tidak, orang asing bisa daftar sendiri.)
3. Scroll ke **Services → Git Gateway** → **Enable Git Gateway**. Tanpa ini, panel admin tidak bisa menyimpan.
4. Tab **Identity** paling atas → **Invite users** → masukkan emailmu.
5. Cek email, klik **Accept the invite**, buat password.
6. Buka `namasitus.netlify.app/admin` → login. Selesai.

## Langkah 4 — Pasang domain kamenwatch.com

1. **Domain management** → **Add a domain** → ketik `kamenwatch.com`.
2. Netlify kasih 4 nameserver. Ganti nameserver di tempat kamu beli domain jadi 4 itu.
3. Tunggu 1–24 jam. HTTPS otomatis nyala sendiri.
4. Setelah domain aktif, ganti `site_url` di `admin/config.yml` jadi `https://kamenwatch.com`.

---

## Cara pakai panel admin

Dua menu di sidebar:

**Products** — katalog. Tombol *Add Product* untuk build baru. Field yang perlu diperhatikan:
- *Category* menentukan tab filter di atas grid (Diver / Field / GMT / Dress / Straps / Parts).
- *Availability* → **Sold out** bikin kartunya redup dan tombol pesan hilang.
- *Photo* — upload foto persegi. Kalau dikosongkan, muncul placeholder siluet jam.
- Harga **angka saja**, tanpa `$`. Simbolnya diatur di Site settings.

**Site settings** — semua teks halaman: pesan berjalan di bar emas, hero, strip kepercayaan, kutipan, tujuh langkah perakitan, tips perawatan, FAQ, alamat bengkel, footer.

Yang paling penting diisi duluan: **Chat channels**. Pilih *Main channel* (Telegram untuk pasar Kamboja), lalu isi username/nomornya. Channel utama inilah yang dibuka semua tombol *Order* — untuk WhatsApp, pesannya terisi otomatis dengan nama dan kode produk. Isi juga *Messenger page name* kalau mau jalankan iklan Click-to-Message.

Untuk peta: Google Maps → Share → **Embed a map** → salin **hanya isi `src="..."`**-nya ke field *Google Maps embed URL*.

Setiap kali klik **Publish**, Decap commit ke GitHub, Netlify rebuild, live dalam ~30 detik.

---

## Meta Pixel

Pixel ID diisi sekali saja, langsung di file. Buka `index.html`, cari baris:

```html
<script>window.KW_PIXEL_ID = "000000000000000";</script>
```

Ganti angkanya dengan Pixel ID dari Meta Events Manager. Selama masih nol semua, pixel tidak aktif dan tidak mengirim apa pun.

Event yang otomatis terkirim:

| Event | Kapan |
|---|---|
| `PageView` | tiap halaman dibuka |
| `Contact` | tombol Order di kartu produk diklik — bawa nama produk, kode, dan harga |
| `Contact` | tombol chat di seksi Workshop diklik |
| `Lead` | form newsletter dikirim |

Cek pakai ekstensi Chrome **Meta Pixel Helper** setelah deploy. Kalau `Contact` sudah masuk, kamu bisa bikin Custom Audience untuk retargeting orang yang hampir pesan tapi tidak jadi.

## Yang perlu kamu tahu tentang desainnya

Struktur halaman mengikuti pola Blok Watches: bar pengumuman berjalan → nav sticky → hero → strip kredibilitas → grid produk bertab → kutipan → seksi penjelasan → newsletter → footer. Tapi visual, copy, dan komponennya dibuat baru untuk KamenWatch — hitam matte, aksen emas kuningan, tipografi Saira Condensed + IBM Plex Mono.

Elemen tanda tangannya: **dial jam hidup di hero**. Jarum detiknya melangkah 6 kali per detik — persis irama NH35A di 21.600 vph. Tombol **Lume view** mengubah marker dan jarum jadi menyala hijau-tosca seperti Super-LumiNova BGW9 di ruang gelap.

Tiga bahasa (EN / ID / KM) sudah aktif lewat tombol di nav. Teks antarmuka sudah diterjemahkan; teks jualan punya field terpisah per bahasa di admin.

## Catatan hukum yang sebaiknya jangan dihapus

Di footer ada disclaimer bahwa KamenWatch tidak berafiliasi dengan Seiko Watch Corporation dan produknya dijual sebagai custom build. Untuk bisnis mod, kalimat ini yang memisahkan "custom builder" dari "penjual barang palsu" — biarkan tetap ada.

## Kalau mau ganti warna

Semua di `assets/style.css` baris paling atas:

```css
--ink:#0B0C0E;      /* latar hitam */
--brass:#C6A15B;    /* aksen emas */
--lume:#7CE0D3;     /* warna lume */
--bone:#E8E6E1;     /* teks */
```

Ubah satu nilai, seluruh situs ikut berubah.
