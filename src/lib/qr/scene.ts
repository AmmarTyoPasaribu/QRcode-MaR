/**
 * Builds a resolution-independent description of the final image (paths in
 * SVG path syntax). Both the SVG exporter and the canvas renderer consume the
 * same scene — canvas via Path2D — so PNG, JPEG and SVG always match.
 */
import type { QRMatrix } from "./encode";
import type { FrameState, LogoState, StyleState } from "./types";

/** Size of one module in scene units. */
export const M = 10;

export type Paint =
  | { kind: "solid"; color: string }
  | { kind: "linear"; x1: number; y1: number; x2: number; y2: number; from: string; to: string }
  | { kind: "radial"; cx: number; cy: number; r: number; from: string; to: string };

export interface Scene {
  width: number;
  height: number;
  /** Frame ring/bar (filled even-odd, so the QR area stays a hole). */
  frame?: { d: string; color: string };
  /** Label pill drawn on top of the background (badge style). */
  pill?: { d: string; color: string };
  /** Background behind the modules — omitted when transparent. */
  background?: { d: string; color: string };
  modules: string;
  /** Alignment patterns drawn as solid rings (even-odd), painted with `fill`. */
  alignments: string;
  eyeFrames: string;
  eyeBalls: string;
  fill: Paint;
  eyeFill: Paint;
  logo?: {
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
    /** Shape filled with the background colour behind the logo. */
    plate?: { d: string; color: string };
    /** Clip applied to the image itself. */
    clip?: string;
  };
  text?: { value: string; x: number; y: number; size: number; color: string };
}

const n2 = (v: number) => Math.round(v * 100) / 100;

// ---------- path primitives ----------

export function rectPath(x: number, y: number, w: number, h: number): string {
  return `M${n2(x)} ${n2(y)}h${n2(w)}v${n2(h)}h${n2(-w)}Z`;
}

/** Rounded rectangle with per-corner radii [tl, tr, br, bl]. */
export function roundRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | [number, number, number, number],
): string {
  const max = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = (typeof radii === "number" ? [radii, radii, radii, radii] : radii).map((r) =>
    Math.max(0, Math.min(r, max)),
  );
  if (!tl && !tr && !br && !bl) return rectPath(x, y, w, h);
  const p: string[] = [`M${n2(x + tl)} ${n2(y)}`, `H${n2(x + w - tr)}`];
  if (tr) p.push(`A${n2(tr)} ${n2(tr)} 0 0 1 ${n2(x + w)} ${n2(y + tr)}`);
  p.push(`V${n2(y + h - br)}`);
  if (br) p.push(`A${n2(br)} ${n2(br)} 0 0 1 ${n2(x + w - br)} ${n2(y + h)}`);
  p.push(`H${n2(x + bl)}`);
  if (bl) p.push(`A${n2(bl)} ${n2(bl)} 0 0 1 ${n2(x)} ${n2(y + h - bl)}`);
  p.push(`V${n2(y + tl)}`);
  if (tl) p.push(`A${n2(tl)} ${n2(tl)} 0 0 1 ${n2(x + tl)} ${n2(y)}`);
  p.push("Z");
  return p.join("");
}

export function circlePath(cx: number, cy: number, r: number): string {
  return `M${n2(cx - r)} ${n2(cy)}a${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0Z`;
}

function diamondPath(x: number, y: number, s: number): string {
  const c = s / 2;
  return `M${n2(x + c)} ${n2(y)}L${n2(x + s)} ${n2(y + c)}L${n2(x + c)} ${n2(y + s)}L${n2(x)} ${n2(y + c)}Z`;
}

// ---------- modules ----------

function isFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

function modulePath(style: StyleState["dotStyle"], x: number, y: number, m: QRMatrix, r: number, c: number): string {
  switch (style) {
    case "square":
      return rectPath(x, y, M, M);
    case "rounded": {
      const i = M * 0.06;
      return roundRectPath(x + i, y + i, M - 2 * i, M - 2 * i, M * 0.3);
    }
    case "dots":
      return circlePath(x + M / 2, y + M / 2, M * 0.43);
    case "diamond":
      return diamondPath(x - M * 0.04, y - M * 0.04, M * 1.08);
    case "leaf": {
      const i = M * 0.05;
      const big = M * 0.45;
      const small = M * 0.08;
      return roundRectPath(x + i, y + i, M - 2 * i, M - 2 * i, [big, small, big, small]);
    }
    case "fluid": {
      // Round a corner only when both neighbours touching it are empty, so
      // connected runs of modules flow together like a single shape.
      const up = m.isDark(r - 1, c);
      const down = m.isDark(r + 1, c);
      const left = m.isDark(r, c - 1);
      const right = m.isDark(r, c + 1);
      const R = M * 0.5;
      return roundRectPath(x, y, M, M, [
        !up && !left ? R : 0,
        !up && !right ? R : 0,
        !down && !right ? R : 0,
        !down && !left ? R : 0,
      ]);
    }
  }
}

