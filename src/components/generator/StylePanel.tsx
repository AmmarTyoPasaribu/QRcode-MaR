"use client";

import { useMemo } from "react";
import { ChoiceGroup, ColorField, Section, Segmented, Slider, Switch } from "@/components/ui/controls";
import Icon from "@/components/ui/Icon";
import { DEFAULT_FRAME, DEFAULT_LOGO, DEFAULT_STYLE, EYE_STYLES, presetMatches, THEME_PRESETS, type ThemePreset } from "@/lib/presets";
import { encode } from "@/lib/qr/encode";
import { sceneToSvg } from "@/lib/qr/render";
import { buildScene, dotPreviewPath, eyePreviewPaths } from "@/lib/qr/scene";
import type { DotStyle, EcLevel, StyleState } from "@/lib/qr/types";
import g from "./generator.module.css";

const DOTS: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Kotak" },
  { value: "rounded", label: "Membulat" },
  { value: "dots", label: "Titik" },
  { value: "fluid", label: "Cair" },
  { value: "leaf", label: "Daun" },
  { value: "diamond", label: "Berlian" },
];
const EC: { value: EcLevel; label: string; title: string }[] = [
  { value: "L", label: "L · 7%", title: "Kode paling kecil" },
  { value: "M", label: "M · 15%", title: "Seimbang — pilihan umum" },
  { value: "Q", label: "Q · 25%", title: "Lebih tahan rusak" },
  { value: "H", label: "H · 30%", title: "Paling tahan — wajib untuk logo" },
];

function MiniPreset({ preset }: { preset: ThemePreset }) {
  const svg = useMemo(() => {
    const enc = encode("MaR", "L");
    if (!enc.ok) return "";
    const scene = buildScene({
      matrix: enc.matrix,
      style: { ...DEFAULT_STYLE, ...preset.style, margin: 1.5, bgRadius: 0.1, transparent: false },
      logo: DEFAULT_LOGO,
      frame: { ...DEFAULT_FRAME, style: "none" },
    });
    return sceneToSvg(scene, { idPrefix: `preset-${preset.id}` });
  }, [preset]);
  return <span className={g.presetQr} dangerouslySetInnerHTML={{ __html: svg }} />;
}

interface Props {
  style: StyleState;
  onChange: (patch: Partial<StyleState>) => void;
  onPreset: (p: ThemePreset) => void;
  hasLogo: boolean;
}

