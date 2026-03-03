# Algorithm Visualizer

## Prompt untuk Antigravity Claude

```
Saya mau buat Algorithm Visualizer — tool edukasi yang memvisualisasikan berbagai algoritma step-by-step dengan animasi yang indah. Pakai native HTML/CSS/JS.

## Spesifikasi:

### Core Features:

#### 1. Sorting Algorithms (visualisasi bar chart):
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort
- Radix Sort
- Bars berwarna-warni, highlight element yang sedang di-compare/swap
- Sound effects saat swap (optional, bisa di-toggle)

#### 2. Pathfinding Algorithms (visualisasi grid):
- BFS (Breadth-First Search)
- DFS (Depth-First Search)
- Dijkstra's Algorithm
- A* (A-Star)
- Grid yang bisa di-draw: set start point, end point, walls/obstacles
- Animasi visited nodes (wave effect) dan final path (highlighted)
- Weighted nodes support (untuk Dijkstra & A*)

#### 3. Tree Algorithms (visualisasi tree structure):
- Binary Search Tree (insert, search, delete)
- Tree Traversal (inorder, preorder, postorder, level-order)
- AVL Tree (self-balancing, show rotations)
- Visual tree dengan nodes dan edges, highlight current node

#### 4. Search Algorithms:
- Linear Search
- Binary Search
- Visualisasi pada array dengan highlight

### Controls:
- **Speed Control** — Slider dari sangat lambat ke sangat cepat
- **Step-by-step** — Next step, Previous step buttons
- **Play/Pause** — Auto-play atau pause di tengah
- **Reset** — Generate data baru
- **Array Size** — Slider untuk ubah jumlah elements (10-200)
- **Generate Random** — Random data baru
- **Custom Input** — User bisa input data sendiri

### Information Panel:
- Nama algoritma + deskripsi singkat
- Time Complexity (Best, Average, Worst) — Big O notation
- Space Complexity
- Current step description ("Comparing element 5 with element 3")
- Step counter (Step 15 of 120)
- Pseudocode yang highlight baris yang sedang dieksekusi

### Design:
- Dark mode premium
- Tab navigation untuk kategori (Sorting | Pathfinding | Trees | Search)
- Colorful bars/nodes dengan smooth transitions
- Neon glow effects pada active elements
- Controls di bottom bar
- Info panel di sidebar
- Space background halus
- Responsive

### Technical:
- Canvas API untuk rendering (sorting bars, pathfinding grid)
- SVG atau Canvas untuk tree visualization
- async/await + setTimeout untuk step delays
- Generator functions untuk step-by-step execution
- CSS animations untuk UI transitions
- requestAnimationFrame untuk smooth rendering
- Web Audio API untuk optional sound effects (frequency based on bar height)

### Deployment:
- Buat vercel.json untuk hosting di Vercel

Buat semua file yang diperlukan. Visualisasinya harus smooth, edukatif, dan visually appealing. Setiap algoritma harus bisa dipahami hanya dari melihat animasinya.
```