function eyeFramePath(style: StyleState["eyeFrame"], x: number, y: number): string {
  const o = 7 * M;
  const i = 5 * M;
  switch (style) {
    case "square":
      return rectPath(x, y, o, o) + rectPath(x + M, y + M, i, i);
    case "rounded":
      return roundRectPath(x, y, o, o, M * 2.2) + roundRectPath(x + M, y + M, i, i, M * 1.3);
    case "circle":
      return circlePath(x + o / 2, y + o / 2, o / 2) + circlePath(x + o / 2, y + o / 2, i / 2);
    case "leaf":
      return (
        roundRectPath(x, y, o, o, [M * 3, M * 0.6, M * 3, M * 0.6]) +
        roundRectPath(x + M, y + M, i, i, [M * 2, M * 0.2, M * 2, M * 0.2])
      );
  }
}

function eyeBallPath(style: StyleState["eyeBall"], x: number, y: number): string {
  const s = 3 * M;
  switch (style) {
    case "square":
      return rectPath(x, y, s, s);
    case "rounded":
      return roundRectPath(x, y, s, s, M * 0.9);
    case "circle":
      return circlePath(x + s / 2, y + s / 2, s / 2);
    case "leaf":
      return roundRectPath(x, y, s, s, [M * 1.4, M * 0.3, M * 1.4, M * 0.3]);
    case "diamond":
      return diamondPath(x - M * 0.3, y - M * 0.3, s + M * 0.6);
  }
}

// ---------- alignment patterns ----------

/** Alignment-pattern centre coordinates per version (ISO/IEC 18004 Annex E). */
const ALIGN_POS: number[][] = [
  [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62],
  [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90],
  [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170],
];

/** True when the 5×5 block centred at (r, c) really is an alignment pattern. */
function isAlignment(m: QRMatrix, r: number, c: number): boolean {
  for (let dr = -2; dr <= 2; dr++)
    for (let dc = -2; dc <= 2; dc++) {
      const ring = Math.max(Math.abs(dr), Math.abs(dc));
      if (m.isDark(r + dr, c + dc) !== (ring !== 1)) return false;
    }
  return true;
}

/**
 * Stylised dots break up the 5×5 alignment rings, and scanners use those
 * rings to correct perspective. Drawing them as one solid shape keeps the
 * look consistent while staying easy to detect.
 */
function alignmentPath(style: StyleState["dotStyle"], x: number, y: number): string {
  const o = 5 * M;
  const i = 3 * M;
  const cx = x + o / 2;
  const cy = y + o / 2;
  switch (style) {
    case "dots":
      return circlePath(cx, cy, o / 2) + circlePath(cx, cy, i / 2) + circlePath(cx, cy, M * 0.5);
    case "leaf":
      return (
        roundRectPath(x, y, o, o, [M * 2, M * 0.4, M * 2, M * 0.4]) +
        roundRectPath(x + M, y + M, i, i, [M * 1.2, M * 0.2, M * 1.2, M * 0.2]) +
        roundRectPath(x + 2 * M, y + 2 * M, M, M, [M * 0.5, 0, M * 0.5, 0])
      );
    case "diamond":
      return roundRectPath(x, y, o, o, M * 0.8) + roundRectPath(x + M, y + M, i, i, M * 0.4) + diamondPath(x + 1.8 * M, y + 1.8 * M, M * 1.4);
    default:
      return roundRectPath(x, y, o, o, M * 1.4) + roundRectPath(x + M, y + M, i, i, M * 0.8) + roundRectPath(x + 2 * M, y + 2 * M, M, M, M * 0.3);
  }
}

// ---------- layout ----------

export interface SceneInput {
  matrix: QRMatrix;
  style: StyleState;
  logo: LogoState;
  frame: FrameState;
}

