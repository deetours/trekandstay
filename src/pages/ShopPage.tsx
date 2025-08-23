
import { ProductCard } from '../components/shop/ProductCard';
import { products } from '../data/shopProducts';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function ShopPage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 pb-16">
      {/* Hero Banner */}
  <section className="relative w-full flex flex-col items-center justify-center pt-32 pb-16 mb-10 bg-gradient-to-r from-forest-green/90 to-mountain-blue/80 text-white shadow-lg rounded-b-3xl overflow-hidden">
        <img src="/shop/hero-banner.jpg" alt="Shop Banner" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Discover Local Treasures</h1>
          <p className="text-lg md:text-xl font-medium mb-6 drop-shadow">Handpicked products from the Western Ghats, delivered to your door.</p>
          <Link to="/request-product">
            <Button variant="adventure" size="lg" className="shadow-xl">Request a Product</Button>
          </Link>
        </div>
      </section>
      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
