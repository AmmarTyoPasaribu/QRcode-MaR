# AI Background Remover

## Prompt untuk Antigravity Claude

```
Saya mau buat AI Background Remover — tool untuk menghapus background foto secara otomatis menggunakan AI, langsung di browser. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:
1. **Upload Image** — Drag & drop atau click upload gambar (JPG, PNG, WebP)
2. **Auto Remove Background** — Gunakan model AI untuk otomatis hapus background:
   - Pakai @imgly/background-removal library (https://cdn.jsdelivr.net/npm/@imgly/background-removal@1/dist/index.js) 
   - ATAU pakai TensorFlow.js dengan BodyPix/MediaPipe Selfie Segmentation model
   - Semua processing di browser (client-side), no server needed
3. **Preview** — Tampilkan before/after dengan slider comparison (drag slider kiri-kanan)
4. **Replace Background** — Setelah remove background, bisa:
   - Solid color background (pilih warna)
   - Gradient background
   - Upload gambar custom sebagai background baru
   - Blur original background
   - Transparent (PNG)
5. **Manual Touch-up** — Brush tool untuk manual refine:
   - Eraser brush (hapus area yang tidak ke-remove)
   - Restore brush (kembalikan area yang terhapus)
   - Adjustable brush size
6. **Download** — Export result sebagai PNG (transparent) atau JPG (dengan background)
7. **Batch Processing** — Upload multiple gambar, process semua sekaligus

### Design:
- Dark mode premium, clean UI
- Before/After slider yang smooth
- Loading animation saat AI processing (progress bar)
- Drag & drop zone yang besar dan jelas
- Toolbar untuk brush tools di atas canvas
- Space background animation

### Technical:
- Canvas API untuk image manipulation
- Web Workers untuk heavy AI processing (agar UI tidak freeze)
- @imgly/background-removal atau TensorFlow.js untuk AI model
- Blob/URL.createObjectURL untuk efficient image handling
- Responsive layout

### UX Flow:
1. User upload gambar
2. Loading spinner "Removing background..." (3-10 detik)
3. Show result dengan before/after slider
4. User bisa ganti background atau touch-up
5. Download

### Deployment:
- Buat vercel.json untuk hosting di Vercel

Buat semua file yang diperlukan. Pastikan loading state-nya smooth dan user-friendly karena AI processing butuh waktu.
```
