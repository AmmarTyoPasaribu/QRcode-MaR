import type { Paint, Scene } from "./scene";

export const EXPORT_FONT_STACK = "'Plus Jakarta Sans', 'Segoe UI', Roboto, Arial, sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const r2 = (v: number) => Math.round(v * 100) / 100;

function paintDef(id: string, p: Paint): string {
  if (p.kind === "linear") {
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${r2(p.x1)}" y1="${r2(p.y1)}" x2="${r2(p.x2)}" y2="${r2(p.y2)}"><stop offset="0" stop-color="${esc(p.from)}"/><stop offset="1" stop-color="${esc(p.to)}"/></linearGradient>`;
  }
  if (p.kind === "radial") {
    return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${r2(p.cx)}" cy="${r2(p.cy)}" r="${r2(p.r)}"><stop offset="0" stop-color="${esc(p.from)}"/><stop offset="1" stop-color="${esc(p.to)}"/></radialGradient>`;
  }
  return "";
}

function paintRef(id: string, p: Paint): string {
  return p.kind === "solid" ? esc(p.color) : `url(#${id})`;
}

export interface SvgOptions {
  /** Output width in px (height follows the aspect ratio). Omit for a fluid SVG. */
  width?: number;
  /** Unique prefix for ids when several SVGs live in one document. */
  idPrefix?: string;
  fontFamily?: string;
  title?: string;
}

export function sceneToSvg(scene: Scene, opts: SvgOptions = {}): string {
  const id = opts.idPrefix ?? "qr";
  const font = opts.fontFamily ?? EXPORT_FONT_STACK;
  const size =
    opts.width !== undefined
      ? ` width="${Math.round(opts.width)}" height="${Math.round((opts.width * scene.height) / scene.width)}"`
      : "";
  const defs: string[] = [];
  const body: string[] = [];

  if (scene.fill.kind !== "solid") defs.push(paintDef(`${id}-fill`, scene.fill));
  if (scene.eyeFill !== scene.fill && scene.eyeFill.kind !== "solid") defs.push(paintDef(`${id}-eye`, scene.eyeFill));
  const eyeId = scene.eyeFill === scene.fill ? `${id}-fill` : `${id}-eye`;

  if (scene.frame) body.push(`<path d="${scene.frame.d}" fill="${esc(scene.frame.color)}" fill-rule="evenodd"/>`);
  if (scene.background) body.push(`<path d="${scene.background.d}" fill="${esc(scene.background.color)}"/>`);
  if (scene.pill) body.push(`<path d="${scene.pill.d}" fill="${esc(scene.pill.color)}"/>`);
  if (scene.modules) body.push(`<path d="${scene.modules}" fill="${paintRef(`${id}-fill`, scene.fill)}"/>`);
  if (scene.alignments) body.push(`<path d="${scene.alignments}" fill="${paintRef(`${id}-fill`, scene.fill)}" fill-rule="evenodd"/>`);
  body.push(`<path d="${scene.eyeFrames}" fill="${paintRef(eyeId, scene.eyeFill)}" fill-rule="evenodd"/>`);
  body.push(`<path d="${scene.eyeBalls}" fill="${paintRef(eyeId, scene.eyeFill)}"/>`);

  if (scene.logo) {
    const l = scene.logo;
    if (l.plate) body.push(`<path d="${l.plate.d}" fill="${esc(l.plate.color)}"/>`);
    let clipAttr = "";
    if (l.clip) {
      defs.push(`<clipPath id="${id}-clip"><path d="${l.clip}"/></clipPath>`);
      clipAttr = ` clip-path="url(#${id}-clip)"`;
    }
    body.push(
      `<image href="${esc(l.src)}" x="${r2(l.x)}" y="${r2(l.y)}" width="${r2(l.w)}" height="${r2(l.h)}" preserveAspectRatio="xMidYMid slice"${clipAttr}/>`,
    );
  }

  if (scene.text) {
    const t = scene.text;
    body.push(
      `<text x="${r2(t.x)}" y="${r2(t.y)}" fill="${esc(t.color)}" font-family="${esc(font)}" font-size="${r2(t.size)}" font-weight="700" letter-spacing="${r2(t.size * 0.02)}" text-anchor="middle" dominant-baseline="central">${esc(t.value)}</text>`,
    );
  }

  const title = opts.title ? `<title>${esc(opts.title)}</title>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg"${size} viewBox="0 0 ${r2(scene.width)} ${r2(scene.height)}" role="img" shape-rendering="geometricPrecision">` +
    title +
    (defs.length ? `<defs>${defs.join("")}</defs>` : "") +
    body.join("") +
    `</svg>`
  );
}

