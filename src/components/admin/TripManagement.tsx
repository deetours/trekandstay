import React, { useState, useEffect } from 'react';
import { adminAPI, tripAPI } from '../../services/api';
import { Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';

interface Trip {
  id: number;
  name: string;
  location: string;
  price: number;
  duration_days: number;
  difficulty_level: string;
  description: string;
  highlights: string[];
  included: string[];
  images: string[];
  guide_id?: number;
  guide?: { id: number; name: string };
  total_spots: number;
  spots_available: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

interface Guide {
  id: number;
  name: string;
  specialty: string;
}

export const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Trip>>({
    name: '',
    location: '',
    price: 0,
    duration_days: 1,
    difficulty_level: 'Easy',
    description: '',
    highlights: [],
    included: [],
    images: [],
    guide_id: undefined,
    total_spots: 10,
    spots_available: 10,
    is_active: true,
  });

  useEffect(() => {
    fetchTrips();
    fetchGuides();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const data = await tripAPI.getAllTrips();
      setTrips(data.results || data || []);
    } catch (err) {
      setError('Failed to load trips');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuides = async () => {
    try {
      const data = await adminAPI.getAllGuides();
      setGuides(data.results || data || []);
    } catch (err) {
      console.error('Failed to load guides:', err);
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      await adminAPI.createTrip(formData as any);
      setSuccess('Trip created successfully!');
      setShowForm(false);
      resetForm();
      fetchTrips();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create trip');
    }
  };

  const handleUpdate = async () => {
    if (!editingTrip) return;
    try {
      setError(null);
      await adminAPI.updateTrip(editingTrip.id, formData);
      setSuccess('Trip updated successfully!');
      setEditingTrip(null);
      setShowForm(false);
      resetForm();
      fetchTrips();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update trip');
    }
  };

  const handleDelete = async (tripId: number) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      setError(null);
      await adminAPI.deleteTrip(tripId);
      setSuccess('Trip deleted successfully!');
      fetchTrips();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete trip');
    }
  };

  const startEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      name: trip.name,
      location: trip.location,
      price: trip.price,
      duration_days: trip.duration_days,
      difficulty_level: trip.difficulty_level,
      description: trip.description,
      highlights: trip.highlights || [],
      included: trip.included || [],
      images: trip.images || [],
      guide_id: trip.guide_id,
      total_spots: trip.total_spots,
      spots_available: trip.spots_available,
      start_date: trip.start_date,
      end_date: trip.end_date,
      is_active: trip.is_active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      price: 0,
      duration_days: 1,
      difficulty_level: 'Easy',
      description: '',
      highlights: [],
      included: [],
      images: [],
      guide_id: undefined,
      total_spots: 10,
      spots_available: 10,
      is_active: true,
    });
    setEditingTrip(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleArrayChange = (field: 'highlights' | 'included' | 'images', value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData({ ...formData, [field]: items });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trip Management</h2>
          <p className="text-gray-600 mt-1">Create, edit, and manage all trips</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Trip
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingTrip ? 'Edit Trip' : 'Create New Trip'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Himalayan Adventure Trek"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Shimla, Himachal Pradesh"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="5000"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    name="duration_days"
                    value={formData.duration_days}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="3"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Guide */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Guide
                  </label>
                  <select
                    name="guide_id"
                    value={formData.guide_id || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">No Guide</option>
                    {guides.map(guide => (
                      <option key={guide.id} value={guide.id}>
                        {guide.name} - {guide.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total Spots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Spots *
                  </label>
                  <input
                    type="number"
                    name="total_spots"
                    value={formData.total_spots}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="10"
                  />
                </div>

                {/* Available Spots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Spots *
                  </label>
                  <input
                    type="number"
                    name="spots_available"
                    value={formData.spots_available}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="10"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Describe the trip..."
                  />
                </div>

                {/* Highlights */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highlights (one per line)
                  </label>
                  <textarea
                    value={formData.highlights?.join('\n') || ''}
                    onChange={(e) => handleArrayChange('highlights', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Scenic mountain views&#10;Local cuisine experience&#10;Professional guide"
                  />
                </div>

                {/* What's Included */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What's Included (one per line)
                  </label>
                  <textarea
                    value={formData.included?.join('\n') || ''}
                    onChange={(e) => handleArrayChange('included', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Accommodation&#10;Meals&#10;Transportation"
                  />
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URLs (one per line)
                  </label>
                  <textarea
                    value={formData.images?.join('\n') || ''}
                    onChange={(e) => handleArrayChange('images', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                </div>

                {/* Active Status */}
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active (visible to users)
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={editingTrip ? handleUpdate : handleCreate}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingTrip ? 'Update Trip' : 'Create Trip'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image */}
            {trip.images && trip.images.length > 0 ? (
              <img
                src={trip.images[0]}
                alt={trip.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-emerald-300 to-blue-300 flex items-center justify-center">
                <span className="text-gray-600">No image</span>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{trip.name}</h3>
              <p className="text-gray-600 text-sm mb-2">📍 {trip.location}</p>
              
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-emerald-600 font-bold">₹{trip.price.toLocaleString()}</span>
                <span className="text-gray-600">{trip.duration_days} days</span>
              </div>

              <div className="flex justify-between items-center mb-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trip.difficulty_level === 'Easy' ? 'bg-green-100 text-green-700' :
                  trip.difficulty_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {trip.difficulty_level}
                </span>
                <span className="text-gray-600">{trip.spots_available}/{trip.total_spots} spots</span>
              </div>

              {trip.guide && (
                <p className="text-sm text-gray-600 mb-2">👨‍🏫 {trip.guide.name}</p>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  trip.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {trip.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(trip)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No trips found</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
          >
            Create Your First Trip
          </button>
        </div>
      )}
    </div>
  );
};
