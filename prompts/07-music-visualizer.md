# Music Visualizer

## Prompt untuk Antigravity Claude

```
Saya mau buat Music Visualizer — tool yang menampilkan visualisasi audio real-time yang indah saat memutar musik. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:
1. **Audio Input** — Multiple source:
   - Upload file MP3/WAV/OGG/FLAC
   - Microphone input (real-time dari mic)
   - Demo track (include sample audio atau generate tone)
2. **Visualization Modes** — Minimal 6 mode visualisasi:
   - 🎵 **Bars** — Classic frequency bars (vertical bars yang bounce)
   - 🌊 **Wave** — Waveform oscilloscope
   - 🔵 **Circular** — Bars arranged in a circle
   - ⭕ **Orbital** — Particles orbiting center, reacting to bass
   - 🌌 **Galaxy** — Starfield yang bergerak sesuai beat
   - 🔥 **Flame** — Particle flame yang intensitasnya ikut musik
3. **Audio Controls** — Play, Pause, Volume, Seek bar, Time display
4. **Customization** — Per visualization mode:
   - Color scheme (neon, rainbow, monochrome, custom gradient)
   - Sensitivity/gain
   - Smoothing
   - Number of bars/particles
   - Background color/transparency
5. **Fullscreen Mode** — Fullscreen visualizer, perfect untuk presentasi atau party
6. **Beat Detection** — Detect bass beats untuk trigger flash/pulse effects
7. **Now Playing** — Show song title, artist (from file metadata jika ada)
8. **Screenshot/Record** — Capture screenshot atau record sebagai video (MediaRecorder API)

### Design:
- Fullscreen-first design, controls auto-hide
- Dark background by default
- Neon glow effects pada visualisasi
- Smooth fade-in/fade-out saat switch mode
- Minimal floating controls (semi-transparent)
- Mode switcher di bottom (thumbnail previews)

### Technical:
- Web Audio API — AudioContext, AnalyserNode, getByteFrequencyData()
- Canvas API untuk semua rendering
- requestAnimationFrame untuk 60fps animation
- MediaRecorder API untuk recording
- File metadata parsing (ID3 tags jika bisa)
- Responsive (fullscreen on any device)
- Performance optimized — smooth 60fps even with complex visualizations

### Audio Analysis:
- FFT size: 2048 (configurable)
- Frequency bands: bass (20-250Hz), mid (250-4000Hz), treble (4000-16000Hz)
- Beat detection pada bass band
- Smoothing untuk transisi halus

### Deployment:
- Buat vercel.json untuk hosting di Vercel
- Include sample audio file atau generate synthetic audio untuk demo

Buat semua file yang diperlukan. Visualisasinya harus WOW dan mesmerizing — ini project yang harus membuat orang terkagum saat melihatnya.
```
