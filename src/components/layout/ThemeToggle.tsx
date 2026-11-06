"use client";

import { useSyncExternalStore } from "react";
import Icon from "@/components/ui/Icon";
import s from "./layout.module.css";

type Theme = "light" | "dark";
const KEY = "qrmar:theme";

function current(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

/** Inline script for <head>: applies the saved theme before first paint. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, current, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={s.themeToggle}
      data-theme-state={theme ?? "unknown"}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(KEY, next);
        } catch {
          /* private mode */
        }
      }}
      aria-label={next === "dark" ? "Ganti ke mode malam" : "Ganti ke mode siang"}
      title={next === "dark" ? "Mode malam" : "Mode siang"}
    >
      <span className={s.themeIcon} data-icon="sun">
        <Icon name="sun" size={18} />
      </span>
      <span className={s.themeIcon} data-icon="moon">
        <Icon name="moon" size={18} />
      </span>
    </button>
  );
}
