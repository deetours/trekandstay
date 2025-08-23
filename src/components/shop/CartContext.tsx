import { useState, ReactNode } from 'react';
import { CartContext } from "./CartContextValue";

export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  clearCart: () => void;
}



export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const addToCart = (id: string) => {
    setCart(prev => {
      const found = prev.find(item => item.id === id);
      if (found) return prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id, quantity: 1 }];
    });
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const addToWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev : [...prev, id]);
  const removeFromWishlist = (id: string) => setWishlist(prev => prev.filter(wid => wid !== id));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, addToWishlist, removeFromWishlist, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
