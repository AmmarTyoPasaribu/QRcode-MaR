# QR Code MaR 🌲

Generator kode QR bertema alam — dibuat dengan **Next.js**, berjalan sepenuhnya di browser. Tidak ada data yang dikirim ke server.

## Fitur

- **9 jenis konten** — Tautan, Teks, WiFi (termasuk jaringan tersembunyi), Email, Telepon, SMS, WhatsApp, Kontak (vCard), dan Lokasi (bisa pakai lokasi saat ini).
- **Pratinjau langsung** — kode berubah saat kamu mengetik, tanpa tombol "Generate".
- **Uji pindai otomatis** — setiap kode di-decode ulang dengan jsQR dan dibandingkan dengan isi aslinya, jadi kamu tahu sebelum mencetak.
- **8 tema alam** — Hutan Pinus, Klasik, Lumut, Gunung Fajar, Danau, Senja, Tanah Liat, Kunang-kunang.
- **6 bentuk titik** (Kotak, Membulat, Titik, Cair, Daun, Berlian) dan **bentuk mata QR** terpisah untuk bingkai dan bola mata.
- **Warna** — gradien linear/radial, warna mata khusus, latar transparan, sudut latar membulat, peringatan kontras.
- **Logo** — unggah gambar (diperkecil otomatis, rasio aspek terjaga) atau pilih ikon bawaan yang warnanya mengikuti QR. Modul di belakang logo dibersihkan dan level koreksi otomatis naik ke H.
- **Bingkai berlabel** — Pita, Bingkai, atau Lencana dengan teks ajakan.
- **Ekspor** — PNG, SVG, JPEG, WebP (512–4096 px), salin ke clipboard, bagikan (Web Share), `Ctrl/⌘ + S` untuk unduh. PNG dan SVG dibuat dari geometri yang sama, jadi hasilnya identik.
- **Riwayat** — 12 kode terakhir tersimpan lengkap dengan desainnya; klik untuk memulihkan.
- **Mode siang & malam** — pemandangan gunung, hutan pinus, kabut, awan dan burung di siang hari; bulan, bintang, dan kunang-kunang di malam hari, dengan efek parallax.
- **Aksesibel** — navigasi keyboard, label ARIA, dan menghormati `prefers-reduced-motion`.

## Menjalankan

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # build produksi
npm run lint
npm run typecheck
```

Butuh Node.js 20.9 atau lebih baru.

## Deploy ke Vercel

Vercel mendeteksi Next.js otomatis — tidak perlu `vercel.json`. Setel variabel lingkungan `NEXT_PUBLIC_SITE_URL` ke domain produksi (mis. `https://qrcode-mar.vercel.app`) agar gambar pratinjau media sosial memakai URL absolut.

## Struktur

```
src/
  app/                 layout, halaman, ikon, manifest, gambar OG
  components/
    scene/             latar alam (SVG prosedural + parallax)
    layout/            header, footer
    generator/         studio QR: panel konten/gaya/logo/bingkai, pratinjau, riwayat
    ui/                kontrol form, ikon, toast
  lib/qr/
    payload.ts         membangun string untuk tiap jenis konten (+ escaping)
    encode.ts          matriks QR (UTF-8)
    scene.ts           geometri gambar: titik, mata, logo, bingkai
    render.ts          scene → SVG dan scene → canvas
    verify.ts          uji pindai dengan jsQR
```
