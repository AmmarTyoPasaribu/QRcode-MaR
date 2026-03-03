# Particle System Designer

## Prompt untuk Antigravity Claude

```
Saya mau buat Particle System Designer — sebuah visual tool untuk mendesain particle effects (fire, rain, snow, smoke, explosion, magic, dll) secara interaktif di browser. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:
1. **Canvas Preview** — Area preview besar yang menampilkan particle effect real-time
2. **Parameter Controls** — Panel settings untuk mengatur semua parameter particle:
   - Emission rate (particles/second)
   - Lifetime (min/max seconds)
   - Speed (min/max)
   - Direction & spread angle
   - Size (start/end, with interpolation)
   - Color (start/end, with gradient)
   - Opacity (start/end fade)
   - Gravity (X, Y)
   - Turbulence/randomness
   - Shape (point, circle, line, rectangle emitter)
   - Blend mode (additive, normal)
3. **Presets** — Preset templates: Fire 🔥, Rain 🌧️, Snow ❄️, Smoke 💨, Sparkle ✨, Explosion 💥, Confetti 🎉, Fireflies, Galaxy
4. **Export** — Export sebagai:
   - JSON config (untuk dipakai di game/app lain)
   - GIF/WebM recording
   - Copy kode JavaScript yang bisa langsung dipakai
5. **Play/Pause/Reset** — Control playback
6. **Background Color** — Ganti background preview (dark/light/custom)

### Design:
- Dark mode premium theme
- Split layout: controls kiri, preview kanan (besar)
- Glassmorphism panels
- Smooth sliders dan color pickers
- Real-time update saat parameter berubah
- Space background animation (bintang-bintang halus)

### Technical:
- Canvas API untuk rendering particles
- requestAnimationFrame untuk animasi smooth
- Object pooling untuk performance (recycle particle objects)
- localStorage untuk save custom presets
- Responsive layout

### Deployment:
- Buat vercel.json untuk hosting di Vercel
- Static site, semua client-side

Buat semua file yang diperlukan. Pastikan particle system-nya performant (bisa handle 5000+ particles), dan designnya premium.
```