/** Rough bold sans-serif glyph width, shared by SVG and canvas so both match. */
const CHAR_W = 0.6;

export function buildScene({ matrix, style, logo, frame }: SceneInput): Scene {
  const n = matrix.size;
  const qz = style.margin * M;
  const S = n * M + qz * 2; // QR area including quiet zone

  // Frame layout
  let width = S;
  let height = S;
  let qx = 0;
  let qy = 0;
  const cardR = S * style.bgRadius;
  let frameShape: Scene["frame"];
  let bgD = roundRectPath(0, 0, S, S, cardR);
  let text: Scene["text"];
  const label = frame.text.trim().slice(0, 40);

  if (frame.style !== "none" && label) {
    if (frame.style === "banner") {
      const B = S * 0.18;
      height = S + B;
      const R = Math.max(cardR, S * 0.03);
      bgD = roundRectPath(0, 0, S, S, [R, R, 0, 0]);
      frameShape = { d: roundRectPath(0, 0, width, height, R) + bgD, color: frame.color };
      const size = Math.min(B * 0.42, (S * 0.88) / Math.max(1, label.length * CHAR_W));
      text = { value: label, x: width / 2, y: S + B / 2, size, color: frame.textColor };
    } else if (frame.style === "frame") {
      const T = S * 0.04;
      const B = S * 0.16;
      width = S + T * 2;
      height = S + T * 2 + B;
      qx = T;
      qy = T;
      const R = Math.max(cardR, S * 0.06);
      bgD = roundRectPath(T, T, S, S, Math.max(R - T, 0));
      frameShape = { d: roundRectPath(0, 0, width, height, R) + bgD, color: frame.color };
      const size = Math.min(B * 0.46, (S * 0.88) / Math.max(1, label.length * CHAR_W));
      text = { value: label, x: width / 2, y: T + S + (B + T) / 2, size, color: frame.textColor };
    } else if (frame.style === "badge") {
      const P = S * 0.13;
      const gap = S * 0.015;
      height = S + gap + P + S * 0.05;
      bgD = roundRectPath(0, 0, width, height, cardR);
      const size = Math.min(P * 0.48, (S * 0.78) / Math.max(1, label.length * CHAR_W));
      const pillW = Math.min(S * 0.9, Math.max(S * 0.32, label.length * size * CHAR_W + size * 2.4));
      text = { value: label, x: width / 2, y: S + gap + P / 2, size, color: frame.textColor };
      const pill = roundRectPath((width - pillW) / 2, S + gap, pillW, P, P / 2);
      return finish(pill);
    }
  }

  return finish();

  function finish(pill?: string): Scene {
    const ox = qx + qz;
    const oy = qy + qz;
    const span = n * M;

    // ----- logo geometry -----
    let logoOut: Scene["logo"];
    let clearTest: ((r: number, c: number) => boolean) | null = null;
    if (logo.src) {
      const L = span * logo.size;
      const aspect = logo.width > 0 && logo.height > 0 ? logo.width / logo.height : 1;
      let w = L;
      let h = L;
      if (logo.shape !== "circle") {
        if (aspect > 1) h = L / aspect;
        else w = L * aspect;
      }
      const cx = ox + span / 2;
      const cy = oy + span / 2;
      const x = cx - w / 2;
      const y = cy - h / 2;
      const pad = logo.padding * M;
      const plateW = w + pad * 2;
      const plateH = h + pad * 2;
      let plateD: string;
      let clip: string | undefined;
      if (logo.shape === "circle") {
        const rad = plateW / 2;
        plateD = circlePath(cx, cy, rad);
        clip = circlePath(cx, cy, w / 2);
        clearTest = (r, c) => {
          const mx = ox + c * M;
          const my = oy + r * M;
          const nx = Math.max(mx, Math.min(cx, mx + M));
          const ny = Math.max(my, Math.min(cy, my + M));
          return (nx - cx) ** 2 + (ny - cy) ** 2 < (rad - 0.5) ** 2;
        };
      } else {
        const rr = logo.shape === "rounded" ? Math.min(plateW, plateH) * 0.22 : 0;
        plateD = roundRectPath(cx - plateW / 2, cy - plateH / 2, plateW, plateH, rr);
        if (logo.shape === "rounded") clip = roundRectPath(x, y, w, h, Math.min(w, h) * 0.18);
        const x0 = cx - plateW / 2 + 0.5;
        const x1 = cx + plateW / 2 - 0.5;
        const y0 = cy - plateH / 2 + 0.5;
        const y1 = cy + plateH / 2 - 0.5;
        clearTest = (r, c) => {
          const mx = ox + c * M;
          const my = oy + r * M;
          return mx < x1 && mx + M > x0 && my < y1 && my + M > y0;
        };
      }
      logoOut = {
        src: logo.src,
        x,
        y,
        w,
        h,
        clip,
        plate: logo.background ? { d: plateD, color: style.bg } : undefined,
      };
    }

    // ----- alignment patterns -----
    const alignCells = new Set<number>();
    const aligns: string[] = [];
    if (style.dotStyle !== "square") {
      const pos = ALIGN_POS[matrix.version] ?? [];
      for (const r of pos)
        for (const c of pos) {
          if (isFinder(r, c, n) || !isAlignment(matrix, r, c)) continue;
          let covered = false;
          for (let dr = -2; dr <= 2 && !covered; dr++)
            for (let dc = -2; dc <= 2 && !covered; dc++) covered = !!clearTest?.(r + dr, c + dc);
          if (covered) continue; // hidden under the logo — leave as plain modules
          for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) alignCells.add((r + dr) * n + c + dc);
          aligns.push(alignmentPath(style.dotStyle, ox + (c - 2) * M, oy + (r - 2) * M));
        }
    }

    // ----- modules & eyes -----
    const mods: string[] = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!matrix.modules[r][c] || isFinder(r, c, n) || alignCells.has(r * n + c)) continue;
        if (clearTest && clearTest(r, c)) continue;
        mods.push(modulePath(style.dotStyle, ox + c * M, oy + r * M, matrix, r, c));
      }
    }
    const eyes: [number, number][] = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ];
    const eyeFrames = eyes.map(([r, c]) => eyeFramePath(style.eyeFrame, ox + c * M, oy + r * M)).join("");
    const eyeBalls = eyes
      .map(([r, c]) => eyeBallPath(style.eyeBall, ox + (c + 2) * M, oy + (r + 2) * M))
      .join("");

    // ----- paint -----
    let fill: Paint = { kind: "solid", color: style.fg };
    if (style.gradient === "linear") {
      const a = (style.gradientAngle * Math.PI) / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const half = (span / 2) * (Math.abs(cos) + Math.abs(sin));
      const cx = ox + span / 2;
      const cy = oy + span / 2;
      fill = {
        kind: "linear",
        x1: cx - cos * half,
        y1: cy - sin * half,
        x2: cx + cos * half,
        y2: cy + sin * half,
        from: style.fg,
        to: style.gradientColor,
      };
    } else if (style.gradient === "radial") {
      fill = {
        kind: "radial",
        cx: ox + span / 2,
        cy: oy + span / 2,
        r: span * 0.72,
        from: style.fg,
        to: style.gradientColor,
      };
    }
    const eyeFill: Paint = style.customEyeColor ? { kind: "solid", color: style.eyeColor } : fill;

    return {
      width,
      height,
      frame: frameShape,
      pill: pill ? { d: pill, color: frame.color } : undefined,
      background: style.transparent ? undefined : { d: bgD, color: style.bg },
      modules: mods.join(""),
      alignments: aligns.join(""),
      eyeFrames,
      eyeBalls,
      fill,
      eyeFill,
      logo: logoOut,
      text,
    };
  }
}

// ---------- tiny previews for the style pickers ----------

const SAMPLE = [
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
];
const sampleMatrix: QRMatrix = {
  size: 3,
  version: 0,
  modules: SAMPLE.map((r) => r.map(Boolean)),
  isDark: (r, c) => r >= 0 && c >= 0 && r < 3 && c < 3 && SAMPLE[r][c] === 1,
};

/** 3×3 sample of a dot style; viewBox "0 0 30 30". */
export function dotPreviewPath(style: StyleState["dotStyle"]): string {
  let d = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) if (SAMPLE[r][c]) d += modulePath(style, c * M, r * M, sampleMatrix, r, c);
  return d;
}

/** A single finder eye; viewBox "0 0 70 70". */
export function eyePreviewPaths(frame: StyleState["eyeFrame"], ball: StyleState["eyeBall"]): { frame: string; ball: string } {
  return { frame: eyeFramePath(frame, 0, 0), ball: eyeBallPath(ball, 2 * M, 2 * M) };
}
