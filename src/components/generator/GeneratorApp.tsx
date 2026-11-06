"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Icon from "@/components/ui/Icon";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { contrastRatio, luminance, readableOn } from "@/lib/color";
import { jakarta } from "@/lib/fonts";
import { ICON_PATHS, iconDataUrl, type IconName } from "@/lib/iconPaths";
import { DEFAULT_CONFIG, type ThemePreset } from "@/lib/presets";
import { byteLength, encode } from "@/lib/qr/encode";
import { buildPayload, describeContent } from "@/lib/qr/payload";
import { sceneToSvg } from "@/lib/qr/render";
import { buildScene, type Scene } from "@/lib/qr/scene";
import type { FrameState, LogoState, QRConfig, StyleState } from "@/lib/qr/types";
import { verifyScene, type ScanResult } from "@/lib/qr/verify";
import { loadDesign, loadHistory, saveDesign, saveHistory, type HistoryItem } from "@/lib/storage";
import ContentPanel from "./ContentPanel";
import { downloadBlob, fileName, FORMATS, makeThumb, renderBlob, type ExportFormat } from "./exporting";
import FramePanel from "./FramePanel";
import HistoryPanel from "./HistoryPanel";
import LogoPanel from "./LogoPanel";
import PreviewPanel, { type ScanState, type Warning } from "./PreviewPanel";
import StylePanel from "./StylePanel";
import g from "./generator.module.css";

const SAMPLE_DATA = "https://contoh.com/qr-code-mar";

