# API Playground

## Prompt untuk Antigravity Claude

```
Saya mau buat API Playground — sebuah REST API testing tool di browser, seperti mini Postman. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:
1. **Request Builder** — Form untuk build HTTP request:
   - Method selector: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
   - URL input dengan autocomplete history
   - Headers editor (key-value pairs, add/remove rows)
   - Query params editor (key-value, auto-append ke URL)
   - Body editor:
     - JSON (with syntax highlighting)
     - Form Data (key-value)
     - Raw text
     - Binary file upload
   - Auth section: None, Bearer Token, Basic Auth, API Key
2. **Response Viewer** — Tampilkan response:
   - Status code (color-coded: 2xx green, 4xx yellow, 5xx red)
   - Response time (ms)
   - Response size
   - Headers (collapsible)
   - Body viewer:
     - JSON (pretty-printed with syntax highlighting & collapsible nodes)
     - HTML (rendered preview)
     - Raw text
     - Image preview
   - Copy response button
3. **Collections** — Save & organize requests:
   - Create collections (folders)
   - Save requests with name
   - Drag & drop reorder
   - Export/import collections as JSON
4. **History** — Auto-save last 50 requests
5. **Environment Variables** — Define variables ({{baseUrl}}, {{token}}) yang bisa dipakai di URL, headers, body
6. **Code Generator** — Generate code snippet dari request:
   - JavaScript (fetch)
   - Python (requests)
   - cURL
   - PHP
7. **Keyboard Shortcuts** — Ctrl+Enter to send, Ctrl+S to save

### Design:
- Dark mode IDE-style theme (mirip VS Code/Insomnia)
- Three-panel layout: Sidebar (collections) | Request builder | Response viewer
- Syntax highlighting untuk JSON (custom tokenizer atau pakai highlight.js)
- Tab interface untuk multiple requests
- Resizable panels
- Monospace font untuk code/JSON areas
- Status bar di bawah

### Technical:
- Fetch API untuk send requests
- localStorage untuk collections, history, environments
- Custom JSON syntax highlighter (atau highlight.js via CDN)
- CSS Grid untuk panel layout
- Drag & drop API
- Responsive (collapse sidebar di mobile)

### Deployment:
- Buat vercel.json untuk hosting di Vercel

Buat semua file yang diperlukan. Design harus terasa seperti professional developer tool.
```