export default function StylePanel({ style, onChange, onPreset, hasLogo }: Props) {
  const eyeColor = style.customEyeColor ? style.eyeColor : style.fg;

  return (
    <div className={g.panelBody}>
      <Section title="Tema alam" icon="leaf">
        <div className={g.presets}>
          {THEME_PRESETS.map((p) => {
            const active = presetMatches(p, style);
            return (
              <button
                key={p.id}
                type="button"
                className={g.preset}
                data-active={active ? "" : undefined}
                aria-pressed={active}
                onClick={() => onPreset(p)}
                title={p.note}
              >
                <MiniPreset preset={p} />
                <span className={g.presetName}>{p.name}</span>
                {active && (
                  <span className={g.presetCheck} aria-hidden="true">
                    <Icon name="check" size={12} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Bentuk titik" icon="qr">
        <ChoiceGroup
          legend="Bentuk titik"
          hideLegend
          columns={3}
          value={style.dotStyle}
          onChange={(dotStyle) => onChange({ dotStyle })}
          options={DOTS.map((d) => ({
            ...d,
            visual: (
              <svg viewBox="-2 -2 34 34" width="30" height="30">
                <path d={dotPreviewPath(d.value)} fill="currentColor" />
              </svg>
            ),
          }))}
        />
      </Section>

      <Section title="Bentuk mata" icon="eye">
        <ChoiceGroup
          legend="Bentuk mata"
          hideLegend
          columns={3}
          value={EYE_STYLES.find((e) => e.frame === style.eyeFrame && e.ball === style.eyeBall)?.id ?? ""}
          onChange={(id) => {
            const e = EYE_STYLES.find((x) => x.id === id);
            if (e) onChange({ eyeFrame: e.frame, eyeBall: e.ball });
          }}
          options={EYE_STYLES.map((e) => {
            const p = eyePreviewPaths(e.frame, e.ball);
            return {
              value: e.id,
              label: e.label,
              visual: (
                <svg viewBox="-4 -4 78 78" width="30" height="30">
                  <path d={p.frame} fill="currentColor" fillRule="evenodd" />
                  <path d={p.ball} fill="currentColor" />
                </svg>
              ),
            };
          })}
        />
        <p className={g.note}>Bingkai dan bola mata dipasangkan agar rasio penanda tetap mudah dikenali pemindai.</p>
      </Section>

      <Section
        title="Warna"
        icon="palette"
        aside={
          <button
            type="button"
            className={g.linkBtn}
            onClick={() => onChange({ fg: style.bg, bg: style.fg, customEyeColor: false })}
            title="Tukar warna utama dan latar"
          >
            <Icon name="reset" size={14} /> Tukar
          </button>
        }
      >
        <div className={g.row2}>
          <ColorField label="Warna utama" value={style.fg} onChange={(fg) => onChange({ fg })} />
          <ColorField label="Latar" value={style.bg} onChange={(bg) => onChange({ bg })} />
        </div>
        <Segmented
          legend="Gradien"
          value={style.gradient}
          onChange={(gradient) => onChange({ gradient })}
          options={[
            { value: "none", label: "Polos" },
            { value: "linear", label: "Linear" },
            { value: "radial", label: "Radial" },
          ]}
        />
        {style.gradient !== "none" && (
          <div className={g.row2}>
            <ColorField label="Warna gradien" value={style.gradientColor} onChange={(gradientColor) => onChange({ gradientColor })} />
            {style.gradient === "linear" ? (
              <Slider label="Arah" min={0} max={360} step={15} value={style.gradientAngle} onChange={(gradientAngle) => onChange({ gradientAngle })} format={(v) => `${v}°`} />
            ) : (
              <div />
            )}
          </div>
        )}
        <Switch
          label="Warna mata berbeda"
          description="Beri warna khusus pada tiga kotak penanda."
          checked={style.customEyeColor}
          onChange={(customEyeColor) => onChange({ customEyeColor, eyeColor })}
        />
        {style.customEyeColor && <ColorField label="Warna mata" value={style.eyeColor} onChange={(v) => onChange({ eyeColor: v })} />}
      </Section>

      <Section title="Latar & tepi" icon="frame">
        <Switch
          label="Latar transparan"
          description="Untuk ditempel di atas desain lain (PNG, WebP, SVG)."
          checked={style.transparent}
          onChange={(transparent) => onChange({ transparent })}
        />
        <div className={g.row2}>
          <Slider
            label="Margin"
            min={0}
            max={8}
            step={1}
            value={style.margin}
            onChange={(margin) => onChange({ margin })}
            format={(v) => `${v} modul`}
          />
          <Slider
            label="Sudut latar"
            min={0}
            max={12}
            step={1}
            value={Math.round(style.bgRadius * 100)}
            onChange={(v) => onChange({ bgRadius: v / 100 })}
            format={(v) => `${v}%`}
          />
        </div>
      </Section>

      <Section title="Koreksi kesalahan" icon="shield">
        <Segmented legend="Level koreksi kesalahan" hideLegend value={style.ecLevel} onChange={(ecLevel) => onChange({ ecLevel })} options={EC} />
        <p className={g.note}>
          {EC.find((e) => e.value === style.ecLevel)?.title}.{" "}
          {hasLogo && style.ecLevel !== "H" && <strong className={g.warnText}>Logo aktif — sebaiknya gunakan H.</strong>}
        </p>
      </Section>
    </div>
  );
}
