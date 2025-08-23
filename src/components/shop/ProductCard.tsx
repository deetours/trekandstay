import { useCart } from './useCart';

import React from 'react';
import { Button } from '../ui/Button';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}


export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, addToWishlist, wishlist, cart } = useCart();
  const inWishlist = wishlist.includes(product.id);
  const inCart = cart.some((item: { id: string; quantity: number }) => item.id === product.id);
  const navigate = useNavigate();
  // TODO: Replace with real auth check
  const isAuthenticated = false;

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/signin');
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border border-yellow-100 p-5 flex flex-col items-stretch relative group transition-transform hover:scale-[1.03] hover:shadow-2xl">
      <button
        className={`absolute top-3 right-3 z-10 rounded-full p-1.5 border border-gray-200 bg-white shadow-md hover:bg-rose-50 transition-colors ${inWishlist ? 'text-rose-500' : 'text-gray-400'}`}
        onClick={handleWishlist}
        aria-label="Add to wishlist"
      >
        <Heart fill={inWishlist ? '#f43f5e' : 'none'} strokeWidth={2.2} className="w-5 h-5" />
      </button>
      <img src={product.image} alt={product.name} className="w-40 h-40 object-cover rounded-xl mb-4 mx-auto shadow-lg border-2 border-white group-hover:border-yellow-200 transition-all" />
      <h2 className="text-xl font-extrabold mb-1 text-center text-forest-green drop-shadow-sm">{product.name}</h2>
      <div className="text-mountain-blue font-bold text-2xl mb-2 text-center drop-shadow">₹{product.price}</div>
      <div className="text-gray-600 text-sm mb-4 text-center min-h-[40px]">{product.description}</div>
      <div className="flex flex-col gap-2 mt-auto">
        <Button size="md" className="w-full font-semibold bg-gradient-to-r from-forest-green to-mountain-blue text-white shadow-md hover:from-mountain-blue hover:to-forest-green" onClick={() => addToCart(product.id)} disabled={inCart}>
          {inCart ? 'In Cart' : 'Add to Cart'}
        </Button>
        <Button size="sm" variant="adventure" className="w-full font-semibold" onClick={() => { addToCart(product.id); window.location.href = '/cart'; }}>
          Buy Now
        </Button>
      </div>
    </div>
  );
};
