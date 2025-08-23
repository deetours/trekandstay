import { useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastItem } from "./toast";

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return {
    toast: ctx.add,
    success: (opts: Omit<ToastItem, 'id' | 'variant'>) => ctx.add({ ...opts, variant: 'success' }),
    error: (opts: Omit<ToastItem, 'id' | 'variant'>) => ctx.add({ ...opts, variant: 'error' }),
    info: (opts: Omit<ToastItem, 'id' | 'variant'>) => ctx.add({ ...opts, variant: 'info' }),
    remove: ctx.remove,
  };
}