// ---------------- canvas ----------------

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Gambar tidak bisa dimuat"));
      img.src = src;
    });
    imageCache.set(src, p);
    if (imageCache.size > 20) imageCache.delete(imageCache.keys().next().value as string);
  }
  return p;
}

function canvasPaint(ctx: CanvasRenderingContext2D, p: Paint): string | CanvasGradient {
  if (p.kind === "solid") return p.color;
  const g =
    p.kind === "linear"
      ? ctx.createLinearGradient(p.x1, p.y1, p.x2, p.y2)
      : ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, p.r);
  g.addColorStop(0, p.from);
  g.addColorStop(1, p.to);
  return g;
}

export interface CanvasOptions {
  /** Output width in px. */
  width: number;
  fontFamily?: string;
  /** Solid colour painted under everything (JPEG has no alpha). */
  matte?: string;
}

export async function sceneToCanvas(scene: Scene, opts: CanvasOptions): Promise<HTMLCanvasElement> {
  const scale = opts.width / scene.width;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(scene.width * scale);
  canvas.height = Math.round(scene.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung di browser ini");

  const logoImg = scene.logo ? await loadImage(scene.logo.src).catch(() => null) : null;
  const font = opts.fontFamily ?? EXPORT_FONT_STACK;
  if (scene.text && typeof document !== "undefined" && document.fonts) {
    await document.fonts.load(`700 ${Math.round(scene.text.size * scale)}px ${font}`).catch(() => undefined);
  }

  if (opts.matte) {
    ctx.fillStyle = opts.matte;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = "high";

  if (scene.frame) {
    ctx.fillStyle = scene.frame.color;
    ctx.fill(new Path2D(scene.frame.d), "evenodd");
  }
  if (scene.background) {
    ctx.fillStyle = scene.background.color;
    ctx.fill(new Path2D(scene.background.d));
  }
  if (scene.pill) {
    ctx.fillStyle = scene.pill.color;
    ctx.fill(new Path2D(scene.pill.d));
  }
  const fill = canvasPaint(ctx, scene.fill);
  const eyeFill = scene.eyeFill === scene.fill ? fill : canvasPaint(ctx, scene.eyeFill);
  ctx.fillStyle = fill;
  if (scene.modules) ctx.fill(new Path2D(scene.modules));
  if (scene.alignments) ctx.fill(new Path2D(scene.alignments), "evenodd");
  ctx.fillStyle = eyeFill;
  ctx.fill(new Path2D(scene.eyeFrames), "evenodd");
  ctx.fill(new Path2D(scene.eyeBalls));

  if (scene.logo) {
    const l = scene.logo;
    if (l.plate) {
      ctx.fillStyle = l.plate.color;
      ctx.fill(new Path2D(l.plate.d));
    }
    if (logoImg) {
      ctx.save();
      if (l.clip) ctx.clip(new Path2D(l.clip));
      // "cover" fit, matching preserveAspectRatio="xMidYMid slice"
      const iw = logoImg.naturalWidth || l.w;
      const ih = logoImg.naturalHeight || l.h;
      const s = Math.max(l.w / iw, l.h / ih);
      const sw = l.w / s;
      const sh = l.h / s;
      ctx.drawImage(logoImg, (iw - sw) / 2, (ih - sh) / 2, sw, sh, l.x, l.y, l.w, l.h);
      ctx.restore();
    }
  }

  if (scene.text) {
    const t = scene.text;
    ctx.fillStyle = t.color;
    ctx.font = `700 ${t.size}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${t.size * 0.02}px`;
    ctx.fillText(t.value, t.x, t.y);
  }
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar"))), type, quality),
  );
}
