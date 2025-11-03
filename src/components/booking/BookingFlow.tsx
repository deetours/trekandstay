import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Users, Shield, User, Phone, Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Globe2, Lock, Flame, Clock as ClockIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useToast } from '../ui/useToast';
import { createBooking, createLead, acquireSeatLock as apiAcquireSeatLock, refreshSeatLock as apiRefreshSeatLock, releaseSeatLock as apiReleaseSeatLock } from '../../utils/api';
import { useAdventureStore } from '../../store/adventureStore';
import { trackBookingOpen, trackBookingClose } from '../../utils/tracking';

interface BookingFlowBooking {
  id: number;
  tripId: string | number;
  customer: { name: string; phone: string; email: string };
  groupSize: number;
  route: string;
  date: string;
  price: number;
}

interface BookingFlowProps {
  tripId: string | number;
  tripName: string;
  basePrice: number;
  nextDeparture?: string;
  spotsAvailable?: number;
  availableSlots?: number;
  isAvailable?: boolean;
  routeOptions?: { label: string; price: number }[]; // optional route choices
  initialRoute?: string; // preselected route coming from outer page
  onComplete?: (booking: BookingFlowBooking) => void;
  onCancel?: () => void;
}

interface SeatLockState { id?: number; lockedAt: number; expiresAt: number; seats: number; }

