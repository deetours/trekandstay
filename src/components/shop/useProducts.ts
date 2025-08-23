import { useContext } from "react";
import { ProductsContext } from "./ProductsContextValue";

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};
