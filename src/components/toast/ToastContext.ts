import { createContext } from "react";
import type { ToastContextValue } from "./ToastProvider";

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
