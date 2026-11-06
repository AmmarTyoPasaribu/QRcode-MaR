import type { Scene } from "./scene";
import { sceneToCanvas } from "./render";

export type ScanResult = "ok" | "mismatch" | "unreadable";

/**
 * Renders the scene and decodes it with jsQR — a stricter decoder than most
 * phone cameras, so a pass here is a good sign the code will scan.
 */
export async function verifyScene(scene: Scene, expected: string, matte: string): Promise<ScanResult> {
  const { default: jsQR } = await import("jsqr");
  // Try a mid and a small rendering; tiny prints are where stylised codes fail.
  for (const width of [640, 360]) {
    const canvas = await sceneToCanvas(scene, { width, matte });
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "unreadable";
    const { data, width: w, height: h } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const found = jsQR(data, w, h, { inversionAttempts: "attemptBoth" });
    if (found) {
      // jsQR decodes bytes as UTF-8 into `data`.
      return found.data === expected ? "ok" : "mismatch";
    }
  }
  return "unreadable";
}
