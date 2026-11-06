import type { ContentState, DataType } from "./types";

export interface PayloadResult {
  /** The string encoded into the QR code. Empty when the form is incomplete. */
  data: string;
  /** Blocking problem — nothing is rendered. */
  error?: string;
  /** Non-blocking note shown under the form (e.g. we added https://). */
  hint?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Escape special characters for the `WIFI:` scheme (\ ; , : "). */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/** Escape a vCard 3.0 property value. */
export function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/([,;])/g, "\\$1");
}

export function cleanPhone(value: string): string {
  const trimmed = value.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

/** wa.me needs digits only with a country code. Indonesian `08…` becomes `628…`. */
export function toWhatsAppNumber(value: string): string {
  let digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  return digits;
}

function normalizeUrl(raw: string): { url: string; hint?: string } {
  const value = raw.trim();
  if (!value) return { url: "" };
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return { url: value };
  if (/^[^\s]+\.[^\s]{2,}/.test(value)) {
    return { url: "https://" + value, hint: "Ditambahkan https:// agar tautan bisa dibuka." };
  }
  return { url: value, hint: "Ini tidak terlihat seperti tautan — akan dikodekan sebagai teks biasa." };
}

export function buildPayload(c: ContentState): PayloadResult {
  switch (c.type) {
    case "url": {
      const { url, hint } = normalizeUrl(c.url);
      return { data: url, hint };
    }
    case "text":
      return { data: c.text };
    case "wifi": {
      const { ssid, password, encryption, hidden } = c.wifi;
      if (!ssid.trim()) return { data: "" };
      if (encryption !== "nopass" && !password) {
        return { data: "", error: "Masukkan kata sandi, atau pilih jaringan Terbuka." };
      }
      if (encryption === "WPA" && password.length > 0 && password.length < 8) {
        return {
          data: buildWifi(ssid, password, encryption, hidden),
          hint: "Kata sandi WPA biasanya minimal 8 karakter — pastikan sudah benar.",
        };
      }
      return { data: buildWifi(ssid, password, encryption, hidden) };
    }
    case "email": {
      const to = c.email.to.trim();
      if (!to) return { data: "" };
      if (!EMAIL_RE.test(to)) return { data: "", error: "Format alamat email belum benar." };
      const params = new URLSearchParams();
      if (c.email.subject.trim()) params.set("subject", c.email.subject.trim());
      if (c.email.body.trim()) params.set("body", c.email.body.trim());
      // URLSearchParams encodes spaces as "+", which mail clients show literally.
      const query = params.toString().replace(/\+/g, "%20");
      return { data: `mailto:${to}${query ? "?" + query : ""}` };
    }
    case "phone": {
      const num = cleanPhone(c.phone.number);
      if (!num) return { data: "" };
      if (num.replace("+", "").length < 4) return { data: "", error: "Nomor telepon terlalu pendek." };
      return { data: `tel:${num}` };
    }
    case "sms": {
      const num = cleanPhone(c.sms.number);
      if (!num) return { data: "" };
      return { data: `SMSTO:${num}:${c.sms.message}` };
    }
    case "whatsapp": {
      const num = toWhatsAppNumber(c.whatsapp.number);
      if (!num) return { data: "" };
      if (num.length < 8) return { data: "", error: "Nomor WhatsApp terlalu pendek." };
      const text = c.whatsapp.message.trim();
      const hint = c.whatsapp.number.trim().startsWith("0")
        ? `Nomor diubah ke format internasional: +${num}`
        : undefined;
      return { data: `https://wa.me/${num}${text ? "?text=" + encodeURIComponent(text) : ""}`, hint };
    }
    case "vcard": {
      const v = c.vcard;
      const first = v.firstName.trim();
      const last = v.lastName.trim();
      if (!first && !last) return { data: "" };
      if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) {
        return { data: "", error: "Format email kontak belum benar." };
      }
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVcard(last)};${escapeVcard(first)};;;`,
        `FN:${escapeVcard([first, last].filter(Boolean).join(" "))}`,
      ];
      if (v.org.trim()) lines.push(`ORG:${escapeVcard(v.org.trim())}`);
      if (v.title.trim()) lines.push(`TITLE:${escapeVcard(v.title.trim())}`);
      if (v.phone.trim()) lines.push(`TEL;TYPE=CELL:${cleanPhone(v.phone)}`);
      if (v.email.trim()) lines.push(`EMAIL:${v.email.trim()}`);
      if (v.website.trim()) lines.push(`URL:${normalizeUrl(v.website).url}`);
      lines.push("END:VCARD");
      return { data: lines.join("\n") };
    }
    case "location": {
      const latStr = c.location.lat.trim().replace(",", ".");
      const lngStr = c.location.lng.trim().replace(",", ".");
      if (!latStr || !lngStr) return { data: "" };
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return { data: "", error: "Latitude harus di antara -90 dan 90." };
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        return { data: "", error: "Longitude harus di antara -180 dan 180." };
      }
      return { data: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` };
    }
  }
}

function buildWifi(ssid: string, password: string, enc: string, hidden: boolean): string {
  const parts = [`WIFI:T:${enc}`, `S:${escapeWifi(ssid)}`];
  if (enc !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  if (hidden) parts.push("H:true");
  return parts.join(";") + ";;";
}

/** Short human label for history cards and file names. */
export function describeContent(c: ContentState): string {
  switch (c.type) {
    case "url":
      return c.url.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    case "text":
      return c.text.trim().split("\n")[0];
    case "wifi":
      return c.wifi.ssid;
    case "email":
      return c.email.to;
    case "phone":
      return c.phone.number;
    case "sms":
      return c.sms.number;
    case "whatsapp":
      return c.whatsapp.number;
    case "vcard":
      return [c.vcard.firstName, c.vcard.lastName].filter(Boolean).join(" ");
    case "location":
      return `${c.location.lat}, ${c.location.lng}`;
  }
}

export const DATA_TYPE_LABEL: Record<DataType, string> = {
  url: "Tautan",
  text: "Teks",
  wifi: "WiFi",
  email: "Email",
  phone: "Telepon",
  sms: "SMS",
  whatsapp: "WhatsApp",
  vcard: "Kontak",
  location: "Lokasi",
};
