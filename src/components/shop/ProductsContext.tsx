import React, { useEffect, useState, ReactNode } from 'react';
import { ProductsContext } from "./ProductsContextValue";
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { products as staticProducts } from '../../data/shopProducts';

export interface ProductDoc { id: string; name: string; price: number; image: string; description?: string; category?: string; active?: boolean; stock?: number; }

export interface ProductsCtx {
  products: ProductDoc[];
  loading: boolean;
  error?: string;
}



export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    // Check if Firebase is available
    if (!db) {
      console.warn('Firestore is not available, using static products');
      setProducts(staticProducts);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'products'), where('active','!=', false), orderBy('active','desc'));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ProductDoc, 'id'>) }));
      setProducts(docs.length ? docs : staticProducts);
      setLoading(false);
    }, err => { setError(err.message); setLoading(false); setProducts(staticProducts); });
    return () => unsub();
  }, []);

  return <ProductsContext.Provider value={{ products, loading, error }}>{children}</ProductsContext.Provider>;
};
