import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calendar, MapPin, Clock, CheckCircle2, Circle, Save, Edit3, Backpack, Sun, Mountain, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface TripPlan {
  id: string;
  tripId: string;
  tripName: string;
  customItinerary: ItineraryItem[];
  packingList: PackingItem[];
  notes: string;
  reminders: string[];
  createdAt: string;
  updatedAt: string;
}

interface ItineraryItem {
  id: string;
  day: number;
  title: string;
  description: string;
  time?: string;
  location?: string;
  completed: boolean;
}

interface PackingItem {
  id: string;
  category: string;
  item: string;
  quantity: number;
  packed: boolean;
}

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    name: string;
    duration?: string;
    location: string;
  };
}

const defaultPackingList: PackingItem[] = [
  { id: '1', category: 'Essentials', item: 'Passport/ID', quantity: 1, packed: false },
  { id: '2', category: 'Essentials', item: 'Travel Insurance', quantity: 1, packed: false },
  { id: '3', category: 'Clothing', item: 'T-shirts', quantity: 5, packed: false },
  { id: '4', category: 'Clothing', item: 'Trousers/Shorts', quantity: 3, packed: false },
  { id: '5', category: 'Clothing', item: 'Underwear', quantity: 7, packed: false },
  { id: '6', category: 'Footwear', item: 'Comfortable Walking Shoes', quantity: 1, packed: false },
  { id: '7', category: 'Footwear', item: 'Sandals', quantity: 1, packed: false },
  { id: '8', category: 'Toiletries', item: 'Toothbrush & Paste', quantity: 1, packed: false },
  { id: '9', category: 'Toiletries', item: 'Shampoo & Soap', quantity: 1, packed: false },
  { id: '10', category: 'Electronics', item: 'Phone Charger', quantity: 1, packed: false },
  { id: '11', category: 'Electronics', item: 'Power Bank', quantity: 1, packed: false },
  { id: '12', category: 'Documents', item: 'Tickets/Confirmations', quantity: 1, packed: false },
];

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({ isOpen, onClose, trip }) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'packing' | 'notes'>('itinerary');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing plan from localStorage
  useEffect(() => {
    if (isOpen && trip.id) {
      const savedPlans = JSON.parse(localStorage.getItem('tripPlans') || '[]');
      const existingPlan = savedPlans.find((p: TripPlan) => p.tripId === trip.id);

      if (existingPlan) {
        setPlan(existingPlan);
      } else {
        // Create new plan
        const newPlan: TripPlan = {
          id: Date.now().toString(),
          tripId: trip.id,
          tripName: trip.name,
          customItinerary: [],
          packingList: [...defaultPackingList],
          notes: '',
          reminders: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPlan(newPlan);
      }
    }
  }, [isOpen, trip.id, trip.name]);

  const savePlan = () => {
    if (!plan) return;

    const updatedPlan = { ...plan, updatedAt: new Date().toISOString() };
    const savedPlans = JSON.parse(localStorage.getItem('tripPlans') || '[]');
    const existingIndex = savedPlans.findIndex((p: TripPlan) => p.id === plan.id);

    if (existingIndex >= 0) {
      savedPlans[existingIndex] = updatedPlan;
    } else {
      savedPlans.push(updatedPlan);
    }

    localStorage.setItem('tripPlans', JSON.stringify(savedPlans));
    setPlan(updatedPlan);
    setIsEditing(false);
  };

  const addItineraryItem = () => {
    if (!plan) return;

    const newItem: ItineraryItem = {
      id: Date.now().toString(),
      day: plan.customItinerary.length + 1,
      title: '',
      description: '',
      completed: false,
    };

    setPlan({
      ...plan,
      customItinerary: [...plan.customItinerary, newItem],
    });
  };

  const updateItineraryItem = (id: string, updates: Partial<ItineraryItem>) => {
    if (!plan) return;

    setPlan({
      ...plan,
      customItinerary: plan.customItinerary.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const removeItineraryItem = (id: string) => {
    if (!plan) return;

    setPlan({
      ...plan,
      customItinerary: plan.customItinerary.filter(item => item.id !== id),
    });
  };

  const togglePackingItem = (id: string) => {
    if (!plan) return;

    setPlan({
      ...plan,
      packingList: plan.packingList.map(item =>
        item.id === id ? { ...item, packed: !item.packed } : item
      ),
    });
  };

  const addReminder = () => {
    if (!plan) return;

    setPlan({
      ...plan,
      reminders: [...plan.reminders, ''],
    });
  };

  const updateReminder = (index: number, value: string) => {
    if (!plan) return;

    const newReminders = [...plan.reminders];
    newReminders[index] = value;
    setPlan({
      ...plan,
      reminders: newReminders,
    });
  };

  const removeReminder = (index: number) => {
    if (!plan) return;

    setPlan({
      ...plan,
      reminders: plan.reminders.filter((_, i) => i !== index),
    });
  };

  if (!plan) return null;

  const packingCategories = [...new Set(plan.packingList.map(item => item.category))];
  const packedCount = plan.packingList.filter(item => item.packed).length;
  const totalItems = plan.packingList.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Plan Your Trip</h2>
                <p className="text-gray-600 mt-1">{trip.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="secondary"
                    size="sm"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Plan
                  </Button>
                ) : (
                  <Button
                    onClick={savePlan}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Plan
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                { id: 'packing', label: 'Packing List', icon: Backpack },
                { id: 'notes', label: 'Notes & Reminders', icon: Edit3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Custom Itinerary</h3>
                    {isEditing && (
                      <Button onClick={addItineraryItem} size="sm" variant="secondary">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Day
                      </Button>
                    )}
                  </div>

                  {plan.customItinerary.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No custom itinerary yet</p>
                      {isEditing && (
                        <Button onClick={addItineraryItem} className="mt-4" variant="secondary">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your Itinerary
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {plan.customItinerary.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                {item.day}
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              {isEditing ? (
                                <>
                                  <input
                                    type="text"
                                    placeholder="Day title"
                                    value={item.title}
                                    onChange={(e) => updateItineraryItem(item.id, { title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                  />
                                  <textarea
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateItineraryItem(item.id, { description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Time (optional)"
                                      value={item.time || ''}
                                      onChange={(e) => updateItineraryItem(item.id, { time: e.target.value })}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Location (optional)"
                                      value={item.location || ''}
                                      onChange={(e) => updateItineraryItem(item.id, { location: e.target.value })}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                  <p className="text-gray-600">{item.description}</p>
                                  {(item.time || item.location) && (
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      {item.time && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {item.time}
                                        </div>
                                      )}
                                      {item.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {item.location}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            {isEditing && (
                              <Button
                                onClick={() => removeItineraryItem(item.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'packing' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Packing List</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {packedCount} of {totalItems} items packed
                      </p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(packedCount / totalItems) * 100}%` }}
                      />
                    </div>
                  </div>

                  {packingCategories.map(category => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {category === 'Essentials' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {category === 'Clothing' && <Circle className="w-4 h-4 text-blue-500" />}
                        {category === 'Footwear' && <Mountain className="w-4 h-4 text-brown-500" />}
                        {category === 'Toiletries' && <Sun className="w-4 h-4 text-yellow-500" />}
                        {category === 'Electronics' && <Camera className="w-4 h-4 text-purple-500" />}
                        {category === 'Documents' && <Edit3 className="w-4 h-4 text-gray-500" />}
                        {category}
                      </h4>
                      <div className="space-y-2 ml-6">
                        {plan.packingList
                          .filter(item => item.category === category)
                          .map(item => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                            >
                              <button
                                onClick={() => togglePackingItem(item.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  item.packed
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-gray-300 hover:border-primary'
                                }`}
                              >
                                {item.packed && <CheckCircle2 className="w-3 h-3" />}
                              </button>
                              <span className={`flex-1 ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {item.item}
                                {item.quantity > 1 && ` (${item.quantity})`}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Trip Notes</h3>
                    {isEditing ? (
                      <textarea
                        value={plan.notes}
                        onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                        placeholder="Add your trip notes, tips, or important information..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={6}
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg min-h-[120px]">
                        {plan.notes || <span className="text-gray-500 italic">No notes yet</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
                      {isEditing && (
                        <Button onClick={addReminder} size="sm" variant="secondary">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Reminder
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {plan.reminders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No reminders set</p>
                        </div>
                      ) : (
                        plan.reminders.map((reminder, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={reminder}
                                onChange={(e) => updateReminder(index, e.target.value)}
                                placeholder="Enter reminder..."
                                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                            ) : (
                              <span className="flex-1 text-gray-900">{reminder}</span>
                            )}
                            {isEditing && (
                              <Button
                                onClick={() => removeReminder(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};