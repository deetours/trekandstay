import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  DollarSign,
  Brain,
  Clock,
  Star,
  RefreshCw,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAdventureStore } from '../../store/adventureStore';
import { fetchTrips } from '../../services/api';

interface Trip {
  id: number;
  name: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  spots_available: number;
  highlights: string[];
  images: string[];
}

interface CustomItinerary {
  tripId: number;
  tripName: string;
  days: {
    day: number;
    title: string;
    activities: string[];
    meals: string;
    notes: string;
  }[];
  totalCost: number;
  customizations: string[];
}

const PredictiveTravelPlanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { user } = useAdventureStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [customItinerary, setCustomItinerary] = useState<CustomItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'customize' | 'saved'>('browse');

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Generate base itinerary from trip data
  const generateBaseItinerary = (trip: Trip): CustomItinerary => {
    const durationDays = parseInt(trip.duration.split(' ')[0]) || 3;
    const days = [];

    for (let i = 1; i <= durationDays; i++) {
      // Distribute highlights across days
      const dayHighlights = trip.highlights.slice(
        Math.floor(((i - 1) / durationDays) * trip.highlights.length),
        Math.floor((i / durationDays) * trip.highlights.length)
      );

      days.push({
        day: i,
        title: i === 1 ? 'Arrival & Exploration' : 
               i === durationDays ? 'Departure & Memories' :
               `Day ${i} - ${trip.location} Adventures`,
        activities: dayHighlights.length > 0 ? dayHighlights : ['Explore local area', 'Free time'],
        meals: i === 1 ? 'Dinner' : i === durationDays ? 'Breakfast' : 'Breakfast, Lunch, Dinner',
        notes: ''
      });
    }

    return {
      tripId: trip.id,
      tripName: trip.name,
      days,
      totalCost: trip.price,
      customizations: []
    };
  };

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    const itinerary = generateBaseItinerary(trip);
    setCustomItinerary(itinerary);
    setActiveTab('customize');
    setEditing(true);
  };

  const handleAddActivity = (dayIndex: number) => {
    if (!customItinerary) return;
    const newItinerary = { ...customItinerary };
    newItinerary.days[dayIndex].activities.push('New Activity');
    newItinerary.customizations.push(`Added activity on Day ${dayIndex + 1}`);
    setCustomItinerary(newItinerary);
  };

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (!customItinerary) return;
    const newItinerary = { ...customItinerary };
    newItinerary.days[dayIndex].activities.splice(activityIndex, 1);
    newItinerary.customizations.push(`Removed activity from Day ${dayIndex + 1}`);
    setCustomItinerary(newItinerary);
  };

  const handleUpdateActivity = (dayIndex: number, activityIndex: number, value: string) => {
    if (!customItinerary) return;
    const newItinerary = { ...customItinerary };
    newItinerary.days[dayIndex].activities[activityIndex] = value;
    setCustomItinerary(newItinerary);
  };

  const handleUpdateDayTitle = (dayIndex: number, value: string) => {
    if (!customItinerary) return;
    const newItinerary = { ...customItinerary };
    newItinerary.days[dayIndex].title = value;
    setCustomItinerary(newItinerary);
  };

  const handleSaveItinerary = () => {
    if (!customItinerary) return;
    // Save to localStorage or backend
    const saved = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    saved.push({
      ...customItinerary,
      savedAt: new Date().toISOString(),
      userId: user?.id
    });
    localStorage.setItem('savedItineraries', JSON.stringify(saved));
    setEditing(false);
    alert('Itinerary saved successfully!');
  };

  if (loading) {
    return (
      <Card className="p-6 bg-white/90 backdrop-blur">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Brain className="w-7 h-7" />
              Smart Itinerary Planner
            </h2>
            <p className="text-purple-100">
              Customize YOUR trips - Build perfect itineraries from our {trips.length} adventures
            </p>
          </div>
          <Button variant="secondary" onClick={loadTrips}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'browse' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('browse')}
        >
          Browse Trips
        </Button>
        <Button
          variant={activeTab === 'customize' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('customize')}
          disabled={!selectedTrip}
        >
          Customize Itinerary
        </Button>
        <Button
          variant={activeTab === 'saved' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('saved')}
        >
          Saved Plans
        </Button>
      </div>

      {/* Browse Trips */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
            >
              {trip.images[0] && (
                <img
                  src={trip.images[0]}
                  alt={trip.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {trip.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {trip.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ₹{trip.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {trip.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {trip.highlights.slice(0, 3).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleSelectTrip(trip)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Customize This Trip
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customize Itinerary */}
      {activeTab === 'customize' && customItinerary && selectedTrip && (
        <div className="space-y-6">
          {/* Trip Header */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {customItinerary.tripName}
                </h3>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedTrip.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {customItinerary.days.length} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ₹{customItinerary.totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? <CheckCircle className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </Button>
                <Button onClick={handleSaveItinerary}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Plan
                </Button>
              </div>
            </div>
          </Card>

          {/* Day by Day Itinerary */}
          <div className="space-y-4">
            {customItinerary.days.map((day, dayIndex) => (
              <Card key={dayIndex} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-700 font-bold">D{day.day}</span>
                  </div>
                  {editing ? (
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => handleUpdateDayTitle(dayIndex, e.target.value)}
                      className="flex-1 text-lg font-bold px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <h4 className="text-lg font-bold text-gray-900">{day.title}</h4>
                  )}
                </div>

                {/* Activities */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-gray-700">Activities</h5>
                    {editing && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddActivity(dayIndex)}
                      >
                        + Add Activity
                      </Button>
                    )}
                  </div>
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      {editing ? (
                        <>
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) =>
                              handleUpdateActivity(dayIndex, activityIndex, e.target.value)
                            }
                            className="flex-1 px-3 py-1 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() => handleRemoveActivity(dayIndex, activityIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-700">{activity}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Meals */}
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Meals:</span> {day.meals}
                </div>
              </Card>
            ))}
          </div>

          {/* Customization Summary */}
          {customItinerary.customizations.length > 0 && (
            <Card className="p-4 bg-blue-50">
              <h5 className="font-semibold text-blue-900 mb-2">Your Customizations</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                {customItinerary.customizations.map((change, idx) => (
                  <li key={idx}>• {change}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Saved Plans */}
      {activeTab === 'saved' && (
        <Card className="p-6">
          <p className="text-gray-600 text-center py-8">
            Your saved itineraries will appear here
          </p>
        </Card>
      )}
    </div>
  );
};

export default PredictiveTravelPlanner;
