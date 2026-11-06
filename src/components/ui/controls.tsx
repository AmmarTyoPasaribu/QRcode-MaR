"use client";

import { useId, useState, type ReactNode } from "react";
import { normalizeHex } from "@/lib/color";
import type { IconName } from "@/lib/iconPaths";
import Icon from "./Icon";
import s from "./controls.module.css";

// ---------- Field ----------

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: IconName;
  type?: "text" | "url" | "email" | "tel" | "password";
  placeholder?: string;
  hint?: ReactNode;
  autoComplete?: string;
  inputMode?: "text" | "url" | "email" | "tel" | "decimal" | "numeric";
  maxLength?: number;
  action?: ReactNode;
  required?: boolean;
}

export function Field({ label, value, onChange, icon, type = "text", hint, action, required, ...rest }: FieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
        {required && <span className={s.req} aria-hidden="true">*</span>}
      </label>
      <div className={s.inputWrap}>
        {icon && <Icon name={icon} size={17} className={s.inputIcon} />}
        <input
          id={id}
          className={s.input}
          data-has-icon={icon ? "" : undefined}
          type={isPassword && reveal ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={s.inputAction}
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={reveal}
          >
            <Icon name={reveal ? "eyeOff" : "eye"} size={17} />
          </button>
        )}
        {action}
      </div>
      {hint && (
        <p id={`${id}-hint`} className={s.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      <textarea
        id={id}
        className={`${s.input} ${s.textarea}`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && (
        <p id={`${id}-hint`} className={s.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ---------- Section ----------

export function Section({ title, icon, children, aside }: { title: string; icon?: IconName; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className={s.section}>
      <header className={s.sectionHead}>
        <h3 className={s.sectionTitle}>
          {icon && <Icon name={icon} size={16} />}
          {title}
        </h3>
        {aside}
      </header>
      {children}
    </section>
  );
}

// ---------- Choice (radio cards) ----------

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  visual?: ReactNode;
  description?: string;
}

export function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  columns = 4,
  size = "md",
  hideLegend,
}: {
  legend: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
  size?: "sm" | "md" | "lg";
  hideLegend?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className={s.choiceSet}>
      <legend className={hideLegend ? "sr-only" : s.label}>{legend}</legend>
      <div className={s.choiceGrid} style={{ ["--cols" as string]: columns }} data-size={size}>
        {options.map((o) => (
          <label key={o.value} className={s.choice} title={o.description ?? o.label}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className={s.choiceInput}
            />
            <span className={s.choiceBody}>
              {o.visual && <span className={s.choiceVisual}>{o.visual}</span>}
              <span className={s.choiceLabel}>{o.label}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ---------- Segmented ----------

export function Segmented<T extends string>({
  legend,
  options,
  value,
  onChange,
  hideLegend,
}: {
  legend: string;
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  hideLegend?: boolean;
}) {
  const name = useId();
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <fieldset className={s.choiceSet}>
      <legend className={hideLegend ? "sr-only" : s.label}>{legend}</legend>
      <div className={s.segmented} style={{ ["--n" as string]: options.length, ["--i" as string]: idx }}>
        <span className={s.segThumb} aria-hidden="true" />
        {options.map((o) => (
          <label key={o.value} className={s.segItem} title={o.title}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className={s.choiceInput}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// ---------- Slider ----------

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: ReactNode;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={s.field}>
      <div className={s.sliderHead}>
        <label htmlFor={id} className={s.label}>
          {label}
        </label>
        <output htmlFor={id} className={s.sliderValue}>
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={s.range}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--pct" as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
      />
      {hint && <p className={s.hint}>{hint}</p>}
    </div>
  );
}

// ---------- Switch ----------

export function Switch({
  label,
  checked,
  onChange,
  description,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label className={s.switchRow} htmlFor={id} data-disabled={disabled ? "" : undefined}>
      <span className={s.switchText}>
        <span className={s.switchLabel}>{label}</span>
        {description && <span className={s.hint}>{description}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={s.switchInput}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={s.switchTrack} aria-hidden="true">
        <span className={s.switchThumb} />
      </span>
    </label>
  );
}

// ---------- Color ----------

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  // Draft text only while the user is typing; otherwise mirror the prop.
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className={s.field}>
      <label htmlFor={`${id}-hex`} className={s.label}>
        {label}
      </label>
      <div className={s.color}>
        <span className={s.swatch} style={{ background: value }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`Pilih ${label.toLowerCase()}`}
          />
        </span>
        <input
          id={`${id}-hex`}
          className={s.hex}
          value={draft ?? value.toUpperCase()}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          onFocus={() => setDraft(value.toUpperCase())}
          onChange={(e) => {
            setDraft(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex) onChange(hex);
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
    </div>
  );
}
