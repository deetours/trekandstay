import { createContext } from "react";
import type { ToastContextValue } from "./toast";

export const ToastContext = createContext<ToastContextValue | null>(null);
