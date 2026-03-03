# 3D Portfolio Website

## Prompt untuk Antigravity Claude

```
Saya mau buat 3D Portfolio Website yang interaktif menggunakan Three.js + native HTML/CSS/JS. Website ini akan menampilkan portfolio saya dalam bentuk dunia 3D yang bisa dijelajahi pengunjung.

## Spesifikasi:

### Core Features:
1. **3D Scene** — Dunia 3D dengan kamera yang bisa bergerak, menggunakan Three.js
2. **Floating Cards** — Project-project ditampilkan sebagai kartu 3D yang melayang di space
3. **Navigation** — Klik card untuk zoom in dan lihat detail project
4. **Sections** — Hero (nama + title), About Me, Projects, Skills, Contact
5. **Smooth Transitions** — Animasi smooth saat berpindah section

### Design:
- Dark space theme dengan particle background (bintang-bintang)
- Glassmorphism cards yang melayang di 3D space
- Neon accent colors (purple #7c5cfc, blue #3b82f6)
- Smooth camera movement dengan easing
- Text menggunakan Google Fonts (Inter)

### Technical:
- Three.js via CDN (https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js)
- OrbitControls atau custom camera controls
- Raycaster untuk click detection pada 3D objects
- Responsive — fallback ke 2D layout di mobile
- Performant — max 60fps, lazy loading textures

### Data Portfolio saya:
- Nama: Ammar Tyo Pasaribu
- Title: Computer Science Student & Web Developer
- Projects: 
  1. QR Code MaR — QR code generator (https://github.com/AmmarTyoPasaribu/QRcode-MaR)
  2. (tambahkan placeholder untuk project lain)
- Skills: HTML, CSS, JavaScript, Python, React, Node.js, Git
- Contact: GitHub (AmmarTyoPasaribu)

### Deployment:
- Buat vercel.json untuk hosting di Vercel
- Static site, semua client-side

Buat file: index.html, style.css, script.js, vercel.json
Pakai native saja tanpa framework. Pastikan designnya premium dan WOW.
```
