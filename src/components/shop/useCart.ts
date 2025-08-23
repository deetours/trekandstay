import { CartContext } from "./CartContextValue";
import { useContext } from "react";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx as import('./CartContext').CartContextType;
}
