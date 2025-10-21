import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  StarIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Header from '../components/navigation/Header';
import Breadcrumbs from '../components/shared/Breadcrumbs';
import Footer from '../components/shared/Footer';
import WhatsAppFloat from '../components/shared/WhatsAppFloat';
import { featuredTrips } from '../data/trips';

export default function TripDetailPage() {
  const { slug } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Find trip by slug
  const trip = featuredTrips.find(t => t.slug === slug);

  if (!trip) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-deep-forest mb-4">Trip Not Found</h1>
          <Link to="/trips" className="text-sunrise-coral hover:text-deep-forest transition-colors">
            ← Back to All Trips
          </Link>
        </div>
      </div>
    );
  }

  const mockItinerary = [
    {
      day: 1,
      title: 'Arrival & Digital Surrender',
      description: 'Check-in, device handover ceremony, welcome meditation',
      activities: ['Airport pickup', 'Welcome tea ceremony', 'Digital detox orientation', 'Sunset meditation']
    },
    {
      day: 2,
      title: 'Forest Immersion',
      description: 'Deep forest walks, nature meditation, journaling',
      activities: ['Morning yoga', 'Guided forest walk', 'Nature journaling', 'Campfire stories']
    },
    {
      day: 3,
      title: 'Inner Reflection',
      description: 'Solo time, meditation, personal breakthrough sessions',
      activities: ['Silent morning', 'One-on-one coaching', 'Art therapy', 'Group sharing circle']
    },
    {
      day: 4,
      title: 'Community Connection',
      description: 'Group activities, shared meals, meaningful conversations',
      activities: ['Cooking together', 'Team challenges', 'Storytelling session', 'Music & dance']
    },
    {
      day: 5,
      title: 'Integration & Departure',
      description: 'Planning your return, commitment ceremony, farewell',
      activities: ['Integration workshop', 'Action planning', 'Commitment ceremony', 'Departure']
    }
  ];

  const mockGallery = [
    trip.image,
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in booking the ${trip.title} retreat. Can you help me with the details and availability?`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-warm-sand">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs />

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <img
                  src={mockGallery[selectedImage]}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40 transition-colors">
                    <ShareIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-black/20 backdrop-blur-sm rounded-full text-white hover:bg-black/40 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
              
              <div className="grid grid-cols-4 gap-2">
                {mockGallery.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-sunrise-coral' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-sage-green/10 text-sage-green px-3 py-1 rounded-full text-sm font-medium">
                    FROM: {trip.transformation.from} → TO: {trip.transformation.to}
                  </span>
                  <span className="bg-alert-crimson text-cloud-white px-3 py-1 rounded-full text-sm font-bold">
                    {trip.spotsLeft} Spots Left
                  </span>
                </div>
                
                <h1 className="text-4xl font-serif text-deep-forest mb-2">
                  {trip.title}
                </h1>
                <p className="text-xl text-mystic-indigo font-light mb-4">
                  {trip.subtitle}
                </p>

                <div className="flex items-center gap-4 text-sm text-mystic-indigo mb-6">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>Max 12 people</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(trip.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{trip.rating}</span>
                  <span className="text-soft-grey">({trip.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="bg-cloud-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-deep-forest">
                      ₹{trip.price.toLocaleString()}
                    </span>
                    {trip.originalPrice && (
                      <span className="text-lg text-soft-grey line-through ml-2">
                        ₹{trip.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <div className="text-sm text-mystic-indigo">per person</div>
                  </div>
                  {trip.originalPrice && (
                    <div className="text-right">
                      <div className="text-sage-green font-bold">
                        Save ₹{(trip.originalPrice - trip.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-mystic-indigo">
                        {Math.round(((trip.originalPrice - trip.price) / trip.originalPrice) * 100)}% off
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-mystic-indigo" />
                    <span className="text-mystic-indigo">Next dates: Jan 15-19, Feb 12-16, Mar 8-12</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppBooking}
                    className="w-full bg-sunrise-coral text-cloud-white py-4 rounded-lg font-bold text-lg hover:bg-deep-forest transition-colors"
                  >
                    Book Now via WhatsApp
                  </button>
                  <button className="w-full border-2 border-sunrise-coral text-sunrise-coral py-3 rounded-lg font-bold hover:bg-sunrise-coral hover:text-cloud-white transition-colors">
                    Request More Info
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div ref={ref} className="bg-cloud-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-soft-grey">
              <nav className="flex">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'itinerary', name: 'Itinerary' },
                  { id: 'included', name: "What's Included" },
                  { id: 'reviews', name: 'Reviews' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-sunrise-coral border-b-2 border-sunrise-coral'
                        : 'text-mystic-indigo hover:text-sunrise-coral'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-serif text-deep-forest mb-4">
                      Your Transformation Journey
                    </h3>
                    <p className="text-lg text-mystic-indigo leading-relaxed mb-6">
                      {trip.description || "Disconnect from digital chaos and reconnect with your inner peace in the lush Western Ghats. This isn't just a retreat—it's a carefully crafted journey back to yourself."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xl font-serif text-deep-forest mb-4">Experience Highlights</h4>
                      <ul className="space-y-2">
                        {[
                          'Complete digital detox with device surrender ceremony',
                          'Daily meditation and mindfulness practices',
                          'Nature immersion walks in pristine forests',
                          'One-on-one breakthrough coaching sessions',
                          'Organic farm-to-table meals',
                          'Group sharing circles and community building'
                        ].map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckIcon className="w-5 h-5 text-sage-green flex-shrink-0 mt-0.5" />
                            <span className="text-mystic-indigo">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-serif text-deep-forest mb-4">Perfect For</h4>
                      <ul className="space-y-2">
                        {[
                          'Burned-out professionals seeking clarity',
                          'Anyone feeling overwhelmed by technology',
                          'People looking to reconnect with nature',
                          'Those ready for personal transformation',
                          'Individuals seeking inner peace',
                          'Anyone wanting to break negative patterns'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckIcon className="w-5 h-5 text-sage-green flex-shrink-0 mt-0.5" />
                            <span className="text-mystic-indigo">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'itinerary' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-serif text-deep-forest mb-6">
                    5-Day Transformation Journey
                  </h3>
                  
                  <div className="space-y-6">
                    {mockItinerary.map((day, index) => (
                      <div key={day.day} className="border-l-4 border-sage-green pl-6 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-sage-green text-cloud-white rounded-full flex items-center justify-center font-bold text-sm">
                            {day.day}
                          </div>
                          <h4 className="text-xl font-serif text-deep-forest">{day.title}</h4>
                        </div>
                        <p className="text-mystic-indigo mb-3">{day.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-sunrise-coral rounded-full"></div>
                              <span className="text-sm text-mystic-indigo">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'included' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <div>
                    <h3 className="text-2xl font-serif text-deep-forest mb-4 flex items-center gap-2">
                      <CheckIcon className="w-6 h-6 text-sage-green" />
                      What's Included
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'All accommodation (shared/private options)',
                        'All organic meals and beverages',
                        'Airport/station pickup and drop',
                        'All guided activities and workshops',
                        'Personal coaching sessions',
                        'Welcome and farewell ceremonies',
                        'Digital detox support materials',
                        'Post-retreat integration guide'
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckIcon className="w-5 h-5 text-sage-green flex-shrink-0 mt-0.5" />
                          <span className="text-mystic-indigo">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif text-deep-forest mb-4 flex items-center gap-2">
                      <XMarkIcon className="w-6 h-6 text-alert-crimson" />
                      Not Included
                    </h3>
                    <ul className="space-y-2">
                      {[
                        'Travel to/from your city',
                        'Personal expenses and shopping',
                        'Alcohol and non-organic beverages',
                        'Travel insurance',
                        'Tips and gratuities',
                        'Spa treatments (available separately)'
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XMarkIcon className="w-5 h-5 text-alert-crimson flex-shrink-0 mt-0.5" />
                          <span className="text-mystic-indigo">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-serif text-deep-forest">
                      Guest Reviews ({trip.reviewCount})
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(trip.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-deep-forest">{trip.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        name: 'Priya S.',
                        location: 'Mumbai',
                        rating: 5,
                        date: 'December 2024',
                        review: "This retreat literally saved my sanity. I went in completely burned out from my startup, checking emails every 5 minutes. I came back with clarity, peace, and a completely new perspective on what matters. The digital detox was exactly what I needed."
                      },
                      {
                        name: 'Rahul M.',
                        location: 'Bangalore',
                        rating: 5,
                        date: 'November 2024',
                        review: "I was skeptical about the whole 'transformation' thing, but this experience genuinely changed me. The combination of nature, meditation, and deep conversations with fellow travelers created something magical. I'm still implementing the practices I learned."
                      },
                      {
                        name: 'Anita K.',
                        location: 'Delhi',
                        rating: 4,
                        date: 'October 2024',
                        review: "Beautiful location, thoughtful program, and amazing food. The only reason I'm not giving 5 stars is that I wish it was longer! 5 days felt too short for such a profound experience. Already planning to come back."
                      }
                    ].map((review, index) => (
                      <div key={index} className="bg-warm-sand rounded-xl p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-deep-forest">{review.name}</h4>
                            <p className="text-sm text-mystic-indigo">{review.location} • {review.date}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIconSolid
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-mystic-indigo leading-relaxed">{review.review}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}