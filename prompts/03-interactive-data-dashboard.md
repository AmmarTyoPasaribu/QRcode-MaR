# Interactive Data Dashboard

## Prompt untuk Antigravity Claude

```
Saya mau buat Interactive Data Dashboard — tool untuk upload file CSV/JSON lalu otomatis generate visualisasi data yang interaktif. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:
1. **File Upload** — Drag & drop upload CSV atau JSON file
2. **Auto-detect Columns** — Otomatis detect tipe data (number, text, date) dari setiap kolom
3. **Data Table** — Tabel interaktif dengan:
   - Sort per kolom (ascending/descending)
   - Filter/search
   - Pagination
   - Editable cells
4. **Chart Generator** — Auto-generate chart yang sesuai:
   - Bar Chart (untuk kategori vs angka)
   - Line Chart (untuk time series)
   - Pie/Donut Chart (untuk proporsi)
   - Scatter Plot (untuk korelasi 2 variabel)
   - Area Chart
5. **Chart Customization** — Untuk setiap chart:
   - Pilih kolom X dan Y axis
   - Ganti warna, title, legend
   - Resize chart (drag corner)
   - Fullscreen mode
6. **Dashboard Layout** — Grid layout yang bisa:
   - Drag & drop untuk reorder charts
   - Resize panels
   - Add/remove charts
7. **Statistics Summary** — Auto-generate:
   - Total rows, columns
   - Min, Max, Average, Median per kolom numerik
   - Missing values count
8. **Export** — Export dashboard sebagai PNG screenshot atau PDF

### Design:
- Dark mode dashboard theme (seperti Grafana/Datadog style)
- Sidebar kiri untuk data controls
- Main area untuk charts grid
- Smooth animations saat add/remove chart
- Color palette yang harmonis untuk charts
- Space/dark background

### Technical:
- Chart.js via CDN untuk rendering charts (https://cdn.jsdelivr.net/npm/chart.js)
- Papa Parse via CDN untuk CSV parsing (https://cdn.jsdelivr.net/npm/papaparse@5/papaparse.min.js)
- CSS Grid untuk dashboard layout
- Drag & drop API untuk reorder
- localStorage untuk save dashboard state
- Responsive

### Sample Data:
- Include contoh CSV data (sales data) yang langsung bisa dicoba saat pertama buka

### Deployment:
- Buat vercel.json untuk hosting di Vercel

Buat semua file yang diperlukan. Design harus premium dan professional seperti dashboard analytics sungguhan.
```
