import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from "./ToastContext";

export type ToastVariant = 'success' | 'error' | 'info';
export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

export type ToastContextValue = {
  add: (t: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
};


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const add = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = {
      id,
      duration: 3000,
      variant: 'info',
      ...t,
    };
    setToasts((prev) => [item, ...prev].slice(0, 5));
    const timeout = window.setTimeout(() => remove(id), item.duration);
    timers.current.set(id, timeout);
  }, [remove]);

  const value = useMemo(() => ({ add, remove }), [add, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}


function Toaster({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[110] flex justify-center px-3 sm:px-4">
      <div className="flex w-full max-w-md flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur bg-white/95',
              t.variant === 'success' ? 'border-emerald-200' : t.variant === 'error' ? 'border-rose-200' : 'border-slate-200',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className={[
                'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                t.variant === 'success' ? 'bg-emerald-500' : t.variant === 'error' ? 'bg-rose-500' : 'bg-slate-400',
              ].join(' ')} />
              <div className="flex-1">
                {t.title && <div className="text-sm font-semibold text-gray-900">{t.title}</div>}
                {t.description && <div className="text-sm text-gray-700">{t.description}</div>}
              </div>
              <button
                className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => onClose(t.id)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Toaster };