export const BookingFlow: React.FC<BookingFlowProps> = ({ tripId, tripName, basePrice, nextDeparture, spotsAvailable, availableSlots, isAvailable = true, routeOptions = [], initialRoute, onComplete, onCancel }) => {
  const openTrackedRef = useRef(false);
  useEffect(() => {
    if (!openTrackedRef.current) {
      trackBookingOpen(tripId);
      openTrackedRef.current = true;
    }
    return () => {
      // If component unmounts before submit completed => abandoned
      if (!completedRef.current) {
        trackBookingClose(tripId, true);
      } else {
        trackBookingClose(tripId, false);
      }
    };
  }, [tripId]);
  const completedRef = useRef(false);
  const { user } = useAdventureStore();
  const { success, error } = useToast();
  const [step, setStep] = useState(1);
  const [groupSize, setGroupSize] = useState(1);
  const [route, setRoute] = useState<string>(initialRoute || routeOptions[0]?.label || '');
  const [touchedRoute, setTouchedRoute] = useState(false);
  // Sync external initialRoute if provided (and user hasn't changed selection yet)
  useEffect(() => {
    if (touchedRoute) return;
    if (initialRoute && routeOptions.some(r=>r.label===initialRoute)) {
      setRoute(initialRoute);
    }
  }, [initialRoute, routeOptions, touchedRoute]);
  const [date, setDate] = useState<string>(nextDeparture || '');
  const [customer, setCustomer] = useState({ name: user?.name || '', phone: '', email: user?.email || '' });
  const [medical, setMedical] = useState('');
  const [diet, setDiet] = useState('');
  const [loading, setLoading] = useState(false);
  const [seatLock, setSeatLock] = useState<SeatLockState | null>(null);
  const [lockExpired, setLockExpired] = useState(false);

  // Acquire seat lock locally (would call backend in prod)
  const acquireSeatLock = useCallback(async () => {
    if (seatLock?.id) return;
    try {
      const res = await apiAcquireSeatLock(Number(tripId), groupSize);
      if (!res) throw new Error('No response');
      const now = Date.now();
      setSeatLock({ id: res.id, lockedAt: now, expiresAt: new Date(res.expires_at).getTime(), seats: res.seats });
      setLockExpired(false);
    } catch (e) {
      error({ title: 'Seat Lock Failed', description: e instanceof Error ? e.message : String(e) });
    }
  }, [seatLock, groupSize, tripId, error]);

  // Heartbeat refresh every 2 minutes
  useEffect(() => {
    if (!seatLock?.id || lockExpired) return;
    const interval = setInterval(async () => {
      try {
        const refreshed = await apiRefreshSeatLock(seatLock.id!);
        if (refreshed)
          setSeatLock(sl => sl ? { ...sl, expiresAt: new Date(refreshed.expires_at).getTime() } : sl);
      } catch {
        setLockExpired(true);
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [seatLock, lockExpired]);

  // Countdown effect
  useEffect(() => {
    if (!seatLock) return;
    const id = setInterval(() => {
      if (Date.now() >= seatLock.expiresAt) {
        setLockExpired(true);
        setSeatLock(null);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [seatLock]);

  const timeLeft = seatLock ? Math.max(0, seatLock.expiresAt - Date.now()) : 0;
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const canContinueFromStep = () => {
    if (!isAvailable) return false;
    if (step === 1) {
      if (!date || groupSize <= 0) return false;
      if (routeOptions.length && !route) return false;
      return true;
    }
    if (step === 2) return customer.name.trim() && customer.phone.trim();
    return true;
  };

  const goNext = () => {
    if (!canContinueFromStep()) return;
    if (step === 1 && !seatLock) acquireSeatLock();
    setStep(s => s + 1);
  };
  const goPrev = () => setStep(s => Math.max(1, s - 1));

  const effectiveBase = (() => {
    if (!routeOptions.length) return basePrice;
    const found = routeOptions.find(r=>r.label===route);
    return found ? found.price : basePrice;
  })();
  const total = effectiveBase * groupSize;

  const submit = async () => {
    if (!isAvailable) {
      error({ title: 'Trip Unavailable', description: 'This trip is no longer available for booking.' });
      return;
    }
    setLoading(true);
    try {
      if (!seatLock?.id || lockExpired) throw new Error('Seat lock expired. Go back to re-lock seats.');
      await createLead({ source: 'book-flow', message: `Booking ${tripName}`, tripId: tripId });
      const bookingResult = await createBooking({ destination: tripName, date: date || new Date().toISOString(), trip: Number(tripId), seats: groupSize, seat_lock: seatLock.id, route, amount: total });
      success({ title: 'Booking Created', description: 'Advance payment initiated.' });
      completedRef.current = true;
      const booking: BookingFlowBooking = {
        id: bookingResult.id,
        tripId: tripId,
        customer: {
          name: user?.name || '',
          phone: '',
          email: user?.email || ''
        },
        groupSize,
        route,
        date: date || new Date().toISOString(),
        price: total
      };
      onComplete?.(booking);
    } catch (e) {
      error({ title: 'Failed', description: e instanceof Error ? e.message : 'Could not create booking.' });
    } finally {
      setLoading(false);
    }
  };

  // Reset lock if group size changes significantly before step 3
  useEffect(() => {
    if (seatLock && step < 3 && seatLock.seats !== groupSize) {
      // release and reacquire
      setSeatLock(null);
      acquireSeatLock();
    }
  }, [groupSize, step, seatLock, acquireSeatLock]);

  // Improved step indicator with labels (removes stray raw numbers layout issues)
  const StepIndicator = () => {
    const stepsMeta = [
      { n:1, label:'Details' },
      { n:2, label:'Guest Info' },
      { n:3, label:'Review' }
    ];
    return (
      <div className="flex items-start justify-center mb-6 gap-3 select-none" aria-label={`Booking progress step ${step} of 3`}>
        {stepsMeta.map((s, idx) => {
          const active = s.n === step;
          const complete = s.n < step;
          return (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center min-w-[3.25rem]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ring-2 transition-all ${active ? 'bg-emerald-600 text-white ring-emerald-400 shadow-lg shadow-emerald-600/30' : ''} ${complete ? 'bg-emerald-500 text-white ring-emerald-400' : ''} ${!active && !complete ? 'bg-white text-gray-600 ring-gray-200' : ''}`}
                >
                  {complete ? <CheckCircle2 className="w-5 h-5" /> : s.n}
                </div>
                <span className={`mt-1 text-[11px] font-medium tracking-wide ${active || complete ? 'text-emerald-600' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {idx < stepsMeta.length - 1 && (
                <div className={`mt-5 h-1 w-10 rounded-full transition-colors ${step > s.n ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-6 md:p-7 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Reserve Your Seat</h2>
        <p className="text-sm text-gray-600 mb-4">Secure your spot for <span className="font-semibold">{tripName}</span>. Complete the steps to proceed to payment.</p>
        <StepIndicator />

        {/* Capacity Warning */}
        {!isAvailable && (
          <div className="mb-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> This trip is fully booked. Please check back later or choose another trip.
          </div>
        )}
        {isAvailable && availableSlots !== undefined && availableSlots <= 2 && availableSlots > 0 && (
          <div className="mb-4 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg flex items-center gap-2">
            <Flame className="w-4 h-4" /> Only {availableSlots} spot{availableSlots === 1 ? '' : 's'} left! Book now before it's too late.
          </div>
        )}
        {isAvailable && availableSlots !== undefined && availableSlots > 2 && availableSlots <= 5 && (
          <div className="mb-4 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg flex items-center gap-2">
            <ClockIcon className="w-4 h-4" /> Limited availability: Only {availableSlots} spots remaining.
          </div>
        )}

        {seatLock && !lockExpired && (
          <div className="mb-4 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-2">
            <Shield className="w-4 h-4" /> Seats locked for {minutes}:{seconds.toString().padStart(2,'0')} minutes
          </div>
        )}
        {lockExpired && (
          <div className="mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Seat lock expired. Adjust details to relock.
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} className="space-y-6">
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><CalendarDays className="w-4 h-4 text-primary" /> Departure Date</label>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><Users className="w-4 h-4 text-primary" /> Group Size</label>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={()=>setGroupSize(g=>Math.max(1,g-1))}>-</Button>
                  <span className="w-12 text-center font-semibold">{groupSize}</span>
                  <Button variant="secondary" size="sm" onClick={()=>setGroupSize(g=>Math.min(20,g+1))}>+</Button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{availableSlots ?? spotsAvailable ?? 0} spots left. We tentatively lock your seats.</p>
              </div>
              {routeOptions.length>0 && (
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2"><Lock className="w-4 h-4 text-primary" /> Route</label>
                  <div className="flex flex-wrap gap-2">
                    {routeOptions.map(o => (
                      <button key={o.label} type="button" onClick={()=>{ setRoute(o.label); setTouchedRoute(true); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ring-1 transition ${route===o.label ? 'bg-emerald-600 text-white ring-emerald-400 shadow':'bg-white text-gray-600 ring-gray-300 hover:bg-gray-50'}`}>
                        {o.label}
                        <span className="opacity-70 ml-1">₹{o.price.toLocaleString('en-IN')}</span>
                      </button>
                    ))}
                  </div>
                  {!route && <p className="text-[11px] text-red-500 mt-1">Select a route to continue.</p>}
                </div>
              )}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100/70 rounded-xl p-4 text-sm flex flex-col gap-1">
                <div className="flex items-center justify-between"><span className="text-gray-600">Base price</span><span className="font-medium">₹{effectiveBase.toLocaleString('en-IN')}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-600">Participants</span><span className="font-medium">× {groupSize}</span></div>
                <div className="border-t border-emerald-200 my-1" />
                <div className="flex items-center justify-between text-lg font-bold"><span>Total</span><span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">₹{total.toLocaleString('en-IN')}</span></div>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><User className="w-4 h-4 text-primary" /> Full Name</label>
                  <input value={customer.name} onChange={e=>setCustomer(c=>({ ...c, name:e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none" placeholder="Your name" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><Phone className="w-4 h-4 text-primary" /> Phone</label>
                  <input value={customer.phone} onChange={e=>setCustomer(c=>({ ...c, phone:e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none" placeholder="10-digit mobile" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><Mail className="w-4 h-4 text-primary" /> Email</label>
                  <input value={customer.email} onChange={e=>setCustomer(c=>({ ...c, email:e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><Globe2 className="w-4 h-4 text-primary" /> Dietary</label>
                  <input value={diet} onChange={e=>setDiet(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none" placeholder="Veg / Non-veg / Allergies" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1"><Shield className="w-4 h-4 text-primary" /> Medical / Notes</label>
                <textarea value={medical} onChange={e=>setMedical(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:outline-none resize-none" placeholder="Any medical conditions we should know" />
                <p className="text-[11px] text-gray-500 mt-1">Shared only with trek leaders for your safety.</p>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} className="space-y-6">
              <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50 p-4 text-sm">
                <h3 className="font-semibold mb-2">Review & Confirm</h3>
                <ul className="space-y-1">
                  <li className="flex justify-between"><span className="text-gray-600">Trip</span><span className="font-medium">{tripName}</span></li>
                  <li className="flex justify-between"><span className="text-gray-600">Departure</span><span className="font-medium">{date || nextDeparture || 'TBA'}</span></li>
                  {routeOptions.length > 0 && <li className="flex justify-between"><span className="text-gray-600">Route</span><span className="font-medium">{route || '—'}</span></li>}
                  <li className="flex justify-between"><span className="text-gray-600">Participants</span><span className="font-medium">{groupSize}</span></li>
                  <li className="flex justify-between"><span className="text-gray-600">Total</span><span className="font-bold">₹{total.toLocaleString('en-IN')}</span></li>
                </ul>
                {!seatLock && <div className="mt-3 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Seats not locked. Go back one step to re-lock.</div>}
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">By confirming you agree to our cancellation & safety policies. You will be redirected to payment to complete an advance (if applicable).</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" disabled={step===1} onClick={goPrev}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          {step < 3 && <Button onClick={goNext} disabled={!canContinueFromStep()}>{step===1 ? 'Continue' : 'Continue'} <ArrowRight className="w-4 h-4 ml-1" /></Button>}
          {step === 3 && <Button onClick={submit} loading={loading} className="bg-gradient-to-r from-primary to-blue-600 text-white">Confirm & Pay <CheckCircle2 className="w-4 h-4 ml-2" /></Button>}
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
          <span>Protected booking • Secure payment</span>
          {seatLock && !lockExpired && <span>Lock expires in {minutes}:{seconds.toString().padStart(2,'0')}</span>}
        </div>
  {onCancel && <div className="mt-2 text-right"><button onClick={async ()=>{ if (seatLock?.id) { try { await apiReleaseSeatLock(seatLock.id); } catch (releaseErr) { console.error('Release seat lock failed', releaseErr); } } onCancel(); }} className="text-xs text-gray-500 hover:underline">Cancel</button></div>}
      </div>
    </Card>
  );
};
