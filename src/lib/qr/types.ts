export type DataType =
  | "url"
  | "text"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "vcard"
  | "location";

export type EcLevel = "L" | "M" | "Q" | "H";

export type DotStyle = "square" | "rounded" | "dots" | "diamond" | "leaf" | "fluid";
export type EyeFrameStyle = "square" | "rounded" | "circle" | "leaf";
export type EyeBallStyle = "square" | "rounded" | "circle" | "leaf" | "diamond";
export type GradientType = "none" | "linear" | "radial";
export type LogoShape = "square" | "rounded" | "circle";
export type FrameStyle = "none" | "banner" | "frame" | "badge";

export interface ContentState {
  type: DataType;
  url: string;
  text: string;
  wifi: { ssid: string; password: string; encryption: "WPA" | "WEP" | "nopass"; hidden: boolean };
  email: { to: string; subject: string; body: string };
  phone: { number: string };
  sms: { number: string; message: string };
  whatsapp: { number: string; message: string };
  vcard: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    org: string;
    title: string;
    website: string;
  };
  location: { lat: string; lng: string };
}

export interface StyleState {
  dotStyle: DotStyle;
  eyeFrame: EyeFrameStyle;
  eyeBall: EyeBallStyle;
  fg: string;
  bg: string;
  eyeColor: string;
  customEyeColor: boolean;
  gradient: GradientType;
  gradientColor: string;
  gradientAngle: number;
  transparent: boolean;
  /** Quiet zone, in modules. */
  margin: number;
  /** Corner radius of the background, as a fraction of the QR area (0–0.12). */
  bgRadius: number;
  ecLevel: EcLevel;
}

export interface LogoState {
  /** Uploaded image as a data URL, already downscaled. */
  src: string | null;
  /** Built-in icon name; takes precedence over `src` and follows the QR colour. */
  icon: string | null;
  width: number;
  height: number;
  /** Fraction of the QR area (0.1–0.3). */
  size: number;
  /** Padding around the logo, in modules. */
  padding: number;
  shape: LogoShape;
  background: boolean;
}

export interface FrameState {
  style: FrameStyle;
  text: string;
  color: string;
  textColor: string;
}

export interface QRConfig {
  content: ContentState;
  style: StyleState;
  logo: LogoState;
  frame: FrameState;
}