const TABS = [
  { id: "content", label: "Konten", icon: "link" },
  { id: "style", label: "Gaya", icon: "palette" },
  { id: "logo", label: "Logo", icon: "image" },
  { id: "frame", label: "Bingkai", icon: "frame" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const configKey = (c: QRConfig) => JSON.stringify(c);

export default function GeneratorApp() {
  return (
    <ToastProvider>
      <Studio />
    </ToastProvider>
  );
}

function Studio() {
  const toast = useToast();
  const fontFamily = jakarta.style.fontFamily;

  // This component is rendered client-only, so reading storage here is safe.
  const [config, setConfig] = useState<QRConfig>(() => loadDesign() ?? DEFAULT_CONFIG);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [tab, setTab] = useState<TabId>("content");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [size, setSize] = useState(1024);
  const [busy, setBusy] = useState(false);
  const [scanRes, setScanRes] = useState<{ scene: Scene | null; result: ScanResult }>({ scene: null, result: "ok" });
  const [previewOffscreen, setPreviewOffscreen] = useState(false);
  const previewRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [canShare] = useState(() => typeof navigator !== "undefined" && typeof navigator.share === "function");

  // Typing stays snappy: the expensive render follows a deferred copy.
  const live = useDeferredValue(config);

  // ---------- persistence ----------
  useEffect(() => {
    const t = setTimeout(() => saveDesign(config), 400);
    return () => clearTimeout(t);
  }, [config]);
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // ---------- patch helpers ----------
  const patchStyle = useCallback((p: Partial<StyleState>) => setConfig((c) => ({ ...c, style: { ...c.style, ...p } })), []);
  const patchLogo = useCallback((p: Partial<LogoState>) => setConfig((c) => ({ ...c, logo: { ...c.logo, ...p } })), []);
  const patchFrame = useCallback((p: Partial<FrameState>) => setConfig((c) => ({ ...c, frame: { ...c.frame, ...p } })), []);

  // ---------- derived QR ----------
  const payload = useMemo(() => buildPayload(live.content), [live.content]);
  const logoColor = live.style.customEyeColor ? live.style.eyeColor : live.style.fg;
  const effLogo = useMemo<LogoState>(() => {
    const l = live.logo;
    if (l.icon && l.icon in ICON_PATHS) return { ...l, src: iconDataUrl(l.icon as IconName, logoColor), width: 1, height: 1 };
    return l;
  }, [live.logo, logoColor]);

  const real = useMemo(
    () => (payload.data && !payload.error ? encode(payload.data, live.style.ecLevel) : null),
    [payload, live.style.ecLevel],
  );
  const error = payload.error ?? (real && !real.ok ? real.error : undefined);
  const ghost = !real?.ok;

  const scene = useMemo(() => {
    const enc = real?.ok ? real : encode(SAMPLE_DATA, live.style.ecLevel);
    if (!enc.ok) return null;
    return buildScene({ matrix: enc.matrix, style: live.style, logo: effLogo, frame: live.frame });
  }, [real, live.style, live.frame, effLogo]);
  const realScene = ghost ? null : scene;

  const previewSvg = useMemo(
    () => (scene ? sceneToSvg(scene, { idPrefix: "pv", fontFamily, title: ghost ? "Contoh kode QR" : "Pratinjau kode QR" }) : ""),
    [scene, fontFamily, ghost],
  );

  const meta = real?.ok
    ? { version: real.matrix.version, modules: real.matrix.size, bytes: byteLength(payload.data), ec: live.style.ecLevel }
    : null;

  // ---------- scan verification ----------
  useEffect(() => {
    if (!realScene) return;
    let cancelled = false;
    const t = setTimeout(() => {
      verifyScene(realScene, payload.data, live.style.bg)
        .catch((): ScanResult => "unreadable")
        .then((result) => {
          if (!cancelled) setScanRes({ scene: realScene, result });
        });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [realScene, payload.data, live.style.bg]);
  const scan: ScanState = !realScene ? null : scanRes.scene === realScene ? scanRes.result : "checking";

  // ---------- design warnings ----------
  const warnings = useMemo<Warning[]>(() => {
    const st = live.style;
    const w: Warning[] = [];
    const inks = [st.fg];
    if (st.gradient !== "none") inks.push(st.gradientColor);
    if (st.customEyeColor) inks.push(st.eyeColor);
    const ratio = Math.min(...inks.map((c) => contrastRatio(c, st.bg)));
    if (ratio < 2.5) w.push({ tone: "error", text: `Kontras warna terlalu rendah (${ratio.toFixed(1)}:1). Pilih warna utama yang jauh lebih gelap atau terang dari latar.` });
    else if (ratio < 4) w.push({ tone: "warn", text: `Kontras agak rendah (${ratio.toFixed(1)}:1) — bisa sulit dipindai di cahaya redup.` });
    if (luminance(st.fg) > luminance(st.bg))
      w.push({ tone: "info", text: "Warna terbalik (terang di atas gelap). Kamera ponsel modern bisa membacanya, beberapa aplikasi lama belum." });
    if (st.margin < 2) w.push({ tone: "warn", text: "Margin di bawah 2 modul. Sisakan ruang kosong di sekitar kode saat dicetak." });
    if (effLogo.src && st.ecLevel !== "H") w.push({ tone: "warn", text: "Logo aktif tapi level koreksi bukan H — naikkan ke H di tab Gaya." });
    if (scan === "unreadable")
      w.push({ tone: "warn", text: "Pemindai uji belum bisa membaca kode ini. Coba kecilkan logo, naikkan kontras, atau pakai bentuk titik yang lebih padat." });
    return w;
  }, [live.style, effLogo.src, scan]);

  // ---------- actions ----------
  const label = describeContent(live.content) || "kode";

  const addHistory = useCallback(
    async (s: Scene, cfg: QRConfig, itemLabel: string) => {
      const thumb = await makeThumb(s, fontFamily).catch(() => "");
      if (!thumb) return;
      const key = configKey(cfg);
      const item: HistoryItem = {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
        createdAt: Date.now(),
        label: itemLabel,
        thumb,
        config: cfg,
      };
      setHistory((prev) => [item, ...prev.filter((p) => configKey(p.config) !== key)]);
    },
    [fontFamily],
  );

  const renderOpts = { fontFamily, bg: live.style.bg, transparent: live.style.transparent, title: `Kode QR — ${label}` };

  const download = async () => {
    if (!realScene || busy) return;
    setBusy(true);
    try {
      const blob = await renderBlob(realScene, format, size, renderOpts);
      downloadBlob(blob, fileName(live.content.type, label, format));
      toast(`${FORMATS.find((f) => f.value === format)?.label} berhasil diunduh.`);
      void addHistory(realScene, live, label);
    } catch (e) {
      toast(
        e instanceof Error && e.message === "webp" ? "Browser ini belum bisa membuat WebP. Pilih PNG atau JPEG." : "Gagal membuat gambar. Coba ukuran yang lebih kecil.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  const copyImage = async () => {
    if (!realScene) return;
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      toast("Browser ini belum mendukung menyalin gambar. Gunakan Unduh.", "error");
      return;
    }
    try {
      // Pass a promise so Safari keeps the user-gesture context.
      const blob = renderBlob(realScene, "png", Math.min(size, 2048), renderOpts);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Gambar disalin — tinggal tempel.");
      void addHistory(realScene, live, label);
    } catch {
      toast("Browser menolak menyalin gambar. Gunakan Unduh.", "error");
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(payload.data);
      toast("Isi kode disalin sebagai teks.");
    } catch {
      toast("Tidak bisa mengakses clipboard.", "error");
    }
  };

  const share = async () => {
    if (!realScene) return;
    try {
      const blob = await renderBlob(realScene, "png", size, renderOpts);
      const file = new File([blob], fileName(live.content.type, label, "png"), { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Kode QR", text: label });
      } else {
        await navigator.share({ title: "Kode QR", text: payload.data });
      }
      void addHistory(realScene, live, label);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      toast("Gagal membagikan. Coba Unduh.", "error");
    }
  };

  const save = async () => {
    if (!realScene) return;
    await addHistory(realScene, live, label);
    toast("Disimpan ke riwayat.");
  };

  const applyPreset = (p: ThemePreset) => {
    const prev = config;
    setConfig((c) => ({
      ...c,
      style: { ...c.style, ...p.style },
      frame: { ...c.frame, color: p.frameColor, textColor: readableOn(p.frameColor) },
    }));
    toast(`Tema “${p.name}” dipakai.`, "success", { label: "Urungkan", run: () => setConfig(prev) });
  };

  const resetDesign = () => {
    const prev = config;
    setConfig((c) => ({ ...DEFAULT_CONFIG, content: c.content }));
    toast("Gaya dikembalikan ke awal.", "info", { label: "Urungkan", run: () => setConfig(prev) });
  };

  const onLogoAdded = () => {
    if (config.style.ecLevel !== "H") {
      patchStyle({ ecLevel: "H" });
      toast("Koreksi dinaikkan ke H agar kode tetap terbaca dengan logo.", "info");
    }
  };

  const restore = (item: HistoryItem) => {
    setConfig(item.config);
    setTab("content");
    toast("Desain dari riwayat dipulihkan.");
    document.getElementById("generator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Ctrl/⌘ + S downloads — keep the handler fresh without re-binding.
  const downloadRef = useRef(download);
  useEffect(() => {
    downloadRef.current = download;
  });
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void downloadRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Floating "see result" button on small screens: shown while the editor is
  // on screen but the preview has scrolled out of view.
  useEffect(() => {
    const preview = previewRef.current;
    const editor = editorRef.current;
    if (!preview || !editor) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.isIntersecting);
        setPreviewOffscreen(!!seen.get(editor) && !seen.get(preview));
      },
      { threshold: 0.1 },
    );
    io.observe(preview);
    io.observe(editor);
    return () => io.disconnect();
  }, []);

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const hasLogo = !!(config.logo.src || config.logo.icon);

  return (
    <>
      <div className={g.shell}>
        <div className={g.editor} ref={editorRef}>
          <header className={g.editorHead}>
            <div>
              <h2 className={g.panelTitle}>
                <Icon name="sliders" size={18} /> Studio QR
              </h2>
              <p className={g.note}>Pratinjau berubah langsung. Desainmu tersimpan otomatis.</p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={resetDesign} title="Kembalikan gaya, logo, dan bingkai ke awal">
              <Icon name="reset" size={16} /> Atur ulang
            </button>
          </header>

          <div className={g.tabs} role="tablist" aria-label="Pengaturan QR" onKeyDown={onTabKey} style={{ ["--i" as string]: tabIndex }}>
            <span className={g.tabThumb} aria-hidden="true" />
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                className={g.tab}
                onClick={() => setTab(t.id)}
              >
                <Icon name={t.icon} size={16} />
                <span>{t.label}</span>
                {t.id === "logo" && hasLogo && <span className={g.tabDot} aria-label="(aktif)" />}
                {t.id === "frame" && config.frame.style !== "none" && <span className={g.tabDot} aria-label="(aktif)" />}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={g.tabPanel} key={tab}>
            {tab === "content" && (
              <ContentPanel
                content={config.content}
                onChange={(content) => setConfig((c) => ({ ...c, content }))}
                payload={payload}
                ecLevel={config.style.ecLevel}
              />
            )}
            {tab === "style" && <StylePanel style={config.style} onChange={patchStyle} onPreset={applyPreset} hasLogo={hasLogo} />}
            {tab === "logo" && <LogoPanel logo={config.logo} previewSrc={effLogo.src} onChange={patchLogo} onLogoAdded={onLogoAdded} />}
            {tab === "frame" && <FramePanel frame={config.frame} style={config.style} onChange={patchFrame} />}
          </div>
        </div>

        <div className={g.previewCol}>
          <PreviewPanel
            ref={previewRef}
            svg={previewSvg}
            ghost={ghost}
            error={error}
            meta={meta}
            scan={scan}
            warnings={warnings}
            payload={payload.data}
            transparent={live.style.transparent}
            format={format}
            onFormat={setFormat}
            size={size}
            onSize={setSize}
            busy={busy}
            canShare={canShare}
            onDownload={download}
            onCopy={copyImage}
            onCopyText={copyText}
            onShare={share}
            onSave={save}
          />
        </div>
      </div>

      <HistoryPanel
        items={history}
        onRestore={restore}
        onDelete={(id) => setHistory((h) => h.filter((i) => i.id !== id))}
        onClear={() => {
          setHistory([]);
          toast("Riwayat dibersihkan.", "info");
        }}
      />

      <button
        type="button"
        className={g.fab}
        data-show={previewOffscreen ? "" : undefined}
        onClick={() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
        aria-label="Lihat pratinjau kode QR"
        tabIndex={previewOffscreen ? 0 : -1}
      >
        <span className={g.fabQr} dangerouslySetInnerHTML={{ __html: previewSvg.replace(/id="pv-/g, 'id="fab-').replace(/#pv-/g, "#fab-") }} />
        <span>Lihat hasil</span>
      </button>
    </>
  );
}
