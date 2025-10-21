import { Trip } from '../types';

export const featuredTrips: Trip[] = [
  {
    id: '1',
    slug: 'agumbe-digital-detox',
    title: 'Agumbe Digital Detox',
    subtitle: 'Return to Yourself',
    image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    transformation: { from: 'Overwhelmed', to: 'Grounded' },
    duration: '5 Days',
    price: 18000,
    originalPrice: 22000,
    spotsLeft: 3,
    rating: 4.9,
    reviewCount: 47,
    location: 'Karnataka, India',
    description: 'Disconnect from digital chaos and reconnect with your inner peace in the lush Western Ghats.'
  },
  {
    id: '2',
    slug: 'coorg-couples-retreat',
    title: 'Coorg Couples Retreat',
    subtitle: 'Reconnect Beyond Words',
    image: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
    transformation: { from: 'Disconnected', to: 'United' },
    duration: '5 Days',
    price: 19000,
    originalPrice: 24000,
    spotsLeft: 2,
    rating: 5.0,
    reviewCount: 34,
    location: 'Karnataka, India',
    description: 'Rediscover intimacy and connection with your partner through guided experiences and nature.'
  },
  {
    id: '3',
    slug: 'spiti-spiritual-journey',
    title: 'Spiti Spiritual Journey',
    subtitle: 'Find What Logic Cannot',
    image: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800',
    transformation: { from: 'Searching', to: 'Belonging' },
    duration: '10 Days',
    price: 45000,
    originalPrice: 52000,
    spotsLeft: 5,
    rating: 4.8,
    reviewCount: 29,
    location: 'Himachal Pradesh, India',
    description: 'A profound journey through the high-altitude desert landscape that touches your soul.'
  }
];

export const allTrips: Trip[] = [...featuredTrips];