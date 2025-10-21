import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Users, 
  Calendar, 
  MapPin, 
  Star, 
  Shield, 
  Utensils, 
  Camera,
  Tent,
  Mountain,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

interface PricingOptions {
  participants: number;
  duration: number;
  season: 'peak' | 'off-peak' | 'shoulder';
  accommodationType: 'camping' | 'homestay' | 'hotel';
  mealPlan: 'basic' | 'premium' | 'vegetarian';
  addOns: string[];
  transportIncluded: boolean;
  insuranceRequired: boolean;
}

interface PriceBreakdown {
  baseCost: number;
  seasonMultiplier: number;
  accommodationCost: number;
  mealCost: number;
  transportCost: number;
  insuranceCost: number;
  addOnsCost: number;
  groupDiscount: number;
  subtotal: number;
  taxes: number;
  total: number;
  perPerson: number;
  savings: number;
}

const addOnOptions = [
  { id: 'photography', name: 'Professional Photography', price: 1500, icon: Camera },
  { id: 'guide', name: 'Experienced Guide', price: 2000, icon: Mountain },
  { id: 'equipment', name: 'Premium Equipment', price: 1200, icon: Tent },
  { id: 'breakfast', name: 'Special Breakfast', price: 500, icon: Utensils },
];

const PricingCalculator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [options, setOptions] = useState<PricingOptions>({
    participants: 2,
    duration: 3,
    season: 'shoulder',
    accommodationType: 'camping',
    mealPlan: 'basic',
    addOns: [],
    transportIncluded: true,
    insuranceRequired: false
  });

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const priceBreakdown = useMemo((): PriceBreakdown => {
    const baseCostPerDay = 2000;
    const baseCost = baseCostPerDay * options.duration;

    const seasonMultipliers = {
      'peak': 1.5,
      'shoulder': 1.2,
      'off-peak': 0.8
    };

    const accommodationCosts = {
      'camping': 500,
      'homestay': 1200,
      'hotel': 2500
    };

    const mealCosts = {
      'basic': 800,
      'premium': 1500,
      'vegetarian': 1000
    };

    const seasonMultiplier = seasonMultipliers[options.season];
    const accommodationCost = accommodationCosts[options.accommodationType] * options.duration;
    const mealCost = mealCosts[options.mealPlan] * options.duration;
    const transportCost = options.transportIncluded ? 1500 : 0;
    const insuranceCost = options.insuranceRequired ? 500 : 0;
    
    const addOnsCost = options.addOns.reduce((total: number, addOnId: string) => {
      const addOn = addOnOptions.find(ao => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);

    const subtotalPerPerson = (baseCost * seasonMultiplier) + accommodationCost + mealCost + addOnsCost + transportCost + insuranceCost;
    
    // Group discounts
    let groupDiscount = 0;
    if (options.participants >= 6) groupDiscount = subtotalPerPerson * 0.15;
    else if (options.participants >= 4) groupDiscount = subtotalPerPerson * 0.1;
    else if (options.participants >= 2) groupDiscount = subtotalPerPerson * 0.05;

    const subtotal = (subtotalPerPerson - groupDiscount) * options.participants;
    const taxes = subtotal * 0.18; // 18% GST
    const total = subtotal + taxes;
    const perPerson = total / options.participants;

    const regularPrice = baseCostPerDay * 1.5 * options.duration * options.participants;
    const savings = Math.max(0, regularPrice - total);

    return {
      baseCost: baseCost * options.participants,
      seasonMultiplier,
      accommodationCost: accommodationCost * options.participants,
      mealCost: mealCost * options.participants,
      transportCost: transportCost * options.participants,
      insuranceCost: insuranceCost * options.participants,
      addOnsCost: addOnsCost * options.participants,
      groupDiscount: groupDiscount * options.participants,
      subtotal,
      taxes,
      total,
      perPerson,
      savings
    };
  }, [options]);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 300);
    return () => clearTimeout(timer);
  }, [options]);

  const updateOption = <K extends keyof PricingOptions>(key: K, value: PricingOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const toggleAddOn = (addOnId: string) => {
    setOptions(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOnId)
        ? prev.addOns.filter(id => id !== addOnId)
        : [...prev.addOns, addOnId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <Calculator className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Trek Pricing Calculator</h2>
            <p className="text-emerald-100">Get instant pricing for your adventure</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4" />
                <span>Number of Participants</span>
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateOption('participants', Math.max(1, options.participants - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-medium"
                  disabled={options.participants <= 1}
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-800 w-12 text-center">
                  {options.participants}
                </span>
                <button
                  onClick={() => updateOption('participants', Math.min(12, options.participants + 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-medium"
                  disabled={options.participants >= 12}
                >
                  +
                </button>
              </div>
              {options.participants >= 4 && (
                <motion.p
                  className="text-sm text-green-600 flex items-center space-x-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Group discount applied!</span>
                </motion.p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Duration (Days)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map(days => (
                  <button
                    key={days}
                    onClick={() => updateOption('duration', days)}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      options.duration === days
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {days}D
                  </button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Star className="w-4 h-4" />
                <span>Season</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'off-peak', label: 'Off Peak', discount: '20% OFF' },
                  { value: 'shoulder', label: 'Shoulder', discount: '10% OFF' },
                  { value: 'peak', label: 'Peak Season', discount: '+50%' }
                ] as const).map(season => (
                  <button
                    key={season.value}
                    onClick={() => updateOption('season', season.value)}
                    className={`py-3 px-4 rounded-lg font-medium transition-all text-center ${
                      options.season === season.value
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-sm">{season.label}</div>
                    <div className={`text-xs ${
                      options.season === season.value ? 'text-emerald-100' : 'text-gray-500'
                    }`}>
                      {season.discount}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accommodation */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                <span>Accommodation</span>
              </label>
              <div className="space-y-2">
                {([
                  { value: 'camping', label: 'Camping', price: '₹500/night' },
                  { value: 'homestay', label: 'Homestay', price: '₹1,200/night' },
                  { value: 'hotel', label: 'Hotel', price: '₹2,500/night' }
                ] as const).map(accom => (
                  <button
                    key={accom.value}
                    onClick={() => updateOption('accommodationType', accom.value)}
                    className={`w-full p-3 rounded-lg transition-all text-left flex justify-between items-center ${
                      options.accommodationType === accom.value
                        ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{accom.label}</span>
                    <span className="text-sm">{accom.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Add-ons</label>
              <div className="grid grid-cols-1 gap-2">
                {addOnOptions.map(addOn => {
                  const Icon = addOn.icon;
                  const isSelected = options.addOns.includes(addOn.id);
                  return (
                    <button
                      key={addOn.id}
                      onClick={() => toggleAddOn(addOn.id)}
                      className={`p-3 rounded-lg transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{addOn.name}</span>
                      </div>
                      <span className="text-sm">+{formatCurrency(addOn.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Include Transport</span>
                </div>
                <button
                  onClick={() => updateOption('transportIncluded', !options.transportIncluded)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    options.transportIncluded ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    options.transportIncluded ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Travel Insurance</span>
                </div>
                <button
                  onClick={() => updateOption('insuranceRequired', !options.insuranceRequired)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    options.insuranceRequired ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    options.insuranceRequired ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {isCalculating ? (
                <motion.div
                  key="calculating"
                  className="flex items-center justify-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
                    <p className="text-gray-600">Calculating best price...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="calculated"
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {/* Price Summary Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="text-center mb-4">
                      <p className="text-gray-600 text-sm">Total Cost</p>
                      <p className="text-4xl font-bold text-emerald-600">
                        {formatCurrency(priceBreakdown.total)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {formatCurrency(priceBreakdown.perPerson)} per person
                      </p>
                    </div>

                    {priceBreakdown.savings > 0 && (
                      <motion.div
                        className="bg-green-100 text-green-800 p-3 rounded-lg text-center mb-4"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <TrendingUp className="w-5 h-5 inline mr-2" />
                        You save {formatCurrency(priceBreakdown.savings)}!
                      </motion.div>
                    )}

                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="w-full py-2 px-4 bg-white border border-emerald-200 rounded-lg text-emerald-600 font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Info className="w-4 h-4" />
                      <span>{showBreakdown ? 'Hide' : 'Show'} Price Breakdown</span>
                    </button>
                  </div>

                  {/* Price Breakdown */}
                  <AnimatePresence>
                    {showBreakdown && (
                      <motion.div
                        className="bg-gray-50 rounded-xl p-4 space-y-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <h4 className="font-semibold text-gray-800 mb-3">Price Breakdown</h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Base Cost ({options.duration} days)</span>
                            <span>{formatCurrency(priceBreakdown.baseCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Season Adjustment ({Math.round((priceBreakdown.seasonMultiplier - 1) * 100)}%)</span>
                            <span>{formatCurrency(priceBreakdown.baseCost * (priceBreakdown.seasonMultiplier - 1))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accommodation</span>
                            <span>{formatCurrency(priceBreakdown.accommodationCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Meals</span>
                            <span>{formatCurrency(priceBreakdown.mealCost)}</span>
                          </div>
                          {priceBreakdown.transportCost > 0 && (
                            <div className="flex justify-between">
                              <span>Transport</span>
                              <span>{formatCurrency(priceBreakdown.transportCost)}</span>
                            </div>
                          )}
                          {priceBreakdown.insuranceCost > 0 && (
                            <div className="flex justify-between">
                              <span>Insurance</span>
                              <span>{formatCurrency(priceBreakdown.insuranceCost)}</span>
                            </div>
                          )}
                          {priceBreakdown.addOnsCost > 0 && (
                            <div className="flex justify-between">
                              <span>Add-ons</span>
                              <span>{formatCurrency(priceBreakdown.addOnsCost)}</span>
                            </div>
                          )}
                          {priceBreakdown.groupDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Group Discount</span>
                              <span>-{formatCurrency(priceBreakdown.groupDiscount)}</span>
                            </div>
                          )}
                          <hr className="border-gray-300" />
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{formatCurrency(priceBreakdown.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GST (18%)</span>
                            <span>{formatCurrency(priceBreakdown.taxes)}</span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(priceBreakdown.total)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Call to Action */}
                  <motion.button
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book This Trek
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingCalculator;
