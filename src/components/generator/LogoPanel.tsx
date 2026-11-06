"use client";

import { useRef, useState } from "react";
import { Section, Segmented, Slider, Switch } from "@/components/ui/controls";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { LOGO_ICONS, type IconName } from "@/lib/iconPaths";
import type { LogoShape, LogoState } from "@/lib/qr/types";
import g from "./generator.module.css";

const MAX_FILE = 5 * 1024 * 1024;
const MAX_DIM = 512;

/** Decode an image file and re-encode it at most 512px, keeping transparency. */
async function processFile(file: File): Promise<{ src: string; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode"));
      i.src = url;
    });
    // SVGs without intrinsic size report 0 — treat them as square.
    const w0 = img.naturalWidth || MAX_DIM;
    const h0 = img.naturalHeight || MAX_DIM;
    const scale = Math.min(1, MAX_DIM / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    return { src: canvas.toDataURL("image/png"), width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface Props {
  logo: LogoState;
  previewSrc: string | null;
  onChange: (patch: Partial<LogoState>) => void;
  onLogoAdded: () => void;
}

export default function LogoPanel({ logo, previewSrc, onChange, onLogoAdded }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const hasLogo = !!(logo.src || logo.icon);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("File harus berupa gambar (PNG, JPG, SVG, WebP).", "error");
      return;
    }
    if (file.size > MAX_FILE) {
      toast("Gambar terlalu besar — maksimal 5 MB.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await processFile(file);
      onChange({ ...result, icon: null });
      onLogoAdded();
    } catch {
      toast("Gambar tidak bisa dibaca. Coba file lain.", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const pickIcon = (name: IconName) => {
    if (logo.icon === name) {
      onChange({ icon: null });
      return;
    }
    onChange({ icon: name, src: null, width: 1, height: 1 });
    onLogoAdded();
  };

  return (
    <div className={g.panelBody}>
      <Section title="Gambar logo" icon="image">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {hasLogo && previewSrc ? (
          <div className={g.logoCurrent}>
            <span className={g.logoThumb}>
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
              <img src={previewSrc} alt="Logo yang dipakai" />
            </span>
            <div className={g.logoMeta}>
              <strong>{logo.icon ? "Ikon bawaan" : "Logo unggahan"}</strong>
              <span>{logo.icon ? "Warnanya mengikuti warna QR." : `${logo.width}×${logo.height}px`}</span>
            </div>
            <div className={g.logoActions}>
              <button type="button" className="btn btn-ghost" onClick={() => inputRef.current?.click()}>
                Ganti
              </button>
              <button type="button" className="icon-btn" onClick={() => onChange({ src: null, icon: null })} aria-label="Hapus logo" title="Hapus logo">
                <Icon name="trash" size={17} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={g.dropzone}
            data-dragging={dragging ? "" : undefined}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            disabled={busy}
          >
            <span className={g.dropIcon}>
              <Icon name="upload" size={22} />
            </span>
            <span className={g.dropTitle}>{busy ? "Memproses…" : "Klik atau seret gambar ke sini"}</span>
            <span className={g.dropHint}>PNG, JPG, SVG, WebP · maks. 5 MB · tetap di perangkatmu</span>
          </button>
        )}
      </Section>

      <Section title="Atau pakai ikon" icon="sparkles">
        <div className={g.iconGrid}>
          {LOGO_ICONS.map((i) => (
            <button
              key={i.name}
              type="button"
              className={g.iconPick}
              data-active={logo.icon === i.name ? "" : undefined}
              aria-pressed={logo.icon === i.name}
              onClick={() => pickIcon(i.name)}
              title={i.label}
            >
              <Icon name={i.name} size={20} />
              <span>{i.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Pengaturan logo" icon="sliders">
        <fieldset className={g.fieldset} disabled={!hasLogo}>
          <Segmented
            legend="Bentuk"
            value={logo.shape}
            onChange={(shape: LogoShape) => onChange({ shape })}
            options={[
              { value: "square", label: "Kotak" },
              { value: "rounded", label: "Membulat" },
              { value: "circle", label: "Lingkaran" },
            ]}
          />
          <div className={g.row2}>
            <Slider label="Ukuran" min={10} max={30} value={Math.round(logo.size * 100)} onChange={(v) => onChange({ size: v / 100 })} format={(v) => `${v}%`} />
            <Slider label="Jarak tepi" min={0} max={2} step={0.2} value={logo.padding} onChange={(padding) => onChange({ padding })} format={(v) => `${v.toFixed(1)} modul`} />
          </div>
          <Switch label="Latar di belakang logo" description="Memberi ruang bersih agar logo terlihat jelas." checked={logo.background} onChange={(background) => onChange({ background })} />
        </fieldset>
        {!hasLogo && <p className={g.note}>Tambahkan logo atau ikon untuk mengatur tampilannya.</p>}
        {hasLogo && logo.size > 0.26 && (
          <p className={g.inlineMsg} data-tone="warn">
            <Icon name="alert" size={15} /> Logo besar menutupi banyak data — pastikan lencana uji pindai tetap hijau.
          </p>
        )}
      </Section>
    </div>
  );
}
