import { DEFAULT_CONFIG, normalizeEyes } from "./presets";
import type { QRConfig } from "./qr/types";

const STATE_KEY = "qrmar:v2:design";
const HISTORY_KEY = "qrmar:v2:history";
export const MAX_HISTORY = 12;
/** Logos larger than this are not stored in history to stay within the ~5 MB quota. */
const MAX_STORED_LOGO = 160_000;

export interface HistoryItem {
  id: string;
  createdAt: number;
  label: string;
  thumb: string;
  config: QRConfig;
}

function safeGet(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Merge a stored (possibly older/partial) config over the defaults. */
export function hydrateConfig(raw: unknown): QRConfig {
  const r = (raw ?? {}) as Partial<QRConfig>;
  const d = DEFAULT_CONFIG;
  const c = (r.content ?? {}) as Partial<QRConfig["content"]>;
  const style = { ...d.style, ...(r.style ?? {}) };
  return {
    content: {
      ...d.content,
      ...c,
      wifi: { ...d.content.wifi, ...(c.wifi ?? {}) },
      email: { ...d.content.email, ...(c.email ?? {}) },
      phone: { ...d.content.phone, ...(c.phone ?? {}) },
      sms: { ...d.content.sms, ...(c.sms ?? {}) },
      whatsapp: { ...d.content.whatsapp, ...(c.whatsapp ?? {}) },
      vcard: { ...d.content.vcard, ...(c.vcard ?? {}) },
      location: { ...d.content.location, ...(c.location ?? {}) },
    },
    style: { ...style, ...normalizeEyes(style.eyeFrame, style.eyeBall) },
    logo: { ...d.logo, ...(r.logo ?? {}) },
    frame: { ...d.frame, ...(r.frame ?? {}) },
  };
}

function trimLogo(config: QRConfig): QRConfig {
  if (config.logo.src && config.logo.src.length > MAX_STORED_LOGO) {
    return { ...config, logo: { ...config.logo, src: null } };
  }
  return config;
}

export function loadDesign(): QRConfig | null {
  const raw = safeGet(STATE_KEY);
  return raw ? hydrateConfig(raw) : null;
}

export function saveDesign(config: QRConfig): void {
  if (!safeSet(STATE_KEY, config)) safeSet(STATE_KEY, trimLogo(config));
}

export function clearDesign(): void {
  try {
    window.localStorage.removeItem(STATE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadHistory(): HistoryItem[] {
  const raw = safeGet(HISTORY_KEY);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i): i is HistoryItem => !!i && typeof i === "object" && "id" in i && "config" in i)
    .map((i) => ({ ...i, config: hydrateConfig(i.config) }));
}

export function saveHistory(items: HistoryItem[]): HistoryItem[] {
  let list = items.slice(0, MAX_HISTORY).map((i) => ({ ...i, config: trimLogo(i.config) }));
  // If we hit the quota, drop the oldest entries until it fits.
  while (list.length && !safeSet(HISTORY_KEY, list)) list = list.slice(0, -1);
  return list;
}
