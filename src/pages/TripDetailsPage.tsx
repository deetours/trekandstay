import { useToast } from '../components/ui/useToast';
import React, { useEffect, useRef, useState, startTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { MapPin, Star, CheckCircle2, XCircle, CalendarDays, Clock, Users, Shield, Mountain, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Backpack, Compass, Sun, Leaf, Flame, Heart, PhoneCall, MessageCircle } from 'lucide-react';
// Firestore
import { doc as fsDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
// API helpers (without old getTrip)
import { createLead, sendWhatsApp, addToWishlist } from '../utils/api';
import { trackTripView, trackBookClick, trackRouteSelect, trackExitIntent } from '../utils/tracking';
import { BookingFlow } from '../components/booking/BookingFlow';
import { products } from '../data/shopProducts';

interface RouteOption {
  label: string;
  price: number;
  description?: string;
}

interface TripData {
  id: string;
  name: string;
  images: string[];
  location: string;
  duration?: string;
  spotsAvailable?: number;
  nextDeparture?: string;
  price?: number;
  safetyRecord?: string;
  itinerary?: string[];
  safety?: string[];
  guide?: {
    name: string;
    experience?: string;
    expertise?: string[];
    avatar?: string;
    bio?: string;
    rating?: number;
  };
  highlights?: string[];
  equipment?: string[];
  essentials?: string[];
  reviews?: { author: string; text: string }[];
  routeOptions?: RouteOption[];
}

// Simple in-memory cache to reduce refetch flicker
const tripCache: Map<string, TripData> = new Map<string, TripData>();

function ImageGallery({ images }: { images: string[] }) {
  const [mainIdx, setMainIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const parallax = useRef({ x: 0, y: 0 });

  // Autoplay with pause on hover
  useEffect(() => {
    if (!isHovering && images.length > 1) {
      const id = setInterval(() => setMainIdx((i) => (i + 1) % images.length), 4500);
      return () => clearInterval(id);
    }
  }, [isHovering, images.length]);

  const onImgLoad = (idx: number) => setLoaded((s) => ({ ...s, [idx]: true }));

  // Parallax on mouse move (subtle)
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    parallax.current = { x: dx * 8, y: dy * 8 };
  };

  // Lightbox handlers
  const openLightbox = () => { setLightboxOpen(true); setZoom(1); setPan({ x: 0, y: 0 }); };
  const closeLightbox = () => { setLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }); };
  const onWheelLightbox: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const next = Math.min(4, Math.max(1, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
    setZoom(Number(next.toFixed(2)));
  };
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (zoom <= 1) return;
    dragging.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || !lastPoint.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onPointerUp = () => { dragging.current = false; lastPoint.current = null; };

  return (
    <section className="w-full">
      {/* Main image card */}
      <div
        className="group rounded-2xl overflow-hidden shadow-2xl relative aspect-[16/10] bg-gray-100 border border-white/50"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={onMouseMove}
      >
        {/* gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

        {/* Skeleton while loading */}
        {!loaded[mainIdx] && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        )}

        <motion.img
          key={images[mainIdx]}
          src={images[mainIdx]}
          alt={`Trip photo ${mainIdx + 1}`}
          onLoad={() => onImgLoad(mainIdx)}
          className="w-full h-full object-cover select-none"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1, x: parallax.current.x, y: parallax.current.y }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
          onClick={openLightbox}
          role="button"
        />

        {/* Caption & controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex items-end justify-between gap-3">
          <div className="text-white/95 drop-shadow-sm text-sm sm:text-base">
            Photo {mainIdx + 1} of {images.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous"
              onClick={() => setMainIdx((i) => (i - 1 + images.length) % images.length)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/60 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label={isHovering ? 'Play slideshow' : 'Pause slideshow'}
              onClick={() => setIsHovering((h) => !h)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/60 transition"
            >
              {isHovering ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              aria-label="Next"
              onClick={() => setMainIdx((i) => (i + 1) % images.length)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/45 text-white hover:bg-black/60 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails track (swipe/scroll) */}
      <div className="mt-4 flex gap-2 sm:gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1">
        {images.map((img, idx) => (
          <button
            key={img}
            className={`snap-start rounded-xl border-2 ${idx === mainIdx ? 'border-primary ring-2 ring-primary/40' : 'border-muted'} overflow-hidden w-24 h-16 sm:w-28 sm:h-20 focus:outline-none transition-transform hover:scale-105 flex-shrink-0`}
            onClick={() => setMainIdx(idx)}
            aria-label={`Show image ${idx + 1}`}
          >
            {!loaded[idx] && <div className="w-full h-full animate-pulse bg-gray-200" />}
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" onLoad={() => onImgLoad(idx)} />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/90 backdrop-blur flex flex-col"
          onWheel={onWheelLightbox}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <div className="text-sm sm:text-base">Photo {mainIdx + 1} of {images.length}</div>
            <div className="flex items-center gap-2">
              <button aria-label="Zoom out" className="w-9 h-9 rounded bg-white/10 hover:bg-white/20" onClick={() => setZoom(z => Math.max(1, Number((z - 0.25).toFixed(2))))}>
                <ZoomOut className="mx-auto w-5 h-5 text-white" />
              </button>
              <button aria-label="Zoom in" className="w-9 h-9 rounded bg-white/10 hover:bg-white/20" onClick={() => setZoom(z => Math.min(4, Number((z + 0.25).toFixed(2))))}>
                <ZoomIn className="mx-auto w-5 h-5 text-white" />
              </button>
              <button aria-label="Close" className="w-9 h-9 rounded bg-white/10 hover:bg-white/20" onClick={closeLightbox}>
                <X className="mx-auto w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src={images[mainIdx]}
              alt={`Large view ${mainIdx + 1}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
              style={{ transform: `translate(-50%, -50%) scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
              draggable={false}
            />
            {/* arrows */}
            {images.length > 1 && (
              <>
                <button
                  aria-label="Prev"
                  onClick={() => setMainIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="Next"
                  onClick={() => setMainIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function TripInfoCard({ trip, onBook, onWishlist, displayDate, departLabel }: { trip: TripData; onBook: () => void; onWishlist: () => void; displayDate: string; departLabel: string | null }) {
  const priceFmt = (v: number | string | undefined) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(Number(v||0));
  const routeOptions = trip.routeOptions || [];
  const minRoutePrice = routeOptions.length ? Math.min(...routeOptions.map((r: RouteOption)=>Number(r.price)||0)) : null;
  const displayPriceValue = minRoutePrice !== null ? minRoutePrice : trip.price;
  const spots = trip.spotsAvailable ?? 0;
  const spotColor = spots <= 5 ? 'bg-red-50 text-red-600 ring-red-200' : spots <= 10 ? 'bg-amber-50 text-amber-600 ring-amber-200' : 'bg-emerald-50 text-emerald-600 ring-emerald-200';
  const availabilityLabel = spots === 0 ? 'Waitlist' : spots <=5 ? 'Last spots' : spots <=15 ? 'Filling fast' : 'Great availability';
  const subtitle = (() => {
    const hs = (trip.highlights||[]).slice(0,3).join(' • ');
    if (hs) return `${hs}`;
    return `${trip.location} • ${trip.duration}`;
  })();
  const safetyNarrative = trip.safetyRecord && trip.safetyRecord !== '—' ? `Safety: ${trip.safetyRecord}` : 'Safety focused experience';
  return (
    <Card className="p-6 md:p-7 shadow-2xl bg-white/95 border border-white/60 backdrop-blur rounded-2xl sticky top-24">
      <div className="flex flex-col gap-3">
  <h1 className="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight text-gray-900 dark:text-[var(--text)]">{trip.name}</h1>
        {/* Dynamic subtitle */}
        <p className="text-sm text-gray-600 leading-snug -mt-2 mb-1">{subtitle}</p>
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.location}</Badge>
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.7 ({(trip.reviews||[]).length || 12} reviews)</Badge>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Free cancellation</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant confirmation</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-primary" /> Secure payments</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4 text-indigo-600" /> Small group</span>
            <span className="hidden sm:inline-flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-600" /> {safetyNarrative}</span>
        </div>
        <div className="flex flex-wrap gap-2 my-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium ring-1 ring-blue-200">
            <Clock className="w-4 h-4 text-blue-500" /> {trip.duration}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ${spotColor}`}>
            <Users className="w-4 h-4" /> {spots} <span className="ml-1 font-normal">{availabilityLabel}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium ring-1 ring-indigo-200">
            <CalendarDays className="w-4 h-4 text-indigo-500" /> {displayDate}
            {departLabel && <span className="ml-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">{departLabel}</span>}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium ring-1 ring-emerald-200">
            <Shield className="w-4 h-4 text-emerald-500" /> {trip.safetyRecord}
          </span>
        </div>
        {/* Price + meta pills */}
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-end gap-2">
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent" title={String(displayPriceValue)}>
              {priceFmt(displayPriceValue)}{minRoutePrice !== null && <span className="ml-2 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full align-middle">FROM</span>}
            </div>
            <div className="text-xs md:text-sm font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary tracking-wide">per person</div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {displayDate}</div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 flex items-center gap-1.5 ${spotColor}`}><Users className="w-4 h-4" /> {spots} left</div>
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex items-center gap-1.5"><Shield className="w-4 h-4" /> Free cancellation</div>
            {departLabel && <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 flex items-center gap-1.5"><Clock className="w-4 h-4" /> {departLabel}</div>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Book button */}
          <motion.div className="flex-1" whileHover={{ scale:1.02 }} whileTap={{ scale:0.96 }}>
            <Button
              onClick={onBook}
              aria-label="Book this adventure"
              className="relative overflow-hidden w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-emerald-600 via-green-600 to-blue-600 text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:via-green-500 hover:to-blue-500 transition-all duration-300 group"
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
              <span className="relative flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                  <CalendarDays className="w-4 h-4" />
                </span>
                <span>Reserve Seat</span>
              </span>
            </Button>
          </motion.div>
          {/* Wishlist button */}
          <motion.div className="flex-1" whileHover={{ scale:1.02 }} whileTap={{ scale:0.95 }}>
            <Button
              variant="secondary"
              onClick={onWishlist}
              aria-label="Add to wishlist"
              className="relative w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-pink-50 via-rose-50 to-indigo-50 text-pink-700 hover:from-pink-100 hover:via-rose-100 hover:to-indigo-100 border border-pink-200/70 shadow-sm hover:shadow-md transition-all group"
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.25),transparent_65%)]" />
              <span className="relative flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-pink-100 text-pink-600 ring-1 ring-pink-300/60 group-hover:bg-pink-200 transition-colors">
                  <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </span>
                <span>Plan & Save</span>
              </span>
            </Button>
          </motion.div>
        </div>
        <div className="flex flex-col sm:flex-row text-[11px] text-gray-500 gap-2">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure booking • No hidden fees</span>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-pink-500" /> Save to plan later</span>
        </div>
      </div>
    </Card>
  );
}

function HighlightsList({ highlights }: { highlights: string[] }) {
  if (!highlights?.length) return null;
  const palette = [
    'from-pink-500/90 to-rose-500/90','from-sky-500/90 to-cyan-500/90','from-emerald-500/90 to-teal-500/90','from-amber-500/90 to-orange-500/90','from-violet-500/90 to-fuchsia-500/90','from-indigo-500/90 to-blue-500/90'
  ];
  const iconCycle = [Sparkles, Compass, Mountain, Sun, Leaf, Flame];
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 shadow-lg bg-gradient-to-br from-white/95 to-white/70 backdrop-blur pt-5 sm:pt-6 pb-4 px-4 sm:px-6 isolation-auto"
      initial={{ opacity:0, y:30 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-40px' }}
      transition={{ duration:0.6 }}
    >
      <div className="absolute -top-24 -right-24 w-64 sm:w-72 h-64 sm:h-72 bg-gradient-to-br from-primary/15 to-blue-400/15 blur-3xl rounded-full pointer-events-none" />
      <h2 className="text-xl sm:text-2xl font-oswald font-bold mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3 text-forest-green">
        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-adventure-orange drop-shadow" /> <span>Trip Highlights</span>
      </h2>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {highlights.map((h,i)=>{
          const Icon = iconCycle[i % iconCycle.length];
          return (
            <motion.div
              key={i}
              whileHover={{ y:-3 }}
              whileTap={{ scale:0.95 }}
              className={`group relative px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl shadow-md bg-gradient-to-r ${palette[i%palette.length]} text-white font-medium flex items-center gap-2 overflow-hidden text-xs sm:text-sm`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />
              <div className="relative z-10 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/15 backdrop-blur-sm shadow-inner">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
                <span className="tracking-wide drop-shadow-sm leading-snug">
                  {h}
                </span>
              </div>
            </motion.div>
          );})}
      </div>
    </motion.div>
  );
}
function SafetyChecklist({ safety }: { safety: string[] }) {
  if (!safety?.length) return null;
  return (
    <motion.div
      initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.55 }}
      className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/90 via-white/70 to-emerald-100/60 backdrop-blur px-6 py-6 shadow-inner shadow-emerald-900/5"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-emerald-700"><Shield className="w-6 h-6" /> Safety & Readiness</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {safety.map((s,i)=>{
          const isWarn = /avoid|not|don'?t|risk|danger|late/i.test(s) || i===safety.length-1;
          return (
            <motion.div
              key={i}
              whileHover={{ scale:1.04 }}
              className={`relative rounded-2xl px-4 py-3 flex items-start gap-3 border text-sm leading-snug bg-white/70 backdrop-blur shadow ${isWarn? 'border-red-200/70 text-red-700/90':'border-emerald-200/70 text-emerald-800/90'}`}
            >
              {isWarn ? <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />}
              <span>{s}</span>
              <div className={`absolute inset-0 rounded-2xl pointer-events-none ${isWarn? 'bg-gradient-to-br from-red-50/40 to-transparent':'bg-gradient-to-br from-emerald-50/40 to-transparent'}`} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
function GuideCard({ guide }: { guide: TripData['guide'] }) {
  if (!guide || !guide.name) return null;
  return (
    <Card className="mb-4"><div className="flex items-center gap-4 py-5 px-6"><Avatar className="w-16 h-16"><AvatarImage src={guide.avatar} alt={guide.name} /><AvatarFallback>{guide.name?.[0]}</AvatarFallback></Avatar><div><h2 className="font-semibold text-lg">Your Guide</h2><div className="font-bold text-primary">{guide.name} <span className="text-xs font-normal text-gray-500">({guide.experience})</span></div><div className="text-sm text-muted-foreground">{guide.expertise?.join(', ')}</div><div className="text-xs mt-1">Bio: {guide.bio || 'Experienced adventure guide.'}</div></div></div></Card>
  );
}

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast, success, error } = useToast();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<'overview' | 'itinerary' | 'equipment' | 'reviews'>(() => {
    const hash = (typeof window !== 'undefined' && window.location.hash.replace('#','')) || '';
    if (hash && ['overview','itinerary','equipment','reviews'].includes(hash)) return hash as 'overview' | 'itinerary' | 'equipment' | 'reviews';
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('trip:lastTab') || '') : '';
    if (stored && ['overview','itinerary','equipment','reviews'].includes(stored)) return stored as 'overview' | 'itinerary' | 'equipment' | 'reviews';
    return 'overview';
  });
  const tabScrollRef = useRef<HTMLDivElement|null>(null);
  const [hasLeftShade, setHasLeftShade] = useState(false);
  const [hasRightShade, setHasRightShade] = useState(false);
  const [mobileBarVisible, setMobileBarVisible] = useState(true);
  const lastScrollY = useRef<number>(0);
  const scrollingDownRef = useRef(false);
  const [showFab, setShowFab] = useState(false);

  // Haptic vibration helper (no-op if unsupported)
  const vibrate = (pattern: number | number[] = 15) => {
    try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) (navigator as Navigator & { vibrate: (pattern: number[]) => void }).vibrate(pattern); } catch {/* ignore */}
  };
  // Persist tab & sync hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.location.hash = tab;
    localStorage.setItem('trip:lastTab', tab);
    // Scroll active tab trigger into view (mobile)
    const container = tabScrollRef.current;
    if (container) {
      const activeEl = container.querySelector(`[data-tab-trigger='${tab}']`) as HTMLElement | null;
      if (activeEl) {
        const cRect = container.getBoundingClientRect();
        const aRect = activeEl.getBoundingClientRect();
        if (aRect.left < cRect.left || aRect.right > cRect.right) {
          container.scrollTo({ left: activeEl.offsetLeft - 32, behavior: 'smooth' });
        }
      }
      // update gradient states after potential scroll
      requestAnimationFrame(() => {
        const el = tabScrollRef.current; if (!el) return; const l = el.scrollLeft; const max = el.scrollWidth - el.clientWidth; setHasLeftShade(l > 4); setHasRightShade(l < max - 4);
      });
    }
  }, [tab]);
  // Initial gradient shading after mount
  useEffect(() => {
    const el = tabScrollRef.current; if (!el) return; const l = el.scrollLeft; const max = el.scrollWidth - el.clientWidth; setHasLeftShade(l > 4); setHasRightShade(l < max - 4);
  }, []);

  // Mobile action bar hide/show on scroll & floating CTA logic
  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      const diff = y - lastScrollY.current;
      const down = diff > 4;
      const up = diff < -6;
      if (down && y > 120) {
        if (!scrollingDownRef.current) { setMobileBarVisible(false); setShowFab(true); }
        scrollingDownRef.current = true;
      } else if (up || y < 120) {
        if (scrollingDownRef.current) { setMobileBarVisible(true); }
        if (y < 120) setShowFab(false);
        scrollingDownRef.current = false;
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  const [showBooking, setShowBooking] = useState(false);
  const [preRoute, setPreRoute] = useState<string>('');
  const initialLoadRef = useRef(true);
  const exitListenerRef = useRef<((e: MouseEvent)=>void) | null>(null);

  // Fetch trip from Firestore (realtime + cache to reduce flicker)
  useEffect(() => {
    if (!id) return;
    let unsub: (() => void) | undefined;
    setNotFound(false);
    const cached = tripCache.get(id);
    if (cached) {
      setTrip(cached);
      setLoadingTrip(false);
    } else if (initialLoadRef.current) {
      setLoadingTrip(true);
    } else {
      // keep previous trip visible while new loads (no skeleton flicker)
      setLoadingTrip(true);
    }
    try {
      if (!db) {
        console.error('Firestore database not available');
        setLoadingTrip(false);
        return;
      }
      unsub = onSnapshot(fsDoc(db, 'trips', id), (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          // only clear trip if first load
          if (initialLoadRef.current) setTrip(null);
          setLoadingTrip(false);
          return;
        }
        const data = snap.data() as Record<string, unknown>;
        const tripData: TripData = {
          id: snap.id,
          name: (data.name as string) || 'Untitled Trip',
          images: Array.isArray(data.images) && data.images.length ? data.images : ['https://via.placeholder.com/1200x800?text=Trip'],
          location: (data.location as string) || 'TBD',
          duration: (data.duration as string) || '—',
          spotsAvailable: (data.spotsAvailable as number) ?? (data.spots_available as number) ?? 0,
          nextDeparture: (data.nextDeparture as string) || (data.next_departure as string) || 'TBD',
          price: (data.price as number) ?? 0,
          safetyRecord: (data.safetyRecord as string) || (data.safety_record as string) || '—',
          itinerary: Array.isArray(data.itinerary) ? data.itinerary : [],
          safety: Array.isArray(data.safety) ? data.safety : [],
          guide: data.guide && typeof data.guide === 'object' ? data.guide as TripData['guide'] : undefined,
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          equipment: Array.isArray(data.equipment) ? data.equipment : [],
          essentials: Array.isArray(data.essentials) ? data.essentials : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
        };
  // Attach routeOptions if present (not originally part of TripData type)
  tripData.routeOptions = Array.isArray(data.routeOptions) ? data.routeOptions as RouteOption[] : [];
        tripCache.set(snap.id, tripData);
        startTransition(() => {
          setTrip(tripData);
          setLoadingTrip(false);
          initialLoadRef.current = false;
          if (!(preRoute) && tripData.routeOptions?.length) {
            setPreRoute(tripData.routeOptions[0].label);
          }
          trackTripView(tripData.id);
        });
        // attach exit intent outside transition (no cleanup return inside transition)
        const exitHandler = (e: MouseEvent) => { if (e.clientY <= 0) trackExitIntent(tripData.id); };
        window.addEventListener('mouseout', exitHandler);
        exitListenerRef.current = exitHandler;
      }, () => {
        setLoadingTrip(false);
        if (!tripCache.get(id)) setNotFound(true);
      });
    } catch {
      setLoadingTrip(false);
      if (!tripCache.get(id)) setNotFound(true);
    }
    return () => { 
      if (unsub) unsub(); 
      if (exitListenerRef.current) { window.removeEventListener('mouseout', exitListenerRef.current); exitListenerRef.current = null; }
    };
  }, [id, preRoute]);

  // Handlers
  const handleWhatsApp = async () => {
    if (!trip) return;
    try {
      const message = `Hi, I'm interested in ${trip.name} on ${trip.nextDeparture}. Could you share more details?`;
      await createLead({ source: 'whatsapp-cta', message, tripId: trip.id }).catch(()=>undefined);
      await sendWhatsApp({ to: '+1234567890', message }).catch(()=>undefined); // Replace with your WhatsApp Business number
      const waText = encodeURIComponent(message);
      window.open(`https://wa.me/1234567890?text=${waText}`, '_blank'); // Replace with your WhatsApp Business number
      toast({ title: 'Opening WhatsApp', description: 'Continuing the chat.' });
    } catch {
      const waText = encodeURIComponent(`Hi, I'm interested in ${trip.name}.`);
      window.open(`https://wa.me/1234567890?text=${waText}`, '_blank'); // Replace with your WhatsApp Business number
    }
  };
  const handleAddWishlist = async () => {
    if (!trip) return;
    try {
      await addToWishlist(Number(trip.id));
      success({ title: 'Added', description: 'Saved to your list.' });
    } catch (e: unknown) {
      const msg = String((e as Error)?.message || 'Please sign in');
      if (msg.includes('401') || msg.toLowerCase().includes('not authenticated')) {
        error({ title: 'Sign in required', description: 'Please sign in to save trips.' });
        setTimeout(() => navigate('/login', { state: { from: `/trip/${trip.id}` } }), 1200);
      } else {
        error({ title: 'Could not save', description: msg });
      }
    }
  };

  // Loading / not found states
  if (loadingTrip && !trip) {
    return (
      <main className="pt-32 pb-32 max-w-4xl mx-auto px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-2/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
          <div className="h-80 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_,i)=><div key={i} className="h-32 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />)}</div>
        </div>
      </main>
    );
  }
  if (notFound || !trip) {
    return (
      <main className="pt-40 pb-40 text-center px-6">
        <h1 className="text-3xl font-bold mb-4">Trip Not Found</h1>
        <p className="text-gray-600 mb-6">The trip may have been removed or the link is incorrect.</p>
        <Button onClick={() => navigate('/destinations')}>Back to Destinations</Button>
      </main>
    );
  }

  const departMeta = (() => {
    if (!trip?.nextDeparture || /TBA|—/i.test(trip.nextDeparture)) return { displayDate: trip?.nextDeparture || 'TBA', departLabel: null };
    const raw = new Date(trip.nextDeparture);
    if (isNaN(raw.getTime())) return { displayDate: trip.nextDeparture, departLabel: null };
    const displayDate = raw.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', weekday:'short' });
    const diffDays = Math.ceil((raw.getTime() - Date.now()) / 86400000);
    let departLabel: string | null = null;
    if (diffDays > 1) departLabel = `Departs in ${diffDays} days`;
    else if (diffDays === 1) departLabel = 'Departs tomorrow';
    else if (diffDays === 0) departLabel = 'Departs today';
    else if (diffDays < 0) departLabel = 'Departure passed';
    return { displayDate, departLabel };
  })();

  // Global pricing context (for sticky bars & hero) — mirrors logic inside TripInfoCard
  const routeOptions = trip.routeOptions || [];
  const minRoutePrice = routeOptions.length ? Math.min(...routeOptions.map((r: RouteOption) => Number(r.price) || 0)) : null;
  const displayPriceValue = minRoutePrice !== null ? minRoutePrice : trip.price;

  return (
  <main className="relative overflow-hidden min-h-screen pt-24 md:pt-28 pb-52 md:pb-44 bg-[var(--bg)] dark:bg-[var(--bg)]">
      {/* loading overlay when switching between trips but keeping previous content */}
      {loadingTrip && trip && (
        <div className="pointer-events-none fixed top-24 right-4 z-50 animate-pulse rounded-full bg-white/70 backdrop-blur px-4 py-2 text-xs font-medium text-gray-700 shadow">Updating…</div>
      )}
      {/* Decorative background blobs for depth */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />

      <div className="relative px-3 sm:px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Destinations', href: '/destinations' }, { label: trip.name }]} />
          <button onClick={() => navigate(-1)} className="text-sm text-blue-700 hover:underline mb-4">← Back</button>
        </div>

        {/* Hero (static, simplified to prevent flicker from second WebGL context) */}
  <section className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-2xl bg-gradient-to-br from-white/70 to-blue-50/60 dark:from-[var(--surface)]/70 dark:to-[var(--surface-alt)]/60 backdrop-blur mb-10">
          <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.25),transparent_70%)]" />
          <div className="relative px-6 py-14 md:px-12 md:py-16">
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-oswald font-extrabold tracking-tight text-forest-green drop-shadow-sm">{trip.name}</h1>
              {loadingTrip && (<div className="mt-2 text-xs text-blue-700/80">Updating trip details…</div>)}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <Badge variant="secondary" className="bg-blue-50/80 text-blue-700 flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.location}</Badge>
                <Badge variant="secondary" className="bg-yellow-50/80 text-yellow-700 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 4.7 (12)</Badge>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Top Section: Responsive Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3"><Card className="p-0 overflow-hidden"><ImageGallery images={trip.images} /></Card></div>
          <div className="md:col-span-2"><TripInfoCard trip={trip} onBook={()=>{ trackBookClick(trip.id); setShowBooking(true);} } onWishlist={handleAddWishlist} displayDate={departMeta.displayDate} departLabel={departMeta.departLabel} /></div>
        </div>

  {/* Tabs */}
  <Tabs value={tab} onValueChange={(v)=>setTab(v as 'overview' | 'itinerary' | 'equipment' | 'reviews')} className="max-w-4xl mx-auto mt-12">
          {/* Sticky / scrollable tab bar for mobile with gradient edge fades */}
          <div className="sticky top-20 z-30 md:static md:top-auto mb-6 sm:mb-7">
            <div className="relative">
              <div
                ref={tabScrollRef}
                onScroll={() => {
                  const el = tabScrollRef.current; if (!el) return; const l = el.scrollLeft; const max = el.scrollWidth - el.clientWidth; setHasLeftShade(l > 4); setHasRightShade(l < max - 4);
                }}
                className="bg-white/80 dark:bg-[var(--surface)]/80 backdrop-blur border border-[var(--border)] shadow-sm rounded-xl px-2 py-2 overflow-x-auto md:overflow-visible scroll-smooth scrollbar-none"
              >
              <TabsList className="flex gap-2 min-w-max">
                <TabsTrigger
                  value="overview"
                  data-tab-trigger="overview"
                  className="relative rounded-lg px-4 py-2 text-sm sm:text-base font-medium data-[state=active]:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
                >
                  {tab === 'overview' && (
                    <motion.span layoutId="tabBubble" className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-100 to-blue-100 ring-1 ring-primary/20" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                  )}
                  <span className="relative">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="itinerary"
                  data-tab-trigger="itinerary"
                  className="relative rounded-lg px-4 py-2 text-sm sm:text-base font-medium data-[state=active]:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
                >
                  {tab === 'itinerary' && (
                    <motion.span layoutId="tabBubble" className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 ring-1 ring-primary/20" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                  )}
                  <span className="relative">Itinerary</span>
                </TabsTrigger>
                <TabsTrigger
                  value="equipment"
                  data-tab-trigger="equipment"
                  className="relative rounded-lg px-4 py-2 text-sm sm:text-base font-medium data-[state=active]:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
                >
                  {tab === 'equipment' && (
                    <motion.span layoutId="tabBubble" className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 ring-1 ring-primary/20" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                  )}
                  <span className="relative">Equipment</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  data-tab-trigger="reviews"
                  className="relative rounded-lg px-4 py-2 text-sm sm:text-base font-medium data-[state=active]:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap"
                >
                  {tab === 'reviews' && (
                    <motion.span layoutId="tabBubble" className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 ring-1 ring-primary/20" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                  )}
                  <span className="relative">Reviews</span>
                </TabsTrigger>
              </TabsList>
              </div>
              {/* Edge gradients (show only when overflow) */}
              {hasLeftShade && <div className="pointer-events-none absolute inset-y-0 left-0 w-8 rounded-l-xl bg-gradient-to-r from-white/90 dark:from-[var(--surface)]/90 to-transparent" />}
              {hasRightShade && <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-xl bg-gradient-to-l from-white/90 dark:from-[var(--surface)]/90 to-transparent" />}
            </div>
            </div>
          <TabsContent value="overview" className="space-y-5 relative z-10">
            <div className="mt-4 sm:mt-6">
              <HighlightsList highlights={trip.highlights || []} />
            </div>
            {/* Route Options Preview (pre-booking) */}
            {(trip.routeOptions || []).length>0 && (
              <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-blue-50/70 backdrop-blur p-4 sm:p-5 shadow-inner">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-emerald-700"><CalendarDays className="w-4 h-4" /> Available Routes & Pricing</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.routeOptions!.map((r: RouteOption)=>{
                    const active = preRoute ? preRoute===r.label : false;
                    return (
                      <button key={r.label} type="button" onClick={()=>{ setPreRoute(r.label); trackRouteSelect(trip.id, r.label); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition ${active ? 'bg-emerald-600 text-white ring-emerald-400 shadow':'bg-white/80 text-gray-700 ring-emerald-300/40 hover:bg-white'}`}>{r.label}<span className="ml-1 opacity-70">₹{Number(r.price).toLocaleString('en-IN')}</span></button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-gray-500">Select a route to prefill booking. Final price shown after choosing participants.</p>
              </div>
            )}
            <SafetyChecklist safety={trip.safety || []} />
            {trip.guide && <GuideCard guide={trip.guide} />}
            {/* Recommended Products moved inside Overview for better mobile UX */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 text-forest-green">Recommended Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.slice(0,3).map(product => (
                  <div key={product.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg mb-2" />
                    <div className="font-semibold mb-1 text-center">{product.name}</div>
                    <div className="text-mountain-blue font-bold mb-2">₹{product.price}</div>
                    <Button size="sm" variant="adventure" onClick={() => window.location.href='/shop'}>Shop Now</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="itinerary" className="bg-white/95 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-white/60 relative z-10">
            <div className="mt-2 sm:mt-4" />
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-mountain-blue">
              <Mountain className="w-7 h-7 text-primary" /> Day-by-Day Itinerary
            </h2>
            <p className="text-sm text-gray-600 mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> A visual journey of each day with key moments.</p>
            {/* Dynamic icon chooser based on step keywords */}
            {(() => {
              const icons = [Compass, Mountain, Sun, Leaf, Flame, Backpack];
              const pickIcon = (t: string, i: number) => {
                if (/camp|tent|bonfire|night/i.test(t)) return Flame;
                if (/summit|peak|ascent|climb/i.test(t)) return Mountain;
                if (/hike|trek|trail|walk/i.test(t)) return Compass;
                if (/sunrise|sunset|dawn|morning/i.test(t)) return Sun;
                if (/forest|jungle|green|meadow|valley/i.test(t)) return Leaf;
                if (/pack|gear|briefing/i.test(t)) return Backpack;
                return icons[i % icons.length];
              };
              return (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/15 to-transparent pointer-events-none" />
                  <ol className="space-y-8 list-none m-0 p-0">
                    {(trip.itinerary || []).map((step, index) => {
                      const Icon = pickIcon(step, index);
                      return (
                        <motion.li
                          key={index}
                          initial={{ opacity:0, x:-22 }}
                          whileInView={{ opacity:1, x:0 }}
                          viewport={{ once:true, margin:'-20px' }}
                          transition={{ duration:0.45, delay:index*0.04 }}
                          className="relative pl-16 sm:pl-20 group"
                        >
                          {/* Day badge */}
                          <div className="absolute left-0 top-1 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-white flex flex-col items-center justify-center font-semibold shadow-lg ring-2 ring-white/40 group-hover:scale-105 transition-transform text-[11px] sm:text-[10px]">
                            <span className="text-[9px] sm:text-[10px] tracking-wide font-normal opacity-80">DAY</span>
                            <span className="text-sm sm:text-base leading-none">{index+1}</span>
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/30 to-blue-500/30 blur opacity-0 group-hover:opacity-60 transition-opacity" />
                          </div>
                          {/* Connector dot */}
                          <span className="absolute left-5 sm:left-6 top-7 -ml-[3px] w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20 shadow" />
                          {/* Card */}
                          <motion.div whileHover={{ y:-4 }} className="relative p-4 sm:p-5 rounded-2xl border border-white/70 bg-gradient-to-br from-white/95 to-blue-50/70 backdrop-blur-sm shadow-sm group-hover:shadow-xl transition-all">
                            <div className="flex items-start gap-3 sm:gap-4">
                              <div className="mt-0.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <p className="text-sm sm:text-[15px] leading-relaxed font-medium text-gray-800">{step}</p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {/sunrise|sunset/i.test(step) && <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700 font-medium">Golden Light</span>}
                                  {/camp|tent/i.test(step) && <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 font-medium">Camp</span>}
                                  {/summit|peak/i.test(step) && <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-medium">Summit</span>}
                                  {/hike|trek/i.test(step) && <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 font-medium">Trail</span>}
                                  {/forest|jungle/i.test(step) && <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-100 text-green-700 font-medium">Forest</span>}
                                  {/river|stream|lake/i.test(step) && <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-100 text-cyan-700 font-medium">Water</span>}
                                </div>
                              </div>
                            </div>
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/25 transition" />
                          </motion.div>
                          {/* Gradient connector fade below each item except last */}
                          {index < (trip.itinerary?.length || 0) - 1 && (
                            <div className="absolute left-6 top-16 w-px h-10 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
                          )}
                        </motion.li>
                      );
                    })}
                    {(!trip.itinerary || trip.itinerary.length === 0) && (
                      <li className="text-sm text-gray-500 pl-2">Itinerary coming soon.</li>
                    )}
                  </ol>
                </div>
              );
            })()}
          </TabsContent>
          <TabsContent value="equipment" className="bg-gradient-to-br from-white/95 to-blue-50/80 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-white/60 relative z-10">
            <div className="mt-2 sm:mt-4" />
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-forest-green"><Backpack className="w-6 h-6" /> Gear & Essentials</h2>
            <p className="text-base text-gray-600 mb-6 flex items-center gap-2"><Sun className="w-5 h-5 text-amber-500" /> Pack smart to stay comfortable and safe.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-mountain-blue"><Flame className="w-5 h-5 text-orange-500" /> Recommended Gear</h3>
                <ul className="space-y-2">
                  {(trip.equipment||[]).map((item,i)=>{
                    const { Icon, cls } = gearIconMeta(item);
                    return (
                      <motion.li key={i} whileHover={{ x:6 }} className="flex items-start gap-3 text-[15px] group">
                        <span className={`mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-xl ring-1 ${cls} backdrop-blur-sm shadow-inner group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-mountain-blue"><Leaf className="w-5 h-5 text-green-600" /> Essentials</h3>
                <ul className="space-y-2">
                  {(trip.essentials||[]).map((item,i)=>{
                    const { Icon, cls } = gearIconMeta(item);
                    return (
                      <motion.li key={i} whileHover={{ x:6 }} className="flex items-start gap-3 text-[15px] group">
                        <span className={`mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-xl ring-1 ${cls} backdrop-blur-sm shadow-inner group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="bg-gradient-to-br from-white/95 to-emerald-50/80 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-white/60 relative z-10">
            <div className="mt-2 sm:mt-4" />
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-forest-green"><span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary/15 text-primary font-semibold">★</span> Traveler Reviews</h2>
            <ul className="space-y-5">
              {(trip.reviews||[]).map((r,i)=>(
                <motion.li key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.05 }} className="relative p-5 rounded-2xl border border-white/70 bg-white/80 backdrop-blur shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 text-white font-semibold flex items-center justify-center shadow-md">{r.author?.[0]||'A'}</div>
                    <div className="flex-1">
                      <p className="text-gray-700 italic leading-relaxed">“{r.text}”</p>
                      <div className="mt-2 text-sm font-medium text-primary flex items-center gap-3">
                        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />4.{7 + (i%3)}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">Verified</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{new Date().getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-blue-400/40 blur-xl opacity-60" />
                </motion.li>
              ))}
              {(!trip.reviews || trip.reviews.length===0) && (
                <div className="text-sm text-gray-500">No reviews yet. Be the first adventurer!</div>
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Flow Overlay */}
      {showBooking && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full md:max-w-2xl md:rounded-2xl md:shadow-2xl md:overflow-hidden animate-in fade-in slide-in-from-bottom md:slide-in-from-bottom-0 duration-300">
            <BookingFlow
              tripId={trip.id}
              tripName={trip.name}
              basePrice={Number(trip.price)||0}
              nextDeparture={trip.nextDeparture}
              spotsAvailable={trip.spotsAvailable}
              routeOptions={trip.routeOptions || []}
              initialRoute={preRoute}
              onComplete={(b)=>{ setShowBooking(false); navigate(`/payment?booking=${b.id}&amount=${b.price}&trip=${trip.id}`); }}
              onCancel={()=>setShowBooking(false)}
            />
          </div>
        </div>
      )}

      {/* Sticky bottom bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden pointer-events-none">
        <div className={`transition-all duration-300 ${mobileBarVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} pointer-events-auto mx-3 mb-3 rounded-2xl border shadow-lg bg-white/95 backdrop-blur px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex flex-col gap-3`}> 
          {/* Price & meta */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">From</span>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent leading-none">₹{displayPriceValue?.toLocaleString('en-IN')}</span>{minRoutePrice!==null && <span className="text-[10px] ml-1 font-medium text-emerald-600">FROM</span>}
                <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-primary/10 text-primary">/person</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium text-gray-600">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"><CalendarDays className="w-3.5 h-3.5" /> {departMeta.displayDate}</span>
                {departMeta.departLabel && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700"><Clock className="w-3.5 h-3.5" /> {departMeta.departLabel.replace('Departs ','In ')}</span>}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${(trip.spotsAvailable??0) <=5 ? 'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-600'} `}><Users className="w-3.5 h-3.5" /> {(trip.spotsAvailable)||0}</span>
              </div>
            </div>
            <Button
              onClick={()=>setShowBooking(true)}
              aria-label="Book now"
              className="hidden xs:flex h-11 px-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-semibold shadow-lg shadow-primary/30 hover:from-primary/90 hover:to-blue-500 transition-all"
            >
              <CalendarDays className="w-4 h-4 mr-1" /> Book
            </Button>
          </div>
          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={()=>{ vibrate(); window.open('tel:+919999999999','_self'); }}
              aria-label="Call us"
              className="h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-medium bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-sm"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-200/70 text-slate-700"><PhoneCall className="w-4 h-4" /></span>
              Call
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={()=>{ vibrate(); handleWhatsApp(); }}
              aria-label="Chat on WhatsApp"
              className="h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-medium bg-gradient-to-b from-emerald-600 to-green-600 text-white shadow group"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 ring-1 ring-white/30"><MessageCircle className="w-4 h-4" /></span>
              WhatsApp
            </Button>
            <Button
              type="button"
              onClick={()=>{ vibrate([10,40,20]); setShowBooking(true);} }
              aria-label="Book now"
              className="h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-semibold bg-gradient-to-b from-primary via-blue-600 to-indigo-600 text-white shadow-lg shadow-primary/30"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 ring-1 ring-white/30"><CalendarDays className="w-4 h-4" /></span>
              Book Now
            </Button>
          </div>
        </div>
        {/* Floating mini CTA when bar hidden */}
        {showFab && !mobileBarVisible && (
          <button
            onClick={()=>{ vibrate(10); setMobileBarVisible(true); }}
            aria-label="Show booking actions"
            className="pointer-events-auto absolute bottom-[5.5rem] right-4 rounded-full shadow-xl bg-gradient-to-br from-primary to-blue-600 text-white w-14 h-14 flex items-center justify-center ring-2 ring-white/40 active:scale-95 transition"
          >
            <CalendarDays className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Sticky bottom bar (desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-30 hidden md:block">
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="rounded-2xl border shadow-lg bg-white/95 backdrop-blur px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-end gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">From</span>
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">₹{displayPriceValue?.toLocaleString('en-IN')}</span>{minRoutePrice!==null && <span className="text-[10px] ml-1 font-medium text-emerald-600">FROM</span>}
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">/person</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200"><CalendarDays className="w-3.5 h-3.5" /> Next: {departMeta.displayDate}</span>
                  {departMeta.departLabel && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"><Clock className="w-3.5 h-3.5" /> {departMeta.departLabel}</span>}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ring-1 ${(trip.spotsAvailable??0)<=5 ? 'bg-red-50 text-red-600 ring-red-200':'bg-emerald-50 text-emerald-600 ring-emerald-200'}`}><Users className="w-3.5 h-3.5" /> {(trip.spotsAvailable)||0} left</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"><Shield className="w-3.5 h-3.5" /> Free cancellation</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Call */}
              <Button
                variant="secondary"
                onClick={()=>window.open('tel:+919999999999','_self')}
                aria-label="Call us"
                className="relative h-11 px-4 rounded-xl bg-gradient-to-r from-slate-50 to-white text-slate-700 border border-slate-200 hover:from-slate-100 hover:to-white shadow-sm hover:shadow group"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-200/70 group-hover:bg-slate-300/70 flex items-center justify-center text-slate-700 transition-colors"><PhoneCall className="w-4 h-4" /></span>
                  <span className="text-sm font-medium">Call</span>
                </span>
              </Button>
              {/* WhatsApp */}
              <Button
                variant="secondary"
                onClick={handleWhatsApp}
                aria-label="Chat on WhatsApp"
                className="relative h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg shadow-primary/30 hover:from-primary/90 hover:to-blue-500 transition-all group"
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,0.35),transparent_60%)] transition-opacity" />
                <span className="inline-flex items-center gap-2 relative">
                  <span className="w-7 h-7 rounded-lg bg-white/20 ring-1 ring-white/30 flex items-center justify-center"><MessageCircle className="w-4 h-4" /></span>
                  <span className="text-sm font-semibold">WhatsApp</span>
                </span>
              </Button>
              {/* Book Now */}
              <Button
                onClick={() => setShowBooking(true)}
                aria-label="Book this trip now"
                className="relative h-11 px-6 rounded-xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-primary/30 hover:from-primary/90 hover:via-blue-500 hover:to-indigo-500 transition-all group"
              >
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.35),transparent_65%)] transition-opacity" />
                <span className="inline-flex items-center gap-2 relative">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm">Book Now</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Helper (placed before usage): pick an icon & colorful style for gear / essentials items
const gearIconMeta = (label: string) => {
  const l = label.toLowerCase();
  if (/backpack|rucksack|bag/.test(l)) return { Icon: Backpack, cls: 'bg-emerald-500/15 text-emerald-600 ring-emerald-300/40' };
  if (/trek|shoe|boot|foot|hike/.test(l)) return { Icon: Mountain, cls: 'bg-orange-500/15 text-orange-600 ring-orange-300/40' };
  if (/rain|jacket|shell|poncho|waterproof/.test(l)) return { Icon: Leaf, cls: 'bg-sky-500/15 text-sky-600 ring-sky-300/40' }; // using Leaf as rain gear fallback
  if (/headlamp|lamp|flash|torch/.test(l)) return { Icon: Sun, cls: 'bg-amber-500/15 text-amber-600 ring-amber-300/40' };
  if (/water|bottle|hydration|2l/.test(l)) return { Icon: DropletFallback, cls: 'bg-cyan-500/15 text-cyan-600 ring-cyan-300/40' }; // custom droplet fallback
  if (/id|identity|passport|license|proof/.test(l)) return { Icon: Shield, cls: 'bg-violet-500/15 text-violet-600 ring-violet-300/40' };
  if (/energy|bar|snack|nutrition/.test(l)) return { Icon: Flame, cls: 'bg-rose-500/15 text-rose-600 ring-rose-300/40' };
  if (/med|tablet|first aid|medicine/.test(l)) return { Icon: Shield, cls: 'bg-red-500/15 text-red-600 ring-red-300/40' };
  if (/sun|light/.test(l)) return { Icon: Sun, cls: 'bg-yellow-500/15 text-yellow-600 ring-yellow-300/40' };
  return { Icon: Shield, cls: 'bg-gray-500/10 text-gray-600 ring-gray-300/40' };
};
// Simple internal fallback droplet icon (SVG) since lucide lacks Droplet variant we want
const DropletFallback: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2.5c-2.5 4.5-7 8-7 12a7 7 0 0 0 14 0c0-4-4.5-7.5-7-12z" />
  </svg>
);
