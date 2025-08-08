import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "../components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Alert } from "../components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { MapPin, Star, CheckCircle2, XCircle, Quote } from 'lucide-react';
// 3D imports (lazy)
const LazyCanvas = React.lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));
const LazyRotatingCompass = React.lazy(() => import('../components/3d/RotatingCompass').then(m => ({ default: m.RotatingCompass })));
const LazyParticleSystem = React.lazy(() => import('../components/3d/ParticleSystem').then(m => ({ default: m.ParticleSystem })));

function ImageGallery({ images }: { images: string[] }) {
  const [mainIdx, setMainIdx] = useState(0);
  return (
    <section className="w-full">
      <div className="rounded-xl overflow-hidden shadow-lg relative aspect-video bg-gray-100">
        <AnimatePresence mode="wait">
          <motion.img
            key={images[mainIdx]}
            src={images[mainIdx]}
            alt="Main trip"
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
      </div>
      <div className="flex gap-2 mt-3 justify-center">
        {images.map((img, idx) => (
          <button
            key={img}
            className={`rounded-md border-2 ${idx === mainIdx ? 'border-primary ring-2 ring-primary/40' : 'border-muted'} overflow-hidden w-16 h-10 focus:outline-none transition-transform hover:scale-105`}
            onClick={() => setMainIdx(idx)}
            aria-label={`Show image ${idx + 1}`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}

function TripInfoCard({ trip, onBook }: { trip: any; onBook: () => void }) {
  return (
    <Card className="p-6 shadow-xl bg-white/90">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold mb-1 text-primary tracking-tight">{trip.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {trip.location}
          </Badge>
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.7 (12 reviews)
          </Badge>
        </div>
        <p className="text-base mt-2 mb-2 text-gray-700">{trip.description || 'No description available.'}</p>
        <div className="grid grid-cols-2 gap-2 my-2 text-sm">
          <div><span className="font-semibold">Duration:</span> {trip.duration}</div>
          <div><span className="font-semibold">Spots:</span> {trip.spotsAvailable}</div>
          <div><span className="font-semibold">Departure:</span> {trip.nextDeparture}</div>
          <div><span className="font-semibold">Safety:</span> {trip.safetyRecord}</div>
        </div>
        <div className="text-lg font-bold text-green-700 mt-2 mb-1">₹{trip.price} <span className="font-normal text-sm text-gray-500">per person</span></div>
        <div className="flex gap-3 mt-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={onBook} className="w-full">Book This Adventure</Button>
          </motion.div>
          <Button variant="secondary" className="w-full">Add to Wishlist</Button>
        </div>
      </div>
    </Card>
  );
}

function HighlightsList({ highlights }: { highlights: string[] }) {
  return (
    <Card className="mb-4">
      <div className="py-4">
        <h2 className="text-lg font-semibold mb-2">Trip Highlights</h2>
        <div className="flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <Badge key={i} variant="secondary" className="text-base px-3 py-1">{h}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
// SafetyChecklist helper component
function SafetyChecklist({ safety }: { safety: string[] }) {
  return (
    <Alert className="mb-4 bg-green-50/70 border-green-200 text-green-900">
      <h2 className="font-semibold mb-2">Safety & Readiness</h2>
      <ul className="space-y-2">
        {safety.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            {i === safety.length - 1 ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </Alert>
  );
}

// GuideCard helper component
function GuideCard({ guide }: { guide: any }) {
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-4 py-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={guide.image} alt={guide.name} />
          <AvatarFallback>{guide.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-lg">Your Guide</h2>
          <div className="font-bold text-primary">{guide.name} <span className="text-xs font-normal text-gray-500">({guide.experience})</span></div>
          <div className="text-sm text-muted-foreground">{guide.specialty}</div>
          <div className="text-xs mt-1">Bio: {guide.bio || 'Experienced adventure guide.'}</div>
        </div>
      </div>
    </Card>
  );
}

// Static trip data for now
const trips = [
  {
    id: '1',
    name: 'Dudhsagar Waterfalls',
    images: [
      'https://images.pexels.com/photos/547115/pexels-photo-547115.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    ],
    location: 'Goa-Karnataka Border',
    duration: '2 Days',
    spotsAvailable: 8,
    nextDeparture: '2025-09-15',
    price: 2999,
    safetyRecord: '100% accident-free',
    itinerary: [
      'Day 1: Arrival, trek to base camp, campfire',
      'Day 2: Trek to Dudhsagar, waterfall visit, return',
    ],
    safety: [
      'Certified guides',
      'First aid kit',
      'Emergency evacuation plan',
    ],
    guide: {
      name: 'Arjun Sharma',
      experience: '8+ years',
      specialty: 'Mountain Trekking',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    highlights: [
      'Scenic train trek',
      'Milky white cascade',
      'Wildlife spotting',
      'Campfire experience',
    ],
    equipment: ['Trekking shoes', 'Raincoat', 'Water bottle', 'Snacks'],
    essentials: ['ID proof', 'Personal medication', 'Backpack'],
    reviews: [
      { author: 'Amit', text: 'Amazing experience! The guides were very professional.' },
      { author: 'Priya', text: 'The waterfall was breathtaking. Highly recommended.' },
    ],
  },
  // ...add more trips for id 2, 3, 4
];

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trip = trips.find(t => t.id === id) || trips[0];
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroInView, setHeroInView] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // viewport conditions
    const mq = window.matchMedia('(min-width: 768px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsDesktop(mq.matches);
    const updateRM = () => setReducedMotion(rm.matches);
    update();
    updateRM();
    mq.addEventListener('change', update);
    rm.addEventListener('change', updateRM);

    // in-view detection
    if (heroRef.current) {
      const obs = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e.isIntersecting) setHeroInView(true);
        },
        { threshold: 0.2 }
      );
      obs.observe(heroRef.current);
      return () => {
        mq.removeEventListener('change', update);
        rm.removeEventListener('change', updateRM);
        obs.disconnect();
      };
    }
    return () => {
      mq.removeEventListener('change', update);
      rm.removeEventListener('change', updateRM);
    };
  }, []);

  const enable3D = isDesktop && !reducedMotion;

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-white to-blue-50 min-h-screen">
      {/* Decorative background blobs for depth */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="relative px-2 py-8 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Destinations', href: '/destinations' }, { label: trip.name }]} />
          <button onClick={() => navigate(-1)} className="text-sm text-blue-700 hover:underline mb-4">← Back</button>
        </div>

        {/* Immersive 3D hero */}
        <section ref={heroRef} className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl border border-white/50 shadow-2xl bg-gradient-to-br from-stone-50/70 to-blue-50/60 backdrop-blur mb-10">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            {enable3D && heroInView ? (
              <React.Suspense fallback={null}>
                <LazyCanvas camera={{ position: [0, 2, 6], fov: 50 }}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[2, 4, 2]} intensity={0.7} />
                  <LazyRotatingCompass />
                  <LazyParticleSystem type="fireflies" count={90} />
                </LazyCanvas>
              </React.Suspense>
            ) : null}
          </div>
          <div className="relative px-6 py-14 md:px-12 md:py-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-5xl font-oswald font-bold tracking-tight text-forest-green drop-shadow-sm">
                {trip.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <Badge variant="secondary" className="bg-blue-50/80 text-blue-700 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {trip.location}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-50/80 text-yellow-700 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.7 (12)
                </Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Top Section: Responsive Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3">
            <Card className="p-0 overflow-hidden">
              <ImageGallery images={trip.images} />
            </Card>
          </div>
          <div className="md:col-span-2 md:sticky md:top-20">
            <TripInfoCard trip={trip} onBook={() => navigate('/payment')} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="max-w-3xl mx-auto mt-10">
          <TabsList className="flex justify-center gap-2 bg-white/80 backdrop-blur rounded-xl border shadow-sm p-1 mb-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 py-2 transition">Overview</TabsTrigger>
            <TabsTrigger value="itinerary" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 py-2 transition">Itinerary</TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 py-2 transition">Equipment</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 py-2 transition">Reviews</TabsTrigger>
          </TabsList>
          {/* Remove global AnimatePresence to prevent all tabs showing at once */}
          <TabsContent value="overview" asChild forceMount>
            <motion.section
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 data-[state=inactive]:hidden"
            >
              <HighlightsList highlights={trip.highlights || []} />
              <SafetyChecklist safety={trip.safety || []} />
              <GuideCard guide={trip.guide} />
            </motion.section>
          </TabsContent>
          <TabsContent value="itinerary" asChild forceMount>
            <motion.section
              key="itinerary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 rounded-xl shadow p-6 data-[state=inactive]:hidden"
            >
              <h2 className="text-lg font-semibold mb-2">Day-by-Day Itinerary</h2>
              <p className="text-sm text-muted-foreground mb-3">A concise breakdown of what to expect on each day.</p>
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />
                {trip.itinerary.map((item, i) => (
                  <div key={i} className="relative mb-3">
                    <div className="absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20" />
                    <div>{item}</div>
                  </div>
                ))}
              </div>
            </motion.section>
          </TabsContent>
          <TabsContent value="equipment" asChild forceMount>
            <motion.section
              key="equipment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 rounded-xl shadow p-6 data-[state=inactive]:hidden"
            >
              <h2 className="text-lg font-semibold mb-2">Gear & Essentials</h2>
              <p className="text-sm text-muted-foreground mb-3">Pack smart to stay comfortable and safe.</p>
              <ul className="list-disc ml-5 space-y-1 mb-2">
                {trip.equipment.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              <h3 className="font-semibold mt-4 mb-1">Essentials</h3>
              <ul className="list-disc ml-5 space-y-1">
                {trip.essentials.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </motion.section>
          </TabsContent>
          <TabsContent value="reviews" asChild forceMount>
            <motion.section
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 rounded-xl shadow p-6 data-[state=inactive]:hidden"
            >
              <h2 className="text-lg font-semibold mb-2">Traveler Reviews</h2>
              <ul className="space-y-3">
                {trip.reviews.map((review, i) => (
                  <li key={i} className="border-b pb-3 last:border-b-0 flex items-start gap-2">
                    <Quote className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="italic text-gray-700">{review.text}</p>
                      <div className="text-sm mt-1"><span className="font-semibold text-primary">{review.author}</span></div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky bottom bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="mx-3 mb-3 rounded-2xl border shadow-lg bg-white/95 backdrop-blur p-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">From</div>
            <div className="text-lg font-bold text-gray-900">₹{trip.price} <span className="text-xs font-normal text-gray-500">/person</span></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => window.open('tel:+919999999999','_self')}>Call</Button>
            <Button variant="secondary" onClick={() => window.open('https://wa.me/919999999999','_blank')}>WhatsApp</Button>
            <Button onClick={() => navigate('/payment')}>Book</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
