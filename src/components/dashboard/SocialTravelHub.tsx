import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Trophy, 
  MapPin,
  Star,
  Camera,
  UserPlus
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';

interface TravelBuddy {
  id: string;
  name: string;
  avatar: string;
  location: string;
  commonInterests: string[];
  compatibilityScore: number;
  upcomingTrip?: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  reward: string;
  deadline: string;
  completed: boolean;
}

interface TravelStory {
  id: string;
  author: string;
  avatar: string;
  location: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

const SocialTravelHub: React.FC = () => {
  const { user } = useAdventureStore();
  const [activeTab, setActiveTab] = useState<'buddies' | 'challenges' | 'stories'>('buddies');
  const [travelBuddies, setTravelBuddies] = useState<TravelBuddy[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [stories, setStories] = useState<TravelStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      setLoading(true);
      
      // Mock data - replace with API calls
      const mockBuddies: TravelBuddy[] = [
        {
          id: '1',
          name: 'Arjun Sharma',
          avatar: '👨‍💼',
          location: 'Mumbai',
          commonInterests: ['Trekking', 'Photography', 'Adventure'],
          compatibilityScore: 92,
          upcomingTrip: 'Kashmir Trek'
        },
        {
          id: '2',
          name: 'Priya Singh',
          avatar: '👩‍🦳',
          location: 'Delhi',
          commonInterests: ['Cultural Tours', 'Food', 'History'],
          compatibilityScore: 87,
          upcomingTrip: 'Rajasthan Circuit'
        },
        {
          id: '3',
          name: 'Rohit Patel',
          avatar: '👨‍🎓',
          location: 'Bangalore',
          commonInterests: ['Beach', 'Water Sports', 'Nightlife'],
          compatibilityScore: 81
        }
      ];

      const mockChallenges: CommunityChallenge[] = [
        {
          id: '1',
          title: 'Winter Explorer',
          description: 'Visit 3 hill stations this winter season',
          participants: 247,
          reward: '₹5,000 discount voucher',
          deadline: 'March 31, 2025',
          completed: false
        },
        {
          id: '2',
          title: 'Eco Warrior',
          description: 'Complete 2 eco-friendly trips',
          participants: 189,
          reward: 'Carbon offset certificate',
          deadline: 'June 15, 2025',
          completed: true
        },
        {
          id: '3',
          title: 'Photo Champion',
          description: 'Share 10 travel photos with #TrekAndStay',
          participants: 456,
          reward: 'Professional photo shoot',
          deadline: 'December 31, 2025',
          completed: false
        }
      ];

      const mockStories: TravelStory[] = [
        {
          id: '1',
          author: 'Sneha Reddy',
          avatar: '👩‍🦰',
          location: 'Goa Beaches',
          image: '🏖️',
          caption: 'Perfect sunset at Arambol Beach! The serenity here is unmatched.',
          likes: 234,
          comments: 18,
          timeAgo: '2 hours ago'
        },
        {
          id: '2',
          author: 'Vikram Kumar',
          avatar: '👨‍🦱',
          location: 'Manali Trek',
          image: '🏔️',
          caption: 'Conquered the Beas Kund trek! The views were absolutely breathtaking.',
          likes: 189,
          comments: 23,
          timeAgo: '5 hours ago'
        }
      ];

      setTimeout(() => {
        setTravelBuddies(mockBuddies);
        setChallenges(mockChallenges);
        setStories(mockStories);
        setLoading(false);
      }, 800);
    };

    if (user) {
      fetchSocialData();
    }
  }, [user]);

  if (!user) return null;

  const tabs = [
    { id: 'buddies', label: 'Travel Buddies', icon: Users },
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'stories', label: 'Stories', icon: Camera }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Social Travel Hub
          </h3>
          <p className="text-sm text-gray-600 mt-1">Connect, explore, and share with fellow travelers</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          Community
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'buddies' | 'challenges' | 'stories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Travel Buddies */}
            {activeTab === 'buddies' && (
              <div className="space-y-4">
                {travelBuddies.map((buddy) => (
                  <Card key={buddy.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                          {buddy.avatar}
                        </div>
                        <div>
                          <h4 className="font-medium">{buddy.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {buddy.location}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-green-600 font-medium">
                              {buddy.compatibilityScore}% match
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button size="sm" variant="primary" className="mb-2">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                        {buddy.upcomingTrip && (
                          <p className="text-xs text-gray-600">
                            Next: {buddy.upcomingTrip}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Common Interests:</p>
                      <div className="flex flex-wrap gap-1">
                        {buddy.commonInterests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Community Challenges */}
            {activeTab === 'challenges' && (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-5 h-5 ${challenge.completed ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <h4 className="font-medium">{challenge.title}</h4>
                        {challenge.completed && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <div>{challenge.participants} participants</div>
                        <div>Ends: {challenge.deadline}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Trophy className="w-3 h-3" />
                        Reward: {challenge.reward}
                      </div>
                      <Button 
                        size="sm" 
                        variant={challenge.completed ? 'secondary' : 'adventure'}
                        disabled={challenge.completed}
                      >
                        {challenge.completed ? 'Completed' : 'Join Challenge'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Travel Stories */}
            {activeTab === 'stories' && (
              <div className="space-y-4">
                {stories.map((story) => (
                  <Card key={story.id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-lg">
                        {story.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{story.author}</h4>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {story.location} • {story.timeAgo}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-6xl text-center py-4 bg-gray-50 rounded-lg">
                        {story.image}
                      </div>
                      <p className="text-sm mt-2">{story.caption}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" />
                          {story.likes}
                        </button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {story.comments}
                        </button>
                      </div>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </Card>
                ))}
                <Card className="p-4 text-center">
                  <h4 className="font-medium mb-2">Share Your Adventure</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload photos from your recent trips and inspire other travelers!
                  </p>
                  <Button variant="adventure" size="sm">
                    <Camera className="w-4 h-4 mr-1" />
                    Upload Story
                  </Button>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SocialTravelHub;
