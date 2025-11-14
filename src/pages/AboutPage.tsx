import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users,
  Award,
  Heart,
  Shield,
  Compass,
  Star,
  MapPin,
  Camera,
  TreePine,
  Target,
  Globe,
  Clock
} from 'lucide-react';
// Removed: import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { StoriesWidget } from '../components/dashboard/StoriesWidgetNew';
import { Logo } from '../components/common/Logo';
import { LocalScene } from '../components/3d/LocalScene';

const stats = [
  { icon: Users, label: 'Happy Adventurers', value: '2000+' },
  { icon: MapPin, label: 'Destinations Covered', value: '50+' },
  { icon: Star, label: 'Average Rating', value: '4.9' },
  { icon: Award, label: 'Years Experience', value: '5+' }
];

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Your safety is our top priority. We follow strict safety protocols and have experienced guides for every adventure.'
  },
  {
    icon: Heart,
    title: 'Sustainable Tourism',
    description: 'We believe in responsible travel that preserves nature and supports local communities for future generations.'
  },
  {
    icon: Compass,
    title: 'Authentic Experiences',
    description: 'We create genuine connections with local culture, cuisine, and communities for meaningful travel experiences.'
  },
  {
    icon: Target,
    title: 'Personalized Adventures',
    description: 'Every trip is customized to your preferences, fitness level, and interests for the perfect adventure.'
  }
];

const team = [
  {
    name: 'Ganapathi Bhat',
    role: 'CEO',
    image: '/ceo.png',
    experience: '8+ years',
    specialty: 'Mountain Trekking & Photography',
    description: 'Passionate mountaineer with deep knowledge of Western Ghats and Karnataka\'s hidden gems.'
  },
  {
    name: 'Priya Nair',
    role: 'Adventure Photographer',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    experience: '6+ years',
    specialty: 'Wildlife & Landscape Photography',
    description: 'Award-winning photographer specializing in capturing the essence of natural adventures.'
  },
  {
    name: 'Karthik Reddy',
    role: 'Safety & Equipment Expert',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    experience: '10+ years',
    specialty: 'Rock Climbing & Safety Training',
    description: 'Certified safety instructor ensuring every adventure is conducted with highest safety standards.'
  }
];

export const AboutPage: React.FC = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-stone-gray pt-24 pb-16 relative overflow-x-hidden">
        <div className="absolute -top-10 -right-10 opacity-50 max-w-[90vw] sm:max-w-none">
          <LocalScene variant="globe" size={260} />
        </div>
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center mb-4">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-outbrave font-bold text-forest-green mb-4 sm:mb-6">
              Trek & Stay
            </h1>
            <p className="text-lg sm:text-xl text-mountain-blue font-inter max-w-4xl mx-auto leading-relaxed">
              Our Adventure Story
            </p>
            <p className="text-base sm:text-xl text-mountain-blue font-inter max-w-4xl mx-auto leading-relaxed mt-3 sm:mt-2 px-1">
              Trek & Stay was born from a passion for exploring Karnataka's untouched beauty. 
              We believe every mountain has a story, every waterfall whispers ancient secrets, 
              and every adventure creates memories that last a lifetime.
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 w-full">
                    <motion.div
                      className="flex justify-center mb-4"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.2,
                        ease: "easeInOut" 
                      }}
                    >
                      <Icon className="w-12 h-12 text-adventure-orange" />
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl font-outbrave font-bold text-forest-green mb-1 sm:mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-gray-600 font-inter">{stat.label}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            className="bg-gradient-to-r from-forest-green to-mountain-blue rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 text-white mb-16 sm:mb-20 w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Globe className="w-16 h-16 mx-auto opacity-80" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-great-adventurer font-bold mb-5 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-base sm:text-xl leading-relaxed mb-6 sm:mb-8 opacity-90 px-0.5">
                To make Karnataka's natural wonders accessible to every adventurer while preserving 
                their pristine beauty for future generations. We're not just tour operators – 
                we're storytellers, conservationists, and dream makers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <TreePine className="w-5 h-5" />
                  <span>Eco-Friendly</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Heart className="w-5 h-5" />
                  <span>Community Driven</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Shield className="w-5 h-5" />
                  <span>Safety Focused</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-great-adventurer font-bold text-forest-green mb-4">
                What Drives Us
              </h2>
              <p className="text-base sm:text-xl text-mountain-blue font-inter max-w-3xl mx-auto px-1">
                Our core values shape every adventure we craft and every relationship we build.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 * index }}
                    whileHover={{ y: -8 }}
                  >
                    <Card className="p-4 sm:p-6 h-full hover:shadow-xl transition-all duration-300 w-full">
                      <div className="flex items-start space-x-4">
                        <motion.div
                          className="flex-shrink-0 bg-adventure-orange/10 rounded-xl p-3"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-8 h-8 text-adventure-orange" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-expat-rugged font-bold text-forest-green mb-3">
                            {value.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-great-adventurer font-bold text-forest-green mb-4">
                Meet Our Adventure Squad
              </h2>
              <p className="text-base sm:text-xl text-mountain-blue font-inter max-w-3xl mx-auto px-1">
                Passionate adventurers and local experts who make every journey unforgettable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 * index }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 w-full">
                    {/* Image */}
                    <div className="relative h-52 sm:h-64 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 max-w-full"
                        style={{ display: 'block' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Overlay Content */}
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center space-x-2 mb-2">
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">{member.specialty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg sm:text-xl font-expat-rugged font-bold text-forest-green mb-1">
                        {member.name}
                      </h3>
                      <p className="text-adventure-orange font-medium mb-3">
                        {member.role}
                      </p>
                      
                      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{member.experience}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {member.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 text-yellow-400 fill-current"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">Expert Level</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Card className="bg-gradient-to-br from-stone-gray to-white p-6 sm:p-12 w-full">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Compass className="w-16 h-16 text-adventure-orange mx-auto mb-6" />
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-great-adventurer font-bold text-forest-green mb-4">
                Ready for Your Next Adventure?
              </h2>
              <p className="text-base sm:text-xl text-mountain-blue mb-6 sm:mb-8 max-w-2xl mx-auto px-1">
                Join thousands of adventurers who have discovered Karnataka's hidden treasures with us.
                Your next unforgettable journey is just one click away.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button variant="adventure" size="xl" className="font-tall-rugged text-base sm:text-lg px-6 sm:px-8 py-4">
                  Start Your Adventure
                </Button>
                <Button variant="secondary" size="xl" className="font-tall-rugged text-base sm:text-lg px-6 sm:px-8 py-4">
                  Contact Our Team
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      <div className="max-w-4xl w-full mx-auto mt-16 px-3">
        <StoriesWidget />
      </div>
    </PageTransition>
  );
};

export default AboutPage;
