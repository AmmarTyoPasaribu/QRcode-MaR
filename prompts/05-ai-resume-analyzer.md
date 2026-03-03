# AI Resume Analyzer

## Prompt untuk Antigravity Claude

```
Saya mau buat AI Resume Analyzer — tool untuk menganalisis CV/resume dan memberikan skor serta saran perbaikan. Pakai native HTML/CSS/JS dengan integrasi AI API.

## Spesifikasi:

### Core Features:
1. **Upload Resume** — Upload PDF atau paste teks resume
   - Pakai PDF.js (https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/pdf.min.mjs) untuk extract teks dari PDF
2. **AI Analysis** — Kirim teks resume ke AI API untuk analisis:
   - Gunakan OpenRouter API (free models) atau user bisa input API key sendiri
   - Endpoint: https://openrouter.ai/api/v1/chat/completions
   - User input API key mereka sendiri (simpan di localStorage)
3. **Scoring System** — AI memberikan skor 0-100 untuk setiap section:
   - 📝 Overall Score
   - 👤 Contact Information (lengkap/tidak)
   - 💼 Work Experience (deskripsi, quantified achievements)
   - 🎓 Education
   - 🛠️ Skills (relevant, well-organized)
   - 📄 Format & Structure (readability, length)
   - 🔑 Keywords (ATS-friendly keywords)
4. **Detailed Feedback** — Untuk setiap section:
   - ✅ Strengths (apa yang sudah bagus)
   - ⚠️ Improvements (apa yang perlu diperbaiki)
   - 💡 Suggestions (contoh perbaikan spesifik)
5. **ATS Compatibility Check** — Cek apakah resume ATS-friendly:
   - Keyword matching dengan job description (optional input)
   - Format compatibility
   - Common ATS issues
6. **Comparison Mode** — Upload job description → AI match resume dengan job requirements, kasih compatibility score
7. **History** — Simpan history analisis di localStorage

### Design:
- Dark mode premium
- Dashboard-style result page
- Circular progress indicators untuk scores
- Color-coded feedback (green/yellow/red)
- Animated score reveal
- Clean typography untuk mudah dibaca
- Space background

### Technical:
- PDF.js untuk PDF parsing
- Fetch API untuk call OpenRouter
- Streaming response untuk real-time text display
- localStorage untuk API key & history
- CSS animations untuk score reveal
- Responsive

### UX Flow:
1. User input API key (one-time setup, saved in localStorage)
2. Upload PDF atau paste resume text
3. Optional: paste job description untuk matching
4. Click "Analyze" → loading with streaming text
5. Show dashboard dengan scores & feedback
6. User bisa download report sebagai PDF

### Deployment:
- Buat vercel.json untuk hosting di Vercel
- Semua client-side, API key disimpan di browser user

Buat semua file yang diperlukan. Design harus professional dan premium.
```
