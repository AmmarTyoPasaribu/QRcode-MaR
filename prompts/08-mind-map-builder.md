# Mind Map Builder

## Prompt untuk Antigravity Claude

```
Saya mau buat Mind Map Builder — tool interaktif untuk membuat mind map / diagram pikiran di browser. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:
1. **Canvas Workspace** — Area kerja infinite canvas yang bisa di-pan dan zoom:
   - Mouse drag untuk pan
   - Scroll wheel untuk zoom in/out
   - Pinch to zoom (touch devices)
   - Grid background (optional, toggle on/off)
2. **Nodes** — Buat dan edit nodes:
   - Double click canvas untuk tambah node baru
   - Double click node untuk edit text
   - Drag node untuk pindahkan posisi
   - Resize node (drag corner)
   - Node styling: background color, border color, font size, shape (rounded rect, circle, diamond)
   - Node icon/emoji (optional)
3. **Connections** — Hubungkan nodes:
   - Drag dari edge node ke node lain untuk buat connection
   - Connection styles: straight line, curved bezier, right-angle
   - Arrow heads (one-way, two-way, none)
   - Connection labels (text on line)
   - Line color & thickness
4. **Auto Layout** — Algoritma auto-layout:
   - Radial layout (center node, children spread keluar)
   - Tree layout (top-down atau left-right)
   - Force-directed layout (physics-based spacing)
   - One-click reorganize
5. **Toolbar** — Floating toolbar:
   - Add node, Delete selected, Undo, Redo
   - Zoom in/out, Fit to screen
   - Change layout mode
   - Export options
6. **Selection** — Multi-select:
   - Click untuk select single node
   - Shift+click untuk multi-select
   - Drag rectangle untuk area select
   - Delete selected nodes
7. **Templates** — Pre-built templates:
   - Project Planning
   - SWOT Analysis
   - Brainstorming
   - Org Chart
   - Blank canvas
8. **Export/Import**:
   - Export sebagai PNG (high-res)
   - Export sebagai SVG
   - Export sebagai JSON (untuk re-import)
   - Import dari JSON
9. **Save** — Auto-save ke localStorage, multiple saved maps

### Design:
- Clean, minimal workspace
- Dark mode theme
- Floating semi-transparent toolbar
- Smooth animations saat add/remove/move nodes
- Node shadows dan depth effect
- Minimap di corner (overview seluruh mind map)
- Color palette sidebar untuk quick styling

### Technical:
- Canvas API atau SVG untuk rendering (Canvas recommended untuk performance)
- Custom pan & zoom system
- Undo/Redo stack (command pattern)
- Bezier curve rendering untuk connections
- localStorage untuk persistence
- Keyboard shortcuts (Delete, Ctrl+Z, Ctrl+C, Ctrl+V, Ctrl+A)
- Responsive

### Deployment:
- Buat vercel.json untuk hosting di Vercel

Buat semua file yang diperlukan. Mind map harus terasa smooth dan natural saat digunakan, seperti tool professional.
```
