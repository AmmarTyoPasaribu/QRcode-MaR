import { canvasToBlob, sceneToCanvas, sceneToSvg } from "@/lib/qr/render";
import type { Scene } from "@/lib/qr/scene";

export type ExportFormat = "png" | "jpeg" | "webp" | "svg";

export const FORMATS: { value: ExportFormat; label: string; mime: string }[] = [
  { value: "png", label: "PNG", mime: "image/png" },
  { value: "svg", label: "SVG", mime: "image/svg+xml" },
  { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
  { value: "webp", label: "WebP", mime: "image/webp" },
];

export const SIZES = [512, 1024, 2048, 4096];

export function slug(s: string): string {
  return (
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "kode"
  );
}

export function fileName(type: string, label: string, format: ExportFormat): string {
  const ext = format === "jpeg" ? "jpg" : format;
  return `qr-${type}-${slug(label)}.${ext}`;
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking synchronously can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

interface RenderOpts {
  fontFamily: string;
  /** Colour used under transparent areas for formats without alpha. */
  bg: string;
  transparent: boolean;
  title: string;
}

export async function renderBlob(scene: Scene, format: ExportFormat, width: number, o: RenderOpts): Promise<Blob> {
  if (format === "svg") {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` + sceneToSvg(scene, { width, title: o.title });
    return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  }
  const matte = format === "jpeg" && o.transparent ? o.bg : format === "jpeg" ? "#ffffff" : undefined;
  const canvas = await sceneToCanvas(scene, { width, fontFamily: o.fontFamily, matte });
  const mime = FORMATS.find((f) => f.value === format)!.mime;
  const blob = await canvasToBlob(canvas, mime, format === "png" ? undefined : 0.92);
  // Browsers without WebP encoding silently fall back to PNG.
  if (format === "webp" && blob.type !== "image/webp") throw new Error("webp");
  return blob;
}

export async function makeThumb(scene: Scene, fontFamily: string): Promise<string> {
  const canvas = await sceneToCanvas(scene, { width: 168, fontFamily });
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}
