import type { EyeBallStyle, EyeFrameStyle, FrameState, LogoState, QRConfig, StyleState } from "./qr/types";

/**
 * Finder-eye pairs. Scanners check the 1:1:3:1:1 finder ratio along the
 * diagonals too, so a square frame needs a square ball and a round frame a
 * round ball — mixing them failed scan tests with stylised dots.
 */
export const EYE_STYLES: { id: string; label: string; frame: EyeFrameStyle; ball: EyeBallStyle }[] = [
  { id: "kotak", label: "Kotak", frame: "square", ball: "square" },
  { id: "membulat", label: "Membulat", frame: "rounded", ball: "rounded" },
  { id: "bantal", label: "Bantal", frame: "rounded", ball: "circle" },
  { id: "lingkaran", label: "Lingkaran", frame: "circle", ball: "circle" },
  { id: "daun", label: "Daun", frame: "leaf", ball: "leaf" },
  { id: "tunas", label: "Tunas", frame: "rounded", ball: "leaf" },
];

/** Map any frame/ball pair (e.g. from older saved designs) onto a safe pair. */
export function normalizeEyes(frame: EyeFrameStyle, ball: EyeBallStyle): { eyeFrame: EyeFrameStyle; eyeBall: EyeBallStyle } {
  const exact = EYE_STYLES.find((e) => e.frame === frame && e.ball === ball);
  if (exact) return { eyeFrame: exact.frame, eyeBall: exact.ball };
  const byFrame = EYE_STYLES.find((e) => e.frame === frame) ?? EYE_STYLES[0];
  return { eyeFrame: byFrame.frame, eyeBall: byFrame.ball };
}

export interface ThemePreset {
  id: string;
  name: string;
  note: string;
  style: Pick<
    StyleState,
    | "fg"
    | "bg"
    | "gradient"
    | "gradientColor"
    | "gradientAngle"
    | "customEyeColor"
    | "eyeColor"
    | "dotStyle"
    | "eyeFrame"
    | "eyeBall"
  >;
  frameColor: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "pinus",
    name: "Hutan Pinus",
    note: "Hijau tua yang teduh",
    style: {
      fg: "#1f4d36",
      bg: "#f5f8f1",
      gradient: "linear",
      gradientColor: "#0d2a1c",
      gradientAngle: 135,
      customEyeColor: true,
      eyeColor: "#2f6b47",
      dotStyle: "rounded",
      eyeFrame: "rounded",
      eyeBall: "rounded",
    },
    frameColor: "#1f4d36",
  },
  {
    id: "klasik",
    name: "Klasik",
    note: "Paling mudah dipindai",
    style: {
      fg: "#111111",
      bg: "#ffffff",
      gradient: "none",
      gradientColor: "#111111",
      gradientAngle: 0,
      customEyeColor: false,
      eyeColor: "#111111",
      dotStyle: "square",
      eyeFrame: "square",
      eyeBall: "square",
    },
    frameColor: "#111111",
  },
  {
    id: "lumut",
    name: "Lumut",
    note: "Titik bulat bertekstur",
    style: {
      fg: "#4a7436",
      bg: "#f3f6e6",
      gradient: "radial",
      gradientColor: "#243d1b",
      gradientAngle: 0,
      customEyeColor: true,
      eyeColor: "#2c4a21",
      dotStyle: "dots",
      eyeFrame: "circle",
      eyeBall: "circle",
    },
    frameColor: "#2c4a21",
  },
  {
    id: "fajar",
    name: "Gunung Fajar",
    note: "Biru lembah ke jingga",
    style: {
      fg: "#24365c",
      bg: "#fdf7ef",
      gradient: "linear",
      gradientColor: "#b4492a",
      gradientAngle: 90,
      customEyeColor: true,
      eyeColor: "#24365c",
      dotStyle: "diamond",
      eyeFrame: "rounded",
      eyeBall: "leaf",
    },
    frameColor: "#24365c",
  },
  {
    id: "danau",
    name: "Danau",
    note: "Biru kehijauan yang tenang",
    style: {
      fg: "#0e5a6b",
      bg: "#eef7f7",
      gradient: "linear",
      gradientColor: "#123651",
      gradientAngle: 45,
      customEyeColor: false,
      eyeColor: "#0e5a6b",
      dotStyle: "fluid",
      eyeFrame: "rounded",
      eyeBall: "circle",
    },
    frameColor: "#123651",
  },
  {
    id: "senja",
    name: "Senja",
    note: "Merah bata & matahari terbenam",
    style: {
      fg: "#6e2738",
      bg: "#fff6ec",
      gradient: "linear",
      gradientColor: "#b2541f",
      gradientAngle: 160,
      customEyeColor: false,
      eyeColor: "#6e2738",
      dotStyle: "leaf",
      eyeFrame: "leaf",
      eyeBall: "leaf",
    },
    frameColor: "#6e2738",
  },
  {
    id: "tanah",
    name: "Tanah Liat",
    note: "Cokelat hangat",
    style: {
      fg: "#553522",
      bg: "#f7efe3",
      gradient: "none",
      gradientColor: "#553522",
      gradientAngle: 0,
      customEyeColor: true,
      eyeColor: "#8a4f2a",
      dotStyle: "square",
      eyeFrame: "rounded",
      eyeBall: "rounded",
    },
    frameColor: "#553522",
  },
  {
    id: "kunang",
    name: "Kunang-kunang",
    note: "Terang di malam hutan",
    style: {
      fg: "#d8f07a",
      bg: "#0e2118",
      gradient: "radial",
      gradientColor: "#8fd16a",
      gradientAngle: 0,
      customEyeColor: true,
      eyeColor: "#f1f8b8",
      dotStyle: "fluid",
      eyeFrame: "circle",
      eyeBall: "circle",
    },
    frameColor: "#d8f07a",
  },
];

export function presetMatches(p: ThemePreset, s: StyleState): boolean {
  return (Object.keys(p.style) as (keyof ThemePreset["style"])[]).every(
    (k) => (p.style[k] as unknown) === (s[k] as unknown),
  );
}

const pinus = THEME_PRESETS[0];

export const DEFAULT_STYLE: StyleState = {
  ...pinus.style,
  transparent: false,
  margin: 3,
  bgRadius: 0.04,
  ecLevel: "M",
};

export const DEFAULT_LOGO: LogoState = {
  src: null,
  icon: null,
  width: 1,
  height: 1,
  size: 0.22,
  padding: 0.6,
  shape: "rounded",
  background: true,
};

export const DEFAULT_FRAME: FrameState = {
  style: "none",
  text: "Pindai Aku",
  color: pinus.frameColor,
  textColor: "#ffffff",
};

export const DEFAULT_CONFIG: QRConfig = {
  content: {
    type: "url",
    url: "",
    text: "",
    wifi: { ssid: "", password: "", encryption: "WPA", hidden: false },
    email: { to: "", subject: "", body: "" },
    phone: { number: "" },
    sms: { number: "", message: "" },
    whatsapp: { number: "", message: "" },
    vcard: { firstName: "", lastName: "", phone: "", email: "", org: "", title: "", website: "" },
    location: { lat: "", lng: "" },
  },
  style: DEFAULT_STYLE,
  logo: DEFAULT_LOGO,
  frame: DEFAULT_FRAME,
};

export const FRAME_TEXT_SUGGESTIONS = ["Pindai Aku", "Scan Me", "Sambung WiFi", "Lihat Menu", "Ikuti Kami", "Simpan Kontak"];
