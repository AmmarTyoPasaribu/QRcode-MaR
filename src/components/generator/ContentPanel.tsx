"use client";

import { useState } from "react";
import { ChoiceGroup, Field, Section, Segmented, Switch, TextArea } from "@/components/ui/controls";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import type { IconName } from "@/lib/iconPaths";
import { byteLength, MAX_BYTES } from "@/lib/qr/encode";
import { DATA_TYPE_LABEL, type PayloadResult } from "@/lib/qr/payload";
import type { ContentState, DataType, EcLevel } from "@/lib/qr/types";
import g from "./generator.module.css";

const TYPE_ICON: Record<DataType, IconName> = {
  url: "link",
  text: "text",
  wifi: "wifi",
  email: "mail",
  phone: "phone",
  sms: "sms",
  whatsapp: "whatsapp",
  vcard: "vcard",
  location: "location",
};

const TYPES = (Object.keys(DATA_TYPE_LABEL) as DataType[]).map((t) => ({
  value: t,
  label: DATA_TYPE_LABEL[t],
  visual: <Icon name={TYPE_ICON[t]} size={20} />,
}));

type Nested = Exclude<keyof ContentState, "type" | "url" | "text">;

interface Props {
  content: ContentState;
  onChange: (next: ContentState) => void;
  payload: PayloadResult;
  ecLevel: EcLevel;
}

