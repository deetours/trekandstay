import { createContext } from "react";
import type { ProductsCtx } from "./ProductsContext";

export const ProductsContext = createContext<ProductsCtx | undefined>(undefined);
