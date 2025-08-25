import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPaymentIntent, confirmPayment, sendWhatsApp } from '../utils/api';
import { products } from '../data/shopProducts';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEFAULT_UPI_ID = 'trekandstay@ybl';
const WHATSAPP_NUMBER = '+919902937730';

const LazyCanvas = React.lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));

const RotatingCoin: React.FC = () => {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.2;
    }
  });
  return (
    <group position={[0,0,0]}>
      <mesh ref={ref} scale={[1.2,1.2,1.2]}>
        <cylinderGeometry args={[0.6,0.6,0.08,48]} />
        <meshStandardMaterial color="#f9d648" emissive="#b89616" emissiveIntensity={0.4} roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

const ConfettiBurst: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const group = React.useRef<THREE.Group>(null);
  const [particles] = React.useState(() => Array.from({ length: 70 }).map(() => ({
    x: (Math.random()-0.5)*2,
    y: (Math.random()-0.2)*0.5,
    z: (Math.random()-0.5)*2,
    vx: (Math.random()-0.5)*0.04,
    vy: 0.08 + Math.random()*0.04,
    vz: (Math.random()-0.5)*0.04,
    rot: Math.random()*Math.PI,
    vr: (Math.random()-0.5)*0.2,
    color: ['#f59e0b','#10b981','#3b82f6','#ec4899','#f87171'][Math.floor(Math.random()*5)]
  })));
  // Initialize start time to 0 (numeric) to avoid nullable ref typing issues
  const start = React.useRef<number>(0);
  useFrame((state) => {
    if (!trigger || !group.current) return;
    if (start.current === 0) start.current = state.clock.elapsedTime; // capture initial time once
    const t = state.clock.elapsedTime - start.current;
    group.current.children.forEach((obj, i: number) => {
      if (obj instanceof THREE.Mesh) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vy -= 0.004; // gravity
        p.rot += p.vr;
        obj.position.set(p.x, p.y, p.z);
        obj.rotation.set(p.rot, p.rot*0.7, p.rot*0.3);
        const fade = Math.max(0, 1 - t / 3.2);
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => {
            if ('opacity' in mat) (mat as THREE.Material).opacity = fade;
          });
        } else if ('opacity' in obj.material) {
          (obj.material as THREE.Material).opacity = fade;
        }
      }
    });
  });
  return (
    <group ref={group} position={[0,0,0]}> {trigger && particles.map((p,i)=>(
      <mesh key={i} position={[p.x,p.y,p.z]}>
        <boxGeometry args={[0.1,0.02,0.2]} />
        <meshStandardMaterial color={p.color} transparent opacity={1} />
      </mesh>))}
    </group>
  );
};