export default function ContentPanel({ content: c, onChange, payload, ecLevel }: Props) {
  const toast = useToast();
  const [locating, setLocating] = useState(false);
  const set = <K extends Nested>(key: K, patch: Partial<ContentState[K]>) =>
    onChange({ ...c, [key]: { ...c[key], ...patch } });

  const used = payload.data ? byteLength(payload.data) : 0;
  const cap = MAX_BYTES[ecLevel];

  const locate = () => {
    if (!("geolocation" in navigator)) {
      toast("Browser ini tidak mendukung lokasi.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        set("location", { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        toast("Lokasi saat ini dipakai.");
      },
      () => {
        setLocating(false);
        toast("Tidak bisa membaca lokasi. Periksa izin lokasi di browser.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className={g.panelBody}>
      <Section title="Jenis konten" icon="sparkles">
        <ChoiceGroup
          legend="Jenis konten"
          hideLegend
          options={TYPES}
          value={c.type}
          onChange={(type) => onChange({ ...c, type })}
          columns={3}
          size="lg"
        />
      </Section>

      <Section
        title={`Isi ${DATA_TYPE_LABEL[c.type].toLowerCase()}`}
        icon={TYPE_ICON[c.type]}
        aside={
          used > 0 ? (
            <span className={g.counter} data-warn={used > cap * 0.8 ? "" : undefined} title="Ukuran data dibanding kapasitas maksimum">
              {used.toLocaleString("id-ID")} / {cap.toLocaleString("id-ID")} byte
            </span>
          ) : null
        }
      >
        <div className={g.formStack} key={c.type}>
          {c.type === "url" && (
            <Field
              label="Alamat tautan"
              icon="link"
              type="url"
              inputMode="url"
              placeholder="https://contoh.com"
              value={c.url}
              onChange={(url) => onChange({ ...c, url })}
              autoComplete="url"
            />
          )}

          {c.type === "text" && (
            <TextArea label="Teks" placeholder="Tulis pesan, kode promo, catatan…" value={c.text} onChange={(text) => onChange({ ...c, text })} rows={5} />
          )}

          {c.type === "wifi" && (
            <>
              <Field label="Nama jaringan (SSID)" icon="wifi" placeholder="Rumah_5G" value={c.wifi.ssid} onChange={(ssid) => set("wifi", { ssid })} required />
              <Segmented
                legend="Keamanan"
                value={c.wifi.encryption}
                onChange={(encryption) => set("wifi", { encryption })}
                options={[
                  { value: "WPA", label: "WPA/WPA2/WPA3" },
                  { value: "WEP", label: "WEP" },
                  { value: "nopass", label: "Terbuka" },
                ]}
              />
              {c.wifi.encryption !== "nopass" && (
                <Field
                  label="Kata sandi"
                  icon="lock"
                  type="password"
                  placeholder="Kata sandi WiFi"
                  value={c.wifi.password}
                  onChange={(password) => set("wifi", { password })}
                  autoComplete="off"
                />
              )}
              <Switch label="Jaringan tersembunyi" description="Aktifkan jika SSID tidak disiarkan." checked={c.wifi.hidden} onChange={(hidden) => set("wifi", { hidden })} />
            </>
          )}

          {c.type === "email" && (
            <>
              <Field label="Alamat email" icon="mail" type="email" inputMode="email" placeholder="halo@contoh.com" value={c.email.to} onChange={(to) => set("email", { to })} required />
              <Field label="Subjek" icon="text" placeholder="Opsional" value={c.email.subject} onChange={(subject) => set("email", { subject })} />
              <TextArea label="Isi pesan" placeholder="Opsional" value={c.email.body} onChange={(body) => set("email", { body })} rows={3} />
            </>
          )}

          {c.type === "phone" && (
            <Field label="Nomor telepon" icon="phone" type="tel" inputMode="tel" placeholder="+62 812 3456 7890" value={c.phone.number} onChange={(number) => set("phone", { number })} autoComplete="tel" />
          )}

          {c.type === "sms" && (
            <>
              <Field label="Nomor tujuan" icon="phone" type="tel" inputMode="tel" placeholder="+62 812 3456 7890" value={c.sms.number} onChange={(number) => set("sms", { number })} required />
              <TextArea label="Pesan" placeholder="Opsional" value={c.sms.message} onChange={(message) => set("sms", { message })} rows={3} />
            </>
          )}

          {c.type === "whatsapp" && (
            <>
              <Field
                label="Nomor WhatsApp"
                icon="whatsapp"
                type="tel"
                inputMode="tel"
                placeholder="0812 3456 7890"
                value={c.whatsapp.number}
                onChange={(number) => set("whatsapp", { number })}
                hint="Awalan 0 otomatis diubah ke kode negara Indonesia (62)."
                required
              />
              <TextArea label="Pesan pembuka" placeholder="Halo, saya tertarik dengan…" value={c.whatsapp.message} onChange={(message) => set("whatsapp", { message })} rows={3} />
            </>
          )}

          {c.type === "vcard" && (
            <>
              <div className={g.row2}>
                <Field label="Nama depan" icon="user" value={c.vcard.firstName} onChange={(firstName) => set("vcard", { firstName })} autoComplete="given-name" required />
                <Field label="Nama belakang" value={c.vcard.lastName} onChange={(lastName) => set("vcard", { lastName })} autoComplete="family-name" />
              </div>
              <div className={g.row2}>
                <Field label="Telepon" icon="phone" type="tel" inputMode="tel" value={c.vcard.phone} onChange={(phone) => set("vcard", { phone })} autoComplete="tel" />
                <Field label="Email" icon="mail" type="email" inputMode="email" value={c.vcard.email} onChange={(email) => set("vcard", { email })} autoComplete="email" />
              </div>
              <div className={g.row2}>
                <Field label="Organisasi" icon="building" value={c.vcard.org} onChange={(org) => set("vcard", { org })} autoComplete="organization" />
                <Field label="Jabatan" value={c.vcard.title} onChange={(title) => set("vcard", { title })} autoComplete="organization-title" />
              </div>
              <Field label="Situs web" icon="globe" type="url" inputMode="url" placeholder="contoh.com" value={c.vcard.website} onChange={(website) => set("vcard", { website })} />
            </>
          )}

          {c.type === "location" && (
            <>
              <div className={g.row2}>
                <Field label="Latitude" icon="location" inputMode="decimal" placeholder="-6.200000" value={c.location.lat} onChange={(lat) => set("location", { lat })} />
                <Field label="Longitude" inputMode="decimal" placeholder="106.816666" value={c.location.lng} onChange={(lng) => set("location", { lng })} />
              </div>
              <button type="button" className="btn btn-soft" onClick={locate} disabled={locating}>
                <Icon name="locate" size={17} className={locating ? g.spin : undefined} />
                {locating ? "Mencari lokasi…" : "Pakai lokasi saya sekarang"}
              </button>
              <p className={g.note}>Kode akan membuka Google Maps pada titik ini — berfungsi di Android maupun iPhone.</p>
            </>
          )}
        </div>

        {payload.error && (
          <p className={g.inlineMsg} data-tone="error" role="alert">
            <Icon name="alert" size={15} /> {payload.error}
          </p>
        )}
        {!payload.error && payload.hint && (
          <p className={g.inlineMsg} data-tone="info">
            <Icon name="info" size={15} /> {payload.hint}
          </p>
        )}
      </Section>
    </div>
  );
}
