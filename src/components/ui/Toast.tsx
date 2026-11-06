"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import Icon from "./Icon";
import s from "./toast.module.css";

type Tone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  action?: { label: string; run: () => void };
}
type ToastFn = (message: string, tone?: Tone, action?: ToastItem["action"]) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const ICON = { success: "check", error: "alert", info: "info" } as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback<ToastFn>(
    (message, tone = "success", action) => {
      const id = ++seq.current;
      setItems((list) => [...list.slice(-2), { id, message, tone, action }]);
      setTimeout(() => dismiss(id), action ? 6000 : 3200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={s.region} role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={s.toast} data-tone={t.tone}>
            <span className={s.icon}>
              <Icon name={ICON[t.tone]} size={16} strokeWidth={2.4} />
            </span>
            <span className={s.message}>{t.message}</span>
            {t.action && (
              <button
                type="button"
                className={s.action}
                onClick={() => {
                  t.action?.run();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
