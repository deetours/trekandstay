import { useCart } from './useCart';

import { products } from '../../data/shopProducts';
import { Button } from '../ui/Button';

export default function WishlistPage() {
  const { wishlist, addToCart, removeFromWishlist } = useCart();
  const getProduct = (id: string) => products.find((p: { id: string; name: string; price: number; image: string }) => p.id === id);

  if (wishlist.length === 0) return <div className="max-w-xl mx-auto py-20 text-center text-gray-500">Your wishlist is empty.</div>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 text-mountain-blue">Your Wishlist</h1>
      <ul className="divide-y">
  {wishlist.map((id: string) => {
          const product = getProduct(id);
          if (!product) return null;
          return (
            <li key={id} className="flex items-center gap-4 py-4">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="font-semibold">{product.name}</div>
                <div className="text-mountain-blue font-bold">₹{product.price}</div>
              </div>
              <Button size="sm" onClick={() => addToCart(id)}>Add to Cart</Button>
              <Button size="sm" variant="secondary" onClick={() => removeFromWishlist(id)}>Remove</Button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
