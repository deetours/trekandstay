import React, { useState, useCallback, ReactNode, useEffect } from 'react';
import { ToastContext } from "./ToastContext";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // ms
}

export interface ToastContextValue {
  showToast: (t: Omit<Toast,'id'>) => void;
}



export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type: 'info', duration: 4000, ...t };
    setToasts(prev => [...prev, toast]);
  }, []);

  useEffect(() => {
    const timers = toasts.map(t => setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== t.id));
    }, t.duration));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[2000] flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-lg shadow px-4 py-3 text-sm border flex items-start gap-3 animate-fade-in-up bg-white/90 backdrop-blur ${t.type==='success'?'border-emerald-300 text-emerald-800': t.type==='error'?'border-rose-300 text-rose-700':'border-gray-300 text-gray-700'}`}>
            <div className="flex-1">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div>{t.message}</div>
            </div>
            <button className="text-xs opacity-60 hover:opacity-100" onClick={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
