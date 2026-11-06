/**
 * Deterministic landscape geometry. A seeded PRNG keeps the server and client
 * markup identical, so the scene can be rendered on the server.
 */

export const W = 1600;
export const H = 900;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Jagged mountain ridge from left to right, closed at the bottom. */
export function ridge(seed: number, baseY: number, amp: number, peaks: number): { d: string; snow: string } {
  const rnd = mulberry32(seed);
  const pts: [number, number][] = [[-20, baseY + rnd() * amp * 0.3]];
  const step = (W + 40) / peaks;
  const snow: string[] = [];
  for (let i = 0; i < peaks; i++) {
    const px = -20 + step * (i + 0.3 + rnd() * 0.4);
    const py = baseY - amp * (0.45 + rnd() * 0.55);
    // a couple of small shoulders on the way up
    const prev = pts[pts.length - 1];
    const sx = prev[0] + (px - prev[0]) * (0.45 + rnd() * 0.2);
    const sy = prev[1] + (py - prev[1]) * (0.45 + rnd() * 0.25) + rnd() * 14;
    pts.push([sx, sy], [px, py]);
    const vx = px + step * (0.35 + rnd() * 0.2);
    const vy = baseY - amp * (0.05 + rnd() * 0.3);
    pts.push([vx, vy]);
    // snow cap: a small notched triangle near the peak
    const cap = 18 + rnd() * 16;
    const lx = px - cap * 1.1;
    const rx = px + cap * 1.2;
    const ly = py + cap * 0.9;
    snow.push(
      `M${r1(px)} ${r1(py)}L${r1(rx)} ${r1(ly)}L${r1(px + cap * 0.4)} ${r1(ly - 6)}L${r1(px)} ${r1(ly + 4)}L${r1(px - cap * 0.4)} ${r1(ly - 5)}L${r1(lx)} ${r1(ly)}Z`,
    );
  }
  pts.push([W + 20, baseY]);
  const d = `M-20 ${H}` + pts.map(([x, y]) => `L${r1(x)} ${r1(y)}`).join("") + `L${W + 20} ${H}Z`;
  return { d, snow: snow.join("") };
}

/** A three-tier pine silhouette. */
function pine(x: number, base: number, h: number, wRatio = 0.42): string {
  const w = h * wRatio;
  const trunk = h * 0.09;
  const top = base - h;
  const bottom = base - trunk;
  const span = bottom - top;
  const tiers: [number, number, number][] = [
    [0, 0.42, 0.52],
    [0.2, 0.72, 0.78],
    [0.42, 1, 1],
  ];
  let d = "";
  for (const [t, b, hw] of tiers) {
    const ty = top + span * t;
    const by = top + span * b;
    const half = (w / 2) * hw;
    d += `M${r1(x)} ${r1(ty)}L${r1(x + half)} ${r1(by)}L${r1(x - half)} ${r1(by)}Z`;
  }
  const tw = Math.max(2, w * 0.1);
  d += `M${r1(x - tw / 2)} ${r1(bottom - 1)}h${r1(tw)}v${r1(trunk + 2)}h${r1(-tw)}Z`;
  return d;
}

interface ForestOpts {
  seed: number;
  base: number;
  wave: number;
  minH: number;
  maxH: number;
  spacing: number;
  /** Only place trees where this returns true (x in scene units). */
  where?: (x: number) => boolean;
  /** Height multiplier by x — lets the edge forests tower over the centre. */
  scale?: (x: number) => number;
}

/** A band of pines standing on a gently rolling hill. */
export function forest(o: ForestOpts): string {
  const rnd = mulberry32(o.seed);
  const phase = rnd() * Math.PI * 2;
  const groundY = (x: number) => o.base + Math.sin(x / 210 + phase) * o.wave + Math.sin(x / 83 + phase * 2) * o.wave * 0.3;
  // hill under the trees
  let d = `M-20 ${H}`;
  for (let x = -20; x <= W + 20; x += 40) d += `L${x} ${r1(groundY(x) + 2)}`;
  d += `L${W + 20} ${H}Z`;
  for (let x = -10; x < W + 10; x += o.spacing * (0.6 + rnd() * 0.8)) {
    if (o.where && !o.where(x)) continue;
    const s = o.scale ? o.scale(x) : 1;
    const h = (o.minH + rnd() * (o.maxH - o.minH)) * s;
    // sink the trunk into the hill so the canopy meets the ground line
    d += pine(x, groundY(x) + 3 + h * 0.09, h, 0.36 + rnd() * 0.12);
  }
  return d;
}

export interface Dot {
  x: number;
  y: number;
  r: number;
  delay: number;
  dur: number;
}

export function scatter(seed: number, count: number, area: { x0: number; x1: number; y0: number; y1: number }, rMin: number, rMax: number): Dot[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: r1(area.x0 + rnd() * (area.x1 - area.x0)),
    y: r1(area.y0 + rnd() * (area.y1 - area.y0)),
    r: r1(rMin + rnd() * (rMax - rMin)),
    delay: r1(rnd() * 8),
    dur: r1(4 + rnd() * 6),
  }));
}

// ---- precomputed layers ----
export const MOUNTAINS_FAR = ridge(7, 520, 260, 5);
export const MOUNTAINS_MID = ridge(21, 610, 200, 7);
export const FOREST_FAR = forest({ seed: 3, base: 668, wave: 18, minH: 34, maxH: 62, spacing: 13 });
export const FOREST_MID = forest({ seed: 11, base: 742, wave: 26, minH: 62, maxH: 112, spacing: 22 });
export const FOREST_NEAR = forest({
  seed: 42,
  base: 860,
  wave: 22,
  minH: 120,
  maxH: 210,
  spacing: 36,
  where: (x) => x < 380 || x > 1220,
  scale: (x) => {
    const edge = Math.min(x, W - x); // 0 at the edges
    return 1.9 - Math.min(edge, 380) / 380;
  },
});
export const STARS = scatter(5, 90, { x0: 0, x1: W, y0: 0, y1: 470 }, 0.6, 1.8);
export const FIREFLIES = scatter(9, 26, { x0: 40, x1: W - 40, y0: 520, y1: 870 }, 1.6, 3.2);