export const PaymentPage: React.FC = () => {
  const [paymentSent, setPaymentSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [upiIntent, setUpiIntent] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse booking and cart info from search params
  const booking = useMemo(() => {
    const idStr = searchParams.get('booking');
    const amountStr = searchParams.get('amount');
    const tripName = searchParams.get('tripName');
    const tripAmount = searchParams.get('tripAmount');
    const cartStr = searchParams.get('cart');
    let cart: { id: string; quantity: number }[] = [];
    if (cartStr) {
      try { cart = JSON.parse(decodeURIComponent(cartStr)); } catch { /* ignore error */ }
    }
    return {
      id: idStr ? Number(idStr) : null,
      amount: amountStr ? Number(amountStr) : null,
      tripName,
      tripAmount: tripAmount ? Number(tripAmount) : null,
      cart,
    };
  }, [searchParams]);

  // Calculate cart product details and total
  const cartProducts = booking.cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean) as (typeof products[0] & { quantity: number })[];
  const cartTotal = cartProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalAmount = (booking.tripAmount || 0) + cartTotal;

  useEffect(() => {
    async function setupUPI() {
      if (!totalAmount) return;
      try {
        const resp = await createPaymentIntent(booking.id || 0, totalAmount, DEFAULT_UPI_ID);
        setPaymentId(resp.payment.id);
        setUpiIntent(resp.upi.intent);
      } catch {
        // ignore; manual flow still works
      }
    }
    setupUPI();
  }, [booking.id, totalAmount]);

  const openUpi = () => {
    const intent = upiIntent || `upi://pay?pa=${DEFAULT_UPI_ID}&pn=TrekAndStay${totalAmount ? `&am=${totalAmount}` : ''}&cu=INR`;
    window.location.href = intent;
  };

  const handlePaymentSent = async () => {
    setPaymentSent(true);
    // If we have a payment record, confirm it now (in real life, webhook)
    if (paymentId) {
      try {
        await confirmPayment(paymentId, { upiTxnId: `SIM-${Date.now()}`, phone: WHATSAPP_NUMBER });
      } catch { /* ignore error */ }
    }
    // WhatsApp message with dynamic details
    let waMsg = `Thanks for your payment!\n`;
    if (booking.tripName && booking.tripAmount) waMsg += `Trip: ${booking.tripName} - ₹${booking.tripAmount}\n`;
    if (cartProducts.length) {
      waMsg += `Products:\n`;
      cartProducts.forEach(p => { waMsg += `- ${p.name} x${p.quantity} = ₹${p.price * p.quantity}\n`; });
    }
    waMsg += `Total Paid: ₹${totalAmount}\n`;
    waMsg += `Our team will reach out to you soon. If any balance is due, we will inform you.`;
    try {
      await sendWhatsApp({ to: WHATSAPP_NUMBER, message: waMsg });
    } catch { /* ignore error */ }
    setTimeout(() => setConfirmed(true), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-white to-orange-100 pt-32 pb-12 px-4 relative overflow-hidden">
      {/* Local 3D overlay (Option D) */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
        <React.Suspense fallback={null}>
          <LazyCanvas dpr={[1,1.5]} camera={{ position: [0, 0, 3.5], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2,3,2]} intensity={0.8} />
            <RotatingCoin />
            {confirmed && <ConfettiBurst trigger={confirmed} />}
          </LazyCanvas>
        </React.Suspense>
      </div>
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-oswald font-bold text-forest-green mb-4">Complete Your Payment</h1>
          <p className="text-xl text-mountain-blue font-inter max-w-2xl mx-auto">
            Please review your booking and pay the exact amount below. You will receive a WhatsApp confirmation instantly.
          </p>
        </motion.div>

        {/* Booking/Cart Summary */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
          {booking.tripName && (
            <div className="mb-4">
              <div className="font-bold text-lg text-forest-green mb-1">Trip</div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-mountain-blue">{booking.tripName}</span>
                <span className="font-bold text-lg text-forest-green">₹{booking.tripAmount}</span>
              </div>
            </div>
          )}
          {cartProducts.length > 0 && (
            <div className="mb-4">
              <div className="font-bold text-lg text-forest-green mb-2">Products</div>
              <ul className="space-y-2">
                {cartProducts.map(p => (
                  <li key={p.id} className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg border shadow" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-mountain-blue truncate">{p.name}</div>
                      <div className="text-xs text-gray-500">x{p.quantity}</div>
                    </div>
                    <span className="font-bold text-forest-green">₹{p.price * p.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-yellow-100">
            <span className="font-semibold text-xl text-forest-green">Total to Pay</span>
            <span className="text-2xl font-extrabold text-mountain-blue">₹{totalAmount}</span>
          </div>
        </Card>

        {/* UPI QR and Payment */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-white to-yellow-50 border border-yellow-100 flex flex-col items-center">
          <div className="text-lg font-oswald font-bold text-forest-green mb-2">Pay via UPI</div>
          <div className="text-gray-700 mb-2">UPI ID: <span className="font-semibold">{DEFAULT_UPI_ID}</span></div>
          <div className="text-gray-500 text-sm mb-4">Scan the QR or use any UPI app (Google Pay, PhonePe, Paytm, etc.)</div>
          <img src="/upi.jpeg" alt="UPI QR" className="w-40 h-40 rounded-xl border-2 border-yellow-200 shadow mb-4" />
          <Button variant="adventure" size="lg" className="mb-2" onClick={openUpi}>
            Pay with UPI
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>

        {/* WhatsApp Confirmation */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 flex flex-col items-center">
          <div className="text-lg font-oswald font-bold text-forest-green mb-2">Confirm on WhatsApp</div>
          <div className="text-gray-700 mb-4">After payment, send your payment screenshot on WhatsApp to confirm.</div>
          <Button
            variant="adventure"
            size="lg"
            className="mb-2"
            onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi!%20I%20have%20paid%20for%20my%20adventure%20booking.%20Please%20confirm.`, '_blank')}
          >
            Open WhatsApp
            <MessageCircle className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="primary" size="lg" className="mt-4" onClick={handlePaymentSent} disabled={paymentSent}>
            {paymentSent ? 'Waiting for Confirmation...' : 'I Have Sent Payment'}
          </Button>
        </Card>

        {/* Thank You/Confirmation */}
        {confirmed && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce" />
            <h3 className="text-2xl font-oswald font-bold text-forest-green mb-4">
              Thanks for Confirming Your Payment!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Our team will reach out to you soon with details. If any balance is due, we will inform you.<br />
              You will also receive a WhatsApp message with your payment summary.
            </p>
            <Button variant="adventure" size="lg" onClick={() => navigate('/')}>Back to Home</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
