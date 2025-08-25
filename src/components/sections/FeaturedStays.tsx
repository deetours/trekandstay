import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/Button';
import { Star, MapPin, Wifi, Car, Coffee, Utensils } from 'lucide-react';

export function FeaturedStays() {
  const navigate = useNavigate();

  const featuredStays = [
    {
      id: 1,
      name: "Royal Heritage Hotel",
      category: "Heritage Hotel",
      location: "Udaipur, Rajasthan",
      price: "₹8,500",
      originalPrice: "₹12,000",
      rating: 4.8,
      reviews: 156,
      image: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      amenities: ["wifi", "parking", "breakfast", "restaurant"],
      discount: "29% OFF",
      description: "Experience royal luxury in the heart of the City of Lakes"
    },
    {
      id: 2,
      name: "Mountain View Resort",
      category: "Resort",
      location: "Manali, Himachal Pradesh",
      price: "₹6,200",
      originalPrice: "₹8,800",
      rating: 4.7,
      reviews: 89,
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      amenities: ["wifi", "parking", "breakfast"],
      discount: "30% OFF",
      description: "Breathtaking mountain views with modern amenities"
    },
    {
      id: 3,
      name: "Beachside Villa",
      category: "Villa",
      location: "Goa",
      price: "₹4,800",
      originalPrice: "₹6,500",
      rating: 4.9,
      reviews: 203,
      image: "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      amenities: ["wifi", "parking", "breakfast"],
      discount: "26% OFF",
      description: "Private villa just steps away from pristine beaches"
    },
    {
      id: 4,
      name: "Cozy Homestay",
      category: "Homestay",
      location: "Coorg, Karnataka",
      price: "₹2,900",
      originalPrice: "₹3,800",
      rating: 4.6,
      reviews: 67,
      image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      amenities: ["wifi", "breakfast"],
      discount: "24% OFF",
      description: "Authentic local experience amidst coffee plantations"
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      default: return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Stays
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover handpicked accommodations that offer exceptional experiences and comfort for your perfect getaway
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredStays.map((stay) => (
            <motion.div key={stay.id} variants={itemVariants}>
              <Card className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <img
                    src={stay.image}
                    alt={stay.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white font-semibold">
                      {stay.discount}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {stay.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{stay.location}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {stay.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">{stay.description}</p>
                  
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{stay.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({stay.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {stay.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg text-blue-600"
                      >
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">{stay.price}</span>
                      <span className="text-sm text-gray-500 line-through">{stay.originalPrice}</span>
                    </div>
                    <span className="text-sm text-gray-500">per night</span>
                  </div>
                  
                  <Button
                    onClick={() => navigate(`/stays/${stay.id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform group-hover:scale-105"
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => navigate('/stays')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Explore All Stays
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
