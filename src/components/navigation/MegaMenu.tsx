import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { 
  MapPinIcon, 
  HeartIcon, 
  SparklesIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  BookOpenIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const retreats = [
  {
    name: 'Signature Retreats',
    description: 'Founder-led transformational experiences',
    href: '/retreats/signature',
    icon: SparklesIcon,
    featured: [
      { name: 'Agumbe Digital Detox', href: '/trips/agumbe-digital-detox' },
      { name: 'Coorg Couples Retreat', href: '/trips/coorg-couples-retreat' },
      { name: 'Spiti Spiritual Journey', href: '/trips/spiti-spiritual-journey' }
    ]
  },
  {
    name: 'Partner Experiences',
    description: 'Curated trips from trusted partners',
    href: '/retreats/partner',
    icon: UserGroupIcon,
    featured: [
      { name: 'Adventure Himachal', href: '/trips/adventure-himachal' },
      { name: 'Kerala Backwaters', href: '/trips/kerala-backwaters' },
      { name: 'Rajasthan Heritage', href: '/trips/rajasthan-heritage' }
    ]
  },
  {
    name: 'Premium Packages',
    description: 'Luxury experiences from SOTC & partners',
    href: '/retreats/premium',
    icon: BuildingOfficeIcon,
    featured: [
      { name: 'Luxury Goa Escape', href: '/trips/luxury-goa' },
      { name: 'Swiss Alps Adventure', href: '/trips/swiss-alps' },
      { name: 'Maldives Wellness', href: '/trips/maldives-wellness' }
    ]
  }
];

const destinations = [
  {
    name: 'Karnataka',
    description: 'Western Ghats & Coffee Plantations',
    href: '/destinations/karnataka',
    icon: MapPinIcon,
    image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Himachal Pradesh',
    description: 'Mountains & Spiritual Valleys',
    href: '/destinations/himachal',
    icon: MapPinIcon,
    image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    name: 'Upcoming Destinations',
    description: 'New experiences coming soon',
    href: '/destinations/upcoming',
    icon: GlobeAltIcon,
    image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

const transformations = [
  { name: 'Digital Detox', href: '/transformations/digital-detox', icon: '📱' },
  { name: 'Nature Therapy', href: '/transformations/nature-therapy', icon: '🌿' },
  { name: 'Spiritual Awakening', href: '/transformations/spiritual', icon: '🧘' },
  { name: 'Relationship Healing', href: '/transformations/relationships', icon: '💕' },
  { name: 'Career Clarity', href: '/transformations/career', icon: '🎯' },
  { name: 'Inner Peace', href: '/transformations/peace', icon: '☮️' }
];

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  return (
    <div className="relative">
      {/* Retreats Mega Menu */}
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="flex items-center gap-1 text-deep-forest hover:text-sunrise-coral transition-colors font-medium">
              Retreats
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-1 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-1 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-50 mt-3 w-screen max-w-4xl transform">
                <div className="overflow-hidden rounded-2xl bg-cloud-white shadow-2xl ring-1 ring-black/5">
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-8">
                      {retreats.map((item) => (
                        <motion.div
                          key={item.name}
                          whileHover={{ y: -2 }}
                          className="group"
                        >
                          <Link
                            to={item.href}
                            className="flex flex-col p-4 rounded-xl hover:bg-warm-sand transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <item.icon className="w-6 h-6 text-sunrise-coral" />
                              <h3 className="font-serif text-lg text-deep-forest group-hover:text-sunrise-coral transition-colors">
                                {item.name}
                              </h3>
                            </div>
                            <p className="text-mystic-indigo text-sm mb-4">
                              {item.description}
                            </p>
                            <div className="space-y-2">
                              {item.featured.map((trip) => (
                                <Link
                                  key={trip.name}
                                  to={trip.href}
                                  className="block text-sm text-soft-grey hover:text-sunrise-coral transition-colors"
                                >
                                  {trip.name}
                                </Link>
                              ))}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-soft-grey">
                      <div className="flex items-center justify-between">
                        <Link
                          to="/quiz"
                          className="bg-sunrise-coral text-cloud-white px-6 py-3 rounded-lg font-bold hover:bg-deep-forest transition-colors"
                        >
                          Find My Perfect Retreat →
                        </Link>
                        <Link
                          to="/trips"
                          className="text-mystic-indigo hover:text-sunrise-coral transition-colors font-medium"
                        >
                          View All Retreats
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      {/* Destinations Mega Menu */}
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="flex items-center gap-1 text-deep-forest hover:text-sunrise-coral transition-colors font-medium">
              Destinations
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-1 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-1 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-50 mt-3 w-screen max-w-2xl transform">
                <div className="overflow-hidden rounded-2xl bg-cloud-white shadow-2xl ring-1 ring-black/5">
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {destinations.map((destination) => (
                        <motion.div
                          key={destination.name}
                          whileHover={{ x: 4 }}
                          className="group"
                        >
                          <Link
                            to={destination.href}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-warm-sand transition-colors"
                          >
                            <img
                              src={destination.image}
                              alt={destination.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-serif text-lg text-deep-forest group-hover:text-sunrise-coral transition-colors">
                                {destination.name}
                              </h3>
                              <p className="text-mystic-indigo text-sm">
                                {destination.description}
                              </p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      {/* Transformations Mega Menu */}
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className="flex items-center gap-1 text-deep-forest hover:text-sunrise-coral transition-colors font-medium">
              Transformations
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-1 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-1 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-0 z-50 mt-3 w-80 transform">
                <div className="overflow-hidden rounded-2xl bg-cloud-white shadow-2xl ring-1 ring-black/5">
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {transformations.map((transformation) => (
                        <motion.div
                          key={transformation.name}
                          whileHover={{ scale: 1.02 }}
                          className="group"
                        >
                          <Link
                            to={transformation.href}
                            className="flex flex-col items-center p-4 rounded-xl hover:bg-warm-sand transition-colors text-center"
                          >
                            <span className="text-2xl mb-2">{transformation.icon}</span>
                            <span className="text-sm text-deep-forest group-hover:text-sunrise-coral transition-colors font-medium">
                              {transformation.name}
                            </span>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}