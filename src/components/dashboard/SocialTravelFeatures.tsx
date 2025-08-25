import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Camera,
  MapPin,
  Star,
  MessageSquare,
  UserPlus,
  Award,
  Eye,
  Bookmark,
  Send,
  Plus,
  Filter,
  Search,
  Bell,
  Globe,
  Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { useAdventureStore } from '../../store/adventureStore';
import { userIntelligenceService } from '../../services/userIntelligence';

interface TravelPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  destination: string;
  caption: string;
  images: string[];
  likes: number;
  comments: Comment[];
  shares: number;
  tags: string[];
  timestamp: Date;
  location: { lat: number; lng: number; name: string };
  isLiked: boolean;
  isBookmarked: boolean;
  travelTips?: string[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: Date;
  likes: number;
}

interface TravelBuddy {
  id: string;
  name: string;
  avatar: string;
  location: string;
  travelStyle: string[];
  completedTrips: number;
  rating: number;
  commonInterests: string[];
  upcomingTrips: string[];
  isConnected: boolean;
  mutualFriends: number;
  compatibility: number;
}

interface TravelGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  category: string;
  recentActivity: string;
  coverImage: string;
  isJoined: boolean;
  admins: string[];
}

interface SocialStats {
  followers: number;
  following: number;
  posts: number;
  tripsBadges: number;
  totalLikes: number;
  influence: number;
}

const SocialTravelFeatures: React.FC = () => {
  const { user } = useAdventureStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'buddies' | 'groups' | 'profile'>('feed');
  const [posts, setPosts] = useState<TravelPost[]>([]);
  const [travelBuddies, setTravelBuddies] = useState<TravelBuddy[]>([]);
  const [travelGroups, setTravelGroups] = useState<TravelGroup[]>([]);
  const [socialStats, setSocialStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const initializeSocialFeatures = useCallback(async () => {
    try {
      setLoading(true);
      
      // Track social features usage
      if (user?.id) {
        await userIntelligenceService.trackUserBehavior(user.id.toString(), {
          type: 'social_view',
          data: { 
            section: 'social_travel_features',
            tab: activeTab,
            timestamp: new Date()
          },
          timestamp: new Date(),
          sessionId: ''
        });
      }

      // Load social data
      const [postsData, buddiesData, groupsData, statsData] = await Promise.all([
        generateSamplePosts(),
        generateTravelBuddies(),
        generateTravelGroups(),
        generateSocialStats()
      ]);

      setPosts(postsData);
      setTravelBuddies(buddiesData);
      setTravelGroups(groupsData);
      setSocialStats(statsData);

    } catch (error) {
      console.error('Error initializing social features:', error);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user?.id) {
      initializeSocialFeatures();
    }
  }, [user, initializeSocialFeatures]);

  const generateSamplePosts = async (): Promise<TravelPost[]> => {
    return [
      {
        id: 'post1',
        userId: 'user1',
        userName: 'Priya Sharma',
        userAvatar: '/api/placeholder/40/40',
        destination: 'Manali, Himachal Pradesh',
        caption: 'Just completed the most incredible trek to Hampta Pass! The views were absolutely breathtaking and the experience was life-changing. Highly recommend this for adventure enthusiasts! 🏔️ #HamptaPass #ManaliTrek #AdventureTravel',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        likes: 247,
        comments: [
          {
            id: 'c1',
            userId: 'user2',
            userName: 'Rahul Kumar',
            userAvatar: '/api/placeholder/30/30',
            text: 'Amazing shots! How difficult was the trek?',
            timestamp: new Date('2024-08-12'),
            likes: 12
          },
          {
            id: 'c2',
            userId: 'user3',
            userName: 'Sneha Patel',
            userAvatar: '/api/placeholder/30/30',
            text: 'Adding this to my bucket list! Thanks for sharing ✨',
            timestamp: new Date('2024-08-12'),
            likes: 8
          }
        ],
        shares: 34,
        tags: ['adventure', 'trekking', 'himachal', 'manali'],
        timestamp: new Date('2024-08-11'),
        location: { lat: 32.2432, lng: 77.1892, name: 'Manali, HP' },
        isLiked: false,
        isBookmarked: true,
        travelTips: [
          'Start early morning around 6 AM',
          'Carry enough water and snacks',
          'Weather can change quickly, pack layers'
        ]
      },
      {
        id: 'post2',
        userId: 'user4',
        userName: 'Arjun Mehta',
        userAvatar: '/api/placeholder/40/40',
        destination: 'Goa Beaches',
        caption: 'Perfect sunset at Arambol Beach! Sometimes you just need to disconnect and enjoy the simple moments. Goa never disappoints! 🌅 #GoaSunset #BeachLife #TravelTherapy',
        images: ['/api/placeholder/400/300'],
        likes: 189,
        comments: [
          {
            id: 'c3',
            userId: 'user5',
            userName: 'Maya Singh',
            userAvatar: '/api/placeholder/30/30',
            text: 'Gorgeous! Which beach is this?',
            timestamp: new Date('2024-08-10'),
            likes: 5
          }
        ],
        shares: 23,
        tags: ['goa', 'beach', 'sunset', 'relaxation'],
        timestamp: new Date('2024-08-10'),
        location: { lat: 15.6869, lng: 73.7361, name: 'Arambol, Goa' },
        isLiked: true,
        isBookmarked: false,
        travelTips: [
          'Visit during weekdays for fewer crowds',
          'Best sunset views from 6:30-7:00 PM'
        ]
      },
      {
        id: 'post3',
        userId: 'user6',
        userName: 'Kavya Reddy',
        userAvatar: '/api/placeholder/40/40',
        destination: 'Kerala Backwaters',
        caption: 'Floating through paradise in the Kerala backwaters! The houseboat experience was magical - waking up to misty mornings and falling asleep to gentle water sounds. Pure bliss! 🛶 #KeralaBackwaters #HouseboatStay #SereneVibes',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
        likes: 312,
        comments: [
          {
            id: 'c4',
            userId: 'user7',
            userName: 'Deepak Joshi',
            userAvatar: '/api/placeholder/30/30',
            text: 'Looks incredibly peaceful! How was the food on the houseboat?',
            timestamp: new Date('2024-08-09'),
            likes: 7
          }
        ],
        shares: 45,
        tags: ['kerala', 'backwaters', 'houseboat', 'peaceful'],
        timestamp: new Date('2024-08-09'),
        location: { lat: 9.4981, lng: 76.3388, name: 'Alleppey, Kerala' },
        isLiked: true,
        isBookmarked: true,
        travelTips: [
          'Book houseboats in advance during peak season',
          'Try the traditional Kerala fish curry',
          'Don\'t forget mosquito repellent'
        ]
      }
    ];
  };

  const generateTravelBuddies = async (): Promise<TravelBuddy[]> => {
    return [
      {
        id: 'buddy1',
        name: 'Aman Gupta',
        avatar: '/api/placeholder/60/60',
        location: 'Mumbai, Maharashtra',
        travelStyle: ['Adventure', 'Photography', 'Budget Travel'],
        completedTrips: 23,
        rating: 4.8,
        commonInterests: ['Trekking', 'Photography', 'Local Culture'],
        upcomingTrips: ['Spiti Valley', 'Ladakh'],
        isConnected: false,
        mutualFriends: 12,
        compatibility: 92
      },
      {
        id: 'buddy2',
        name: 'Nisha Agarwal',
        avatar: '/api/placeholder/60/60',
        location: 'Dali, Near Kollur, Karnataka',
        travelStyle: ['Cultural', 'Food', 'Photography'],
        completedTrips: 31,
        rating: 4.9,
        commonInterests: ['Food Tours', 'Heritage Sites', 'Art'],
        upcomingTrips: ['Rajasthan Circuit', 'South India Temple Tour'],
        isConnected: true,
        mutualFriends: 8,
        compatibility: 88
      },
      {
        id: 'buddy3',
        name: 'Rohit Shah',
        avatar: '/api/placeholder/60/60',
        location: 'Delhi, NCR',
        travelStyle: ['Adventure', 'Wildlife', 'Offbeat'],
        completedTrips: 19,
        rating: 4.7,
        commonInterests: ['Wildlife Photography', 'Camping', 'Trekking'],
        upcomingTrips: ['Jim Corbett', 'Ranthambore'],
        isConnected: false,
        mutualFriends: 5,
        compatibility: 85
      },
      {
        id: 'buddy4',
        name: 'Tanvi Jain',
        avatar: '/api/placeholder/60/60',
        location: 'Pune, Maharashtra',
        travelStyle: ['Luxury', 'Wellness', 'Beach'],
        completedTrips: 27,
        rating: 4.6,
        commonInterests: ['Spa Retreats', 'Beach Resorts', 'Yoga'],
        upcomingTrips: ['Maldives', 'Kerala Ayurveda Retreat'],
        isConnected: false,
        mutualFriends: 15,
        compatibility: 79
      }
    ];
  };

  const generateTravelGroups = async (): Promise<TravelGroup[]> => {
    return [
      {
        id: 'group1',
        name: 'Himalayan Trekkers United',
        description: 'A community of passionate trekkers exploring the Himalayas together',
        memberCount: 2847,
        isPrivate: false,
        category: 'Adventure',
        recentActivity: 'New discussion: Best time to trek Everest Base Camp',
        coverImage: '/api/placeholder/300/200',
        isJoined: true,
        admins: ['admin1', 'admin2']
      },
      {
        id: 'group2',
        name: 'Budget Travel India',
        description: 'Share tips, tricks and experiences for budget-friendly travel across India',
        memberCount: 5632,
        isPrivate: false,
        category: 'Budget Travel',
        recentActivity: 'Sarah shared: ₹500/day Kerala itinerary',
        coverImage: '/api/placeholder/300/200',
        isJoined: false,
        admins: ['admin3']
      },
      {
        id: 'group3',
        name: 'Solo Female Travelers',
        description: 'Empowering women to explore the world safely and confidently',
        memberCount: 3421,
        isPrivate: true,
        category: 'Solo Travel',
        recentActivity: 'Member shared safety tips for Rajasthan',
        coverImage: '/api/placeholder/300/200',
        isJoined: true,
        admins: ['admin4', 'admin5']
      },
      {
        id: 'group4',
        name: 'Photography & Travel',
        description: 'Capture and share the beauty of India through photography',
        memberCount: 4156,
        isPrivate: false,
        category: 'Photography',
        recentActivity: 'Photo contest: Best sunrise/sunset shots',
        coverImage: '/api/placeholder/300/200',
        isJoined: false,
        admins: ['admin6']
      }
    ];
  };

  const generateSocialStats = async (): Promise<SocialStats> => {
    return {
      followers: 1247,
      following: 856,
      posts: 34,
      tripsBadges: 12,
      totalLikes: 5623,
      influence: 78
    };
  };

  const handlePostLike = async (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );

    // Track like action
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'social_interaction',
        data: { 
          action: 'post_like',
          postId,
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const handleBookmark = async (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );

    // Track bookmark action
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'social_interaction',
        data: { 
          action: 'post_bookmark',
          postId,
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const handleConnect = async (buddyId: string) => {
    setTravelBuddies(prevBuddies =>
      prevBuddies.map(buddy =>
        buddy.id === buddyId
          ? { ...buddy, isConnected: !buddy.isConnected }
          : buddy
      )
    );

    // Track connect action
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'social_interaction',
        data: { 
          action: 'buddy_connect',
          buddyId,
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setTravelGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
          ? { 
              ...group, 
              isJoined: !group.isJoined,
              memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1
            }
          : group
      )
    );

    // Track group join action
    if (user?.id) {
      await userIntelligenceService.trackUserBehavior(user.id.toString(), {
        type: 'social_interaction',
        data: { 
          action: 'group_join',
          groupId,
          timestamp: new Date()
        },
        timestamp: new Date(),
        sessionId: ''
      });
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Travel Community
            <Badge className="bg-green-100 text-green-800">
              Social
            </Badge>
          </h1>
          <p className="text-gray-600 mt-2">
            Connect, share, and discover with fellow travelers
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm" onClick={() => setShowCreatePost(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Share Trip
          </Button>
        </div>
      </div>

      {/* Social Stats */}
      {socialStats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{socialStats.followers.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{socialStats.following.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Following</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{socialStats.posts}</div>
            <div className="text-xs text-gray-500">Posts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{socialStats.tripsBadges}</div>
            <div className="text-xs text-gray-500">Badges</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{socialStats.totalLikes.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Likes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{socialStats.influence}%</div>
            <div className="text-xs text-gray-500">Influence</div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'feed', label: 'Travel Feed', icon: <Globe className="w-4 h-4" /> },
          { id: 'buddies', label: 'Find Buddies', icon: <Users className="w-4 h-4" /> },
          { id: 'groups', label: 'Travel Groups', icon: <MessageCircle className="w-4 h-4" /> },
          { id: 'profile', label: 'My Profile', icon: <Award className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'feed' | 'buddies' | 'groups' | 'profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Create Post */}
            {showCreatePost && (
              <Card className="p-6 border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{user?.name?.[0] || 'U'}</span>
                  </div>
                  <div>
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-sm text-gray-500">Share your travel experience</div>
                  </div>
                </div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your travel story, tips, or photos..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Camera className="w-4 h-4 mr-1" />
                      Photos
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCreatePost(false)}>
                      Cancel
                    </Button>
                    <Button size="sm">
                      <Send className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Posts Feed */}
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{post.userName[0]}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{post.userName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {post.destination} • {formatTimeAgo(post.timestamp)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-gray-800 mb-3">{post.caption}</p>
                  {post.travelTips && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <div className="text-sm font-medium text-blue-800 mb-2">Travel Tips:</div>
                      <ul className="space-y-1">
                        {post.travelTips.map((tip, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Post Images */}
                {post.images.length > 0 && (
                  <div className={`grid gap-1 ${
                    post.images.length === 1 ? 'grid-cols-1' :
                    post.images.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {post.images.map((_, index) => (
                      <div key={index} className="aspect-square bg-gray-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handlePostLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.comments.length}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium">{post.shares}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-colors ${
                        post.isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} className="text-xs bg-gray-100 text-gray-600">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Comments Preview */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-sm text-gray-700 ml-2">{comment.text}</span>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          View all {post.comments.length} comments
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'buddies' && (
          <motion.div
            key="buddies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search travel buddies by location, interests..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <Button variant="secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </Card>

            {/* Travel Buddies */}
            <div className="grid md:grid-cols-2 gap-6">
              {travelBuddies.map((buddy) => (
                <Card key={buddy.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{buddy.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{buddy.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {buddy.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{buddy.rating}</span>
                          </div>
                          <Badge className="text-xs bg-green-100 text-green-800">
                            {buddy.compatibility}% match
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Travel Style</div>
                        <div className="flex flex-wrap gap-1">
                          {buddy.travelStyle.map((style, index) => (
                            <Badge key={index} className="text-xs bg-blue-100 text-blue-700">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Common Interests</div>
                        <div className="flex flex-wrap gap-1">
                          {buddy.commonInterests.map((interest, index) => (
                            <Badge key={index} className="text-xs bg-purple-100 text-purple-700">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{buddy.completedTrips} trips completed</span>
                        <span>{buddy.mutualFriends} mutual connections</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleConnect(buddy.id)}
                          className={buddy.isConnected ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {buddy.isConnected ? (
                            <>
                              <Users className="w-4 h-4 mr-1" />
                              Connected
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Connect
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'groups' && (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {travelGroups.map((group) => (
                <Card key={group.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-indigo-400 to-purple-500 relative">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold text-white">{group.name}</h3>
                      <p className="text-sm text-gray-200">{group.memberCount.toLocaleString()} members</p>
                    </div>
                    {group.isPrivate && (
                      <Badge className="absolute top-4 right-4 bg-yellow-100 text-yellow-800">
                        Private
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                    
                    <div className="mb-3">
                      <Badge className="text-xs bg-indigo-100 text-indigo-700">
                        {group.category}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Recent Activity</div>
                      <div className="text-sm text-gray-800">{group.recentActivity}</div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                      className={`w-full ${group.isJoined ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      {group.isJoined ? 'Joined' : 'Join Group'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <Award className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile Coming Soon
            </h3>
            <p className="text-gray-500 mb-6">
              Your travel profile with achievements, badges, and travel history.
            </p>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialTravelFeatures;
