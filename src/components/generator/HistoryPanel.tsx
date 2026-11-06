"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { DATA_TYPE_LABEL } from "@/lib/qr/payload";
import type { HistoryItem } from "@/lib/storage";
import g from "./generator.module.css";

const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });

function timeAgo(ts: number, now: number): string {
  const sec = Math.round((ts - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 45) return "baru saja";
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(sec / 86400), "day");
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export default function HistoryPanel({ items, onRestore, onDelete, onClear }: Props) {
  const [confirming, setConfirming] = useState(false);
  // Captured once per render pass; good enough for "x minutes ago".
  const [now] = useState(() => Date.now());

  return (
    <section id="riwayat" className={g.history} aria-labelledby="history-title">
      <header className={g.historyHead}>
        <div>
          <h2 id="history-title" className={g.panelTitle}>
            <Icon name="clock" size={18} /> Riwayat
            {items.length > 0 && <span className={g.countPill}>{items.length}</span>}
          </h2>
          <p className={g.note}>Tersimpan otomatis saat kamu mengunduh, menyalin, atau membagikan. Hanya di perangkat ini.</p>
        </div>
        {items.length > 0 &&
          (confirming ? (
            <div className={g.confirm}>
              <span>Hapus semua?</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
              >
                Ya, hapus
              </button>
              <button type="button" className="btn btn-soft" onClick={() => setConfirming(false)}>
                Batal
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
              <Icon name="trash" size={16} /> Bersihkan
            </button>
          ))}
      </header>

      {items.length === 0 ? (
        <div className={g.historyEmpty}>
          <span className={g.overlayIcon}>
            <Icon name="leaf" size={22} />
          </span>
          <p>Belum ada riwayat. Kode yang kamu unduh akan muncul di sini, lengkap dengan desainnya.</p>
        </div>
      ) : (
        <ul className={g.historyGrid}>
          {items.map((item, i) => (
            <li key={item.id} className={g.historyItem} style={{ animationDelay: `${i * 40}ms` }}>
              <button type="button" className={g.historyMain} onClick={() => onRestore(item)} title="Pakai lagi desain ini">
                <span className={g.historyThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL thumbnail */}
                  <img src={item.thumb} alt="" width={84} height={84} />
                </span>
                <span className={g.historyText}>
                  <span className={g.historyType}>{DATA_TYPE_LABEL[item.config.content.type]}</span>
                  <span className={g.historyLabel}>{item.label || "Tanpa judul"}</span>
                  <span className={g.historyTime}>{timeAgo(item.createdAt, now)}</span>
                </span>
              </button>
              <button type="button" className={`icon-btn ${g.historyDelete}`} onClick={() => onDelete(item.id)} aria-label={`Hapus ${item.label} dari riwayat`}>
                <Icon name="x" size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
