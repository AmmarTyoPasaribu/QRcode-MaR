"use client";

import { forwardRef } from "react";
import { Segmented } from "@/components/ui/controls";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/iconPaths";
import type { ScanResult } from "@/lib/qr/verify";
import { FORMATS, SIZES, type ExportFormat } from "./exporting";
import g from "./generator.module.css";

export type ScanState = ScanResult | "checking" | null;

export interface Warning {
  tone: "error" | "warn" | "info";
  text: string;
}

interface Props {
  svg: string;
  ghost: boolean;
  error?: string;
  meta: { version: number; modules: number; bytes: number; ec: string } | null;
  scan: ScanState;
  warnings: Warning[];
  payload: string;
  transparent: boolean;
  format: ExportFormat;
  onFormat: (f: ExportFormat) => void;
  size: number;
  onSize: (s: number) => void;
  busy: boolean;
  canShare: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onCopyText: () => void;
  onShare: () => void;
  onSave: () => void;
}

const SCAN: Record<Exclude<ScanState, null>, { icon: IconName; text: string; tone: string }> = {
  checking: { icon: "scan", text: "Menguji pindai…", tone: "muted" },
  ok: { icon: "check", text: "Lolos uji pindai", tone: "success" },
  mismatch: { icon: "alert", text: "Isi terbaca berbeda", tone: "error" },
  unreadable: { icon: "alert", text: "Sulit dipindai", tone: "warn" },
};

const PreviewPanel = forwardRef<HTMLElement, Props>(function PreviewPanel(p, ref) {
  const scan = p.scan ? SCAN[p.scan] : null;
  const disabled = p.ghost || !!p.error || p.busy;
  const fmtLabel = FORMATS.find((f) => f.value === p.format)?.label ?? "";

  return (
    <section ref={ref} className={g.preview} aria-labelledby="preview-title">
      <header className={g.previewHead}>
        <h2 id="preview-title" className={g.panelTitle}>
          <Icon name="eye" size={18} /> Pratinjau
        </h2>
        {scan && !p.ghost && !p.error && (
          <span className={g.scanBadge} data-tone={scan.tone} aria-live="polite">
            <Icon name={scan.icon} size={14} strokeWidth={2.5} className={p.scan === "checking" ? g.pulse : undefined} />
            {scan.text}
          </span>
        )}
      </header>

      <div className={g.stage} data-transparent={p.transparent ? "" : undefined}>
        <div className={g.qrWrap} data-ghost={p.ghost || p.error ? "" : undefined} dangerouslySetInnerHTML={{ __html: p.svg }} />
        {p.ghost && !p.error && (
          <div className={g.stageOverlay}>
            <span className={g.overlayIcon}>
              <Icon name="tree" size={22} />
            </span>
            <strong>Contoh gaya</strong>
            <span>Isi konten di panel kiri — kode QR-mu tumbuh di sini.</span>
          </div>
        )}
        {p.error && (
          <div className={g.stageOverlay} data-tone="error" role="alert">
            <span className={g.overlayIcon}>
              <Icon name="alert" size={22} />
            </span>
            <strong>Belum bisa dibuat</strong>
            <span>{p.error}</span>
          </div>
        )}
      </div>

      {p.meta && !p.ghost && !p.error && (
        <ul className={g.meta} aria-label="Detail kode">
          <li>Versi {p.meta.version}</li>
          <li>
            {p.meta.modules}×{p.meta.modules} modul
          </li>
          <li>{p.meta.bytes.toLocaleString("id-ID")} byte</li>
          <li>Koreksi {p.meta.ec}</li>
        </ul>
      )}

      {p.warnings.length > 0 && !p.ghost && !p.error && (
        <ul className={g.warnings}>
          {p.warnings.map((w) => (
            <li key={w.text} className={g.inlineMsg} data-tone={w.tone}>
              <Icon name={w.tone === "info" ? "info" : "alert"} size={15} />
              {w.text}
            </li>
          ))}
        </ul>
      )}

      {!p.ghost && !p.error && p.payload && (
        <div className={g.payload}>
          <code title={p.payload}>{p.payload}</code>
          <button type="button" className="icon-btn" onClick={p.onCopyText} aria-label="Salin isi kode sebagai teks" title="Salin teks">
            <Icon name="copy" size={16} />
          </button>
        </div>
      )}

      <div className={g.exportBox}>
        <Segmented legend="Format" value={p.format} onChange={p.onFormat} options={FORMATS.map((f) => ({ value: f.value, label: f.label }))} />
        <div className={g.downloadRow}>
          <label className={g.sizeSelect} title={p.format === "svg" ? "Ukuran acuan SVG (tetap tajam di ukuran apa pun)" : "Resolusi gambar"}>
            <span className="sr-only">{p.format === "svg" ? "Ukuran acuan" : "Resolusi"}</span>
            <select value={p.size} onChange={(e) => p.onSize(Number(e.target.value))}>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} px
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={15} />
          </label>
          <button type="button" className={`btn btn-primary ${g.downloadBtn}`} onClick={p.onDownload} disabled={disabled}>
            <Icon name="download" size={18} />
            {p.busy ? "Menyiapkan…" : `Unduh ${fmtLabel}`}
            <kbd className={g.kbd}>Ctrl S</kbd>
          </button>
        </div>
        <div className={g.secondaryActions}>
          <button type="button" className="btn btn-ghost" onClick={p.onCopy} disabled={disabled}>
            <Icon name="copy" size={16} /> Salin
          </button>
          {p.canShare && (
            <button type="button" className="btn btn-ghost" onClick={p.onShare} disabled={disabled}>
              <Icon name="share" size={16} /> Bagikan
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={p.onSave} disabled={disabled}>
            <Icon name="bookmark" size={16} /> Simpan
          </button>
        </div>
      </div>
    </section>
  );
});

export default PreviewPanel;
