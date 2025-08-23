import { useCart } from './useCart';


import { products } from '../../data/shopProducts';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const getProduct = (id: string) => products.find(p => p.id === id);
  const total = cart.reduce((sum, item) => sum + (getProduct(item.id)?.price || 0) * item.quantity, 0);
  const navigate = useNavigate();
  const [recommendedTrips, setRecommendedTrips] = useState<Array<{
    id: string;
    name: string;
    image: string;
    price: number;
  }>>([]);

  useEffect(() => {
    setRecommendedTrips([
      { id: 'trip1', name: 'Kudremukh Trek', image: '/trips/kudremukh.jpg', price: 2499 },
      { id: 'trip2', name: 'Coorg Waterfall Hike', image: '/trips/coorg.jpg', price: 1999 },
      { id: 'trip3', name: 'Agumbe Rainforest', image: '/trips/agumbe.jpg', price: 2999 },
    ]);
  }, []);

  if (cart.length === 0) return (
    <main className="max-w-xl mx-auto py-32 text-center bg-gradient-to-br from-yellow-100 via-white to-orange-100 min-h-[70vh] flex items-center justify-center">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-2xl border border-yellow-100 p-10 flex flex-col items-center">
        <img src="/shop/empty-cart.png" alt="Empty Cart" className="w-32 h-32 mb-6 opacity-80" />
        <h2 className="text-2xl font-bold text-mountain-blue mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Button variant="adventure" size="lg" onClick={() => navigate('/shop')}>Go to Shop</Button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 py-16 px-2">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-2xl border border-yellow-100 p-8">
          <h1 className="text-4xl font-extrabold mb-8 text-forest-green text-center tracking-tight drop-shadow">Your Cart</h1>
          <ul className="divide-y divide-yellow-100 mb-8">
            {cart.map(item => {
              const product = getProduct(item.id);
              if (!product) return null;
              return (
                <li key={item.id} className="flex items-center gap-5 py-5 group hover:bg-orange-100/40 rounded-2xl transition-all">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow group-hover:scale-105 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-mountain-blue text-lg truncate drop-shadow-sm">{product.name}</div>
                    <div className="text-gray-500 text-xs truncate">{product.description}</div>
                    <div className="text-forest-green font-bold mt-1">₹{product.price} <span className="text-xs text-gray-400">x {item.quantity}</span></div>
                  </div>
                  <span className="text-lg font-bold text-mountain-blue">₹{product.price * item.quantity}</span>
                  <Button size="sm" variant="secondary" onClick={() => removeFromCart(item.id)}>Remove</Button>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between items-center mb-8">
            <span className="font-semibold text-xl text-forest-green">Total</span>
            <span className="text-2xl font-extrabold text-mountain-blue">₹{total}</span>
          </div>
          <div className="flex gap-4">
            <Button className="flex-1 py-3 text-lg font-bold bg-gradient-to-r from-forest-green to-mountain-blue text-white shadow-lg hover:from-mountain-blue hover:to-forest-green" onClick={() => navigate('/payment?amount='+total)}>Checkout</Button>
            <Button className="flex-1 py-3 text-lg font-bold" variant="secondary" onClick={clearCart}>Clear Cart</Button>
          </div>
        </div>

        {/* Recommended Trips */}
        <div className="mt-14">
          <h2 className="text-xl font-bold mb-4 text-forest-green">Recommended Adventures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedTrips.map(trip => (
              <div key={trip.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow p-4 flex flex-col items-center border border-yellow-100">
                <img src={trip.image} alt={trip.name} className="w-28 h-20 object-cover rounded-lg mb-2 shadow" />
                <div className="font-semibold mb-1 text-center text-mountain-blue">{trip.name}</div>
                <div className="text-mountain-blue font-bold mb-2">₹{trip.price}</div>
                <Button size="sm" variant="adventure" onClick={() => navigate('/trip/'+trip.id)}>View Trip</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
