"use client";

import { ChoiceGroup, ColorField, Field, Section } from "@/components/ui/controls";
import { readableOn } from "@/lib/color";
import { FRAME_TEXT_SUGGESTIONS } from "@/lib/presets";
import type { FrameState, FrameStyle, StyleState } from "@/lib/qr/types";
import g from "./generator.module.css";

function FrameVisual({ kind }: { kind: FrameStyle }) {
  return (
    <svg viewBox="0 0 40 48" width="34" height="40" aria-hidden="true">
      {kind === "frame" && <rect x="1" y="1" width="38" height="46" rx="6" fill="currentColor" />}
      {kind === "banner" && <rect x="4" y="34" width="32" height="12" rx="3" fill="currentColor" />}
      <rect x={kind === "frame" ? 4 : 4} y={kind === "frame" ? 4 : 4} width="32" height="32" rx="3" fill="var(--surface-strong)" stroke="currentColor" strokeWidth={kind === "frame" ? 0 : 1.5} />
      <g fill="currentColor">
        <rect x="9" y="9" width="7" height="7" rx="1" />
        <rect x="24" y="9" width="7" height="7" rx="1" />
        <rect x="9" y="24" width="7" height="7" rx="1" />
        <rect x="24" y="24" width="3" height="3" />
        <rect x="28" y="28" width="3" height="3" />
      </g>
      {kind === "badge" && <rect x="9" y="39" width="22" height="7" rx="3.5" fill="currentColor" />}
      {kind !== "none" && kind !== "badge" && <rect x="12" y={kind === "frame" ? 40 : 39} width="16" height="2.4" rx="1.2" fill="var(--surface-strong)" />}
    </svg>
  );
}

const OPTIONS: { value: FrameStyle; label: string }[] = [
  { value: "none", label: "Tanpa" },
  { value: "banner", label: "Pita" },
  { value: "frame", label: "Bingkai" },
  { value: "badge", label: "Lencana" },
];

interface Props {
  frame: FrameState;
  style: StyleState;
  onChange: (patch: Partial<FrameState>) => void;
}

export default function FramePanel({ frame, style, onChange }: Props) {
  const off = frame.style === "none";
  return (
    <div className={g.panelBody}>
      <Section title="Gaya bingkai" icon="frame">
        <ChoiceGroup
          legend="Gaya bingkai"
          hideLegend
          columns={4}
          value={frame.style}
          onChange={(v) => onChange({ style: v })}
          options={OPTIONS.map((o) => ({ ...o, visual: <FrameVisual kind={o.value} /> }))}
        />
      </Section>

      <Section title="Label" icon="text">
        <fieldset className={g.fieldset} disabled={off}>
          <Field label="Teks ajakan" icon="text" maxLength={32} value={frame.text} onChange={(text) => onChange({ text })} placeholder="Pindai Aku" />
          <div className={g.chips} role="group" aria-label="Saran teks">
            {FRAME_TEXT_SUGGESTIONS.map((t) => (
              <button key={t} type="button" className={g.chip} data-active={frame.text === t ? "" : undefined} onClick={() => onChange({ text: t })}>
                {t}
              </button>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section
        title="Warna bingkai"
        icon="palette"
        aside={
          <button
            type="button"
            className={g.linkBtn}
            disabled={off}
            onClick={() => {
              const color = style.customEyeColor ? style.eyeColor : style.fg;
              onChange({ color, textColor: readableOn(color) });
            }}
          >
            Samakan dengan QR
          </button>
        }
      >
        <fieldset className={g.fieldset} disabled={off}>
          <div className={g.row2}>
            <ColorField label="Bingkai" value={frame.color} onChange={(color) => onChange({ color })} />
            <ColorField label="Teks" value={frame.textColor} onChange={(textColor) => onChange({ textColor })} />
          </div>
        </fieldset>
        {off && <p className={g.note}>Pilih gaya bingkai untuk menambahkan label ajakan di bawah kode.</p>}
      </Section>
    </div>
  );
}
