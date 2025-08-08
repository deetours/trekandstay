import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAdventureStore } from '../../store/adventureStore';

const destinations = [
  { id: '1', name: 'Dudhsagar Waterfalls', location: 'Goa-Karnataka' },
  { id: '2', name: 'Raigad Fort', location: 'Maharashtra' },
  { id: '3', name: 'Gokarna Beach', location: 'Karnataka Coast' },
  { id: '4', name: 'Western Ghats Trek', location: 'Karnataka Highlands' },
];

export const BookingWidget: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [groupSize, setGroupSize] = useState(2);
  const [step, setStep] = useState(1);
  const { updateBooking } = useAdventureStore();

  const steps = [
    { number: 1, title: 'Destination', icon: MapPin },
    { number: 2, title: 'Date & Group', icon: Calendar },
    { number: 3, title: 'Confirmation', icon: Check },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Handle booking submission
      updateBooking({
        destinationId: selectedDestination,
        startDate: selectedDate,
        groupSize: groupSize,
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDestination !== '';
      case 2:
        return selectedDate !== '' && groupSize > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <section className="py-20 bg-forest-green">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="text-center text-white mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-oswald font-bold mb-4">
            Book Your Adventure
          </h2>
          <p className="text-xl font-inter opacity-90">
            Quick and easy booking in just 3 simple steps
          </p>
        </motion.div>

        <Card className="p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.number;
              const isCompleted = step > stepItem.number;

              return (
                <React.Fragment key={stepItem.number}>
                  <motion.div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-adventure-orange text-white'
                        : isCompleted
                        ? 'bg-forest-green text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      boxShadow: isActive ? '0 0 20px rgba(255, 107, 53, 0.4)' : 'none',
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-white text-forest-green' : ''
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : stepItem.number}
                    </div>
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{stepItem.title}</span>
                  </motion.div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                      step > stepItem.number ? 'bg-forest-green' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {step === 1 && (
                <div>
                  <h3 className="text-2xl font-oswald font-bold text-forest-green mb-6 text-center">
                    Choose Your Destination
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {destinations.map((destination) => (
                      <motion.div
                        key={destination.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedDestination === destination.id
                            ? 'border-adventure-orange bg-adventure-orange/10'
                            : 'border-gray-200 hover:border-adventure-orange/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDestination(destination.id)}
                      >
                        <h4 className="font-oswald font-semibold text-forest-green mb-1">
                          {destination.name}
                        </h4>
                        <p className="text-mountain-blue text-sm flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {destination.location}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-oswald font-bold text-forest-green mb-6 text-center">
                    Select Date & Group Size
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-forest-green mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adventure-orange focus:border-adventure-orange"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-forest-green mb-2">
                        Group Size
                      </label>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                          className="w-10 h-10 p-0"
                        >
                          -
                        </Button>
                        <span className="text-xl font-oswald font-bold text-forest-green min-w-[3rem] text-center">
                          {groupSize}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setGroupSize(Math.min(12, groupSize + 1))}
                          className="w-10 h-10 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-gray/50 p-4 rounded-lg">
                    <h4 className="font-oswald font-semibold text-forest-green mb-2">
                      Estimated Price
                    </h4>
                    <div className="text-2xl font-oswald font-bold text-adventure-orange">
                      ₹{(2999 * groupSize).toLocaleString()}
                    </div>
                    <p className="text-sm text-mountain-blue">
                      ₹2,999 per person × {groupSize} {groupSize === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-forest-green rounded-full flex items-center justify-center mx-auto"
                  >
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-oswald font-bold text-forest-green">
                    Ready to Book!
                  </h3>
                  
                  <div className="max-w-md mx-auto text-left bg-stone-gray/30 p-6 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-mountain-blue">Destination:</span>
                        <span className="font-medium text-forest-green">
                          {destinations.find(d => d.id === selectedDestination)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mountain-blue">Date:</span>
                        <span className="font-medium text-forest-green">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mountain-blue">Group Size:</span>
                        <span className="font-medium text-forest-green">{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-lg">
                          <span className="font-oswald font-semibold text-forest-green">Total:</span>
                          <span className="font-oswald font-bold text-adventure-orange">
                            ₹{(2999 * groupSize).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="disabled:opacity-50"
            >
              Previous
            </Button>
            
            <Button
              variant="adventure"
              onClick={handleNext}
              disabled={!canProceed()}
              className="disabled:opacity-50"
            >
              {step === 3 ? 'Confirm Booking' : 'Next'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};