import qrcode from "qrcode-generator";
import type { EcLevel } from "./types";

// The library's default byte conversion keeps only the low 8 bits of each
// UTF-16 unit, which corrupts anything outside Latin-1 (emoji, accents, CJK).
// Encode as UTF-8 instead — every modern scanner decodes byte mode as UTF-8.
const utf8 = new TextEncoder();
qrcode.stringToBytes = (s: string) => Array.from(utf8.encode(s));

export interface QRMatrix {
  size: number;
  version: number;
  modules: boolean[][];
  isDark(row: number, col: number): boolean;
}

export type EncodeResult = { ok: true; matrix: QRMatrix } | { ok: false; error: string };

/** Byte capacity of a version-40 symbol per error-correction level. */
export const MAX_BYTES: Record<EcLevel, number> = { L: 2953, M: 2331, Q: 1663, H: 1273 };

export function byteLength(s: string): number {
  return utf8.encode(s).length;
}

export function encode(data: string, ec: EcLevel): EncodeResult {
  const bytes = byteLength(data);
  if (bytes > MAX_BYTES[ec]) {
    return {
      ok: false,
      error: `Data terlalu panjang (${bytes} byte). Batas untuk level ${ec} adalah ${MAX_BYTES[ec]} byte — persingkat isinya atau turunkan level koreksi.`,
    };
  }
  try {
    const qr = qrcode(0, ec);
    qr.addData(data, "Byte");
    qr.make();
    const size = qr.getModuleCount();
    const modules: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) row.push(qr.isDark(r, c));
      modules.push(row);
    }
    return {
      ok: true,
      matrix: {
        size,
        version: (size - 17) / 4,
        modules,
        isDark: (r, c) => r >= 0 && c >= 0 && r < size && c < size && modules[r][c],
      },
    };
  } catch {
    return { ok: false, error: "Data terlalu panjang untuk satu kode QR. Coba persingkat isinya." };
  }
}
