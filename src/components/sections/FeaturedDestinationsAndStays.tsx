import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star as StarIcon, Clock, Users, ArrowRight, ShieldCheck, Wifi, Car, Coffee, Utensils, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTrips } from '../../services/api';
import { CenterModal } from '../ui/CenterModal';
import { AuroraBackground } from '../ui/aurora-background';
import { BackgroundBeams } from '../ui/background-beams';

interface TripDoc {
	id: string;
	name: string;
	location: string;
	difficulty?: string;
	duration?: string;
	price?: number;
	highlights?: string[];
	images?: string[];
	rating?: number;
	reviewCount?: number;
	category?: string;
	tags?: string[];
	spotsAvailable?: number;
	nextDeparture?: string;
	availableSlots?: number;
	isAvailable?: boolean;
	status?: string;
	maxCapacity?: number;
}

// Derive category from tags / name if not present
function deriveCategory(t: TripApiResponse): string {
	if (t.category) return t.category;
	const tags = (t.tags || []).map((s: string | unknown) => typeof s === 'string' ? s.toLowerCase() : '');
	const name = t.name ? String(t.name).toLowerCase() : '';
	if (tags.includes('waterfalls') || tags.includes('waterfall') || name.includes('falls') || name.includes('waterfall')) return 'waterfall';
	if (tags.includes('fort') || name.includes('fort')) return 'fort';
	if (tags.includes('beach') || name.includes('beach')) return 'beach';
	if (tags.includes('mountain') || tags.includes('peak') || name.includes('peak')) return 'hill';
	return 'adventure';
}

const categoryColors = {
	waterfall: 'text-waterfall-blue bg-waterfall-blue/10',
	fort: 'text-earth-brown bg-earth-brown/10',
	beach: 'text-mountain-blue bg-mountain-blue/10',
	hill: 'text-forest-green bg-forest-green/10',
};

const difficultyColors = {
	Easy: 'text-green-600 bg-green-100',
	Moderate: 'text-yellow-600 bg-yellow-100',
	Challenging: 'text-orange-600 bg-orange-100',
	Extreme: 'text-red-600 bg-red-100',
};

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

export const FeaturedDestinationsAndStays: React.FC = () => {
	const [destinations, setDestinations] = useState<TripDoc[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [quickView, setQuickView] = useState<TripDoc | null>(null);
	const navigate = useNavigate();

	const getAmenityIcon = (amenity: string) => {
		switch (amenity) {
			case 'wifi': return <Wifi className="w-4 h-4" />;
			case 'parking': return <Car className="w-4 h-4" />;
			case 'breakfast': return <Coffee className="w-4 h-4" />;
			case 'restaurant': return <Utensils className="w-4 h-4" />;
			default: return null;
		}
	};

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const data = await fetchTrips();
				if (!active) return;
				
				const featuredTrips: TripDoc[] = data.slice(0, 8).map((trip: TripApiResponse) => ({
					id: String(trip.id || trip.slug || ''),
					name: String(trip.name || trip.title || ''),
					location: String(trip.location || ''),
					difficulty: trip.difficulty ? String(trip.difficulty) : undefined,
					duration: trip.duration ? String(trip.duration) : trip.duration_days ? `${trip.duration_days} Days` : undefined,
					price: trip.price ? Number(trip.price) : undefined,
					highlights: Array.isArray(trip.highlights) ? trip.highlights.map(String) : [],
					images: Array.isArray(trip.images) ? trip.images.map(String) : trip.image ? [String(trip.image)] : [],
					rating: trip.rating ? Number(trip.rating) : 4.5,
					reviewCount: trip.review_count ? Number(trip.review_count) : 0,
					category: deriveCategory(trip),
					tags: Array.isArray(trip.tags) ? trip.tags.map(String) : [],
					spotsAvailable: trip.spots_available ? Number(trip.spots_available) : undefined,
					nextDeparture: trip.next_departure ? String(trip.next_departure) : undefined,
					availableSlots: trip.available_slots ? Number(trip.available_slots) : undefined,
					isAvailable: trip.is_available !== undefined ? Boolean(trip.is_available) : true,
					status: trip.status ? String(trip.status) : undefined,
					maxCapacity: trip.max_capacity ? Number(trip.max_capacity) : undefined
				}));

				setDestinations(featuredTrips);
			} catch (err) {
				console.error('Failed to fetch trips:', err);
				if (active) setError('Failed to load featured destinations');
			} finally {
				if (active) setLoading(false);
			}
		})();

		return () => { active = false; };
	}, []);

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		show: { opacity: 1, y: 0 },
	};

	const staysContainerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const staysItemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5
			}
		}
	};

	if (loading) {
		return (
			<section id="destinations-and-stays" className="py-20 bg-gradient-to-br from-stone-gray to-white">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
						{Array.from({ length: 8 }).map((_,i) => (
							<div key={i} className="h-80 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
						))}
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section id="destinations-and-stays" className="py-20">
				<div className="max-w-4xl mx-auto px-4 text-center text-red-600">{error}</div>
			</section>
		);
	}

	return (
		<section className="relative w-full pt-0 pb-16 md:pb-20 overflow-hidden">
			{/* Full-width Background Beams */}
			<div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
				<BackgroundBeams className="opacity-40" />
			</div>
			
		{/* SVG Trail at Top - Behind Content but Above Beams */}
		<div className="absolute top-0 left-0 right-0 w-full" style={{ zIndex: 5 }}>
			<svg viewBox="0 0 1200 60" className="w-full h-auto max-h-10 sm:max-h-12 md:max-h-16 block" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="destTrail" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#16a34a" stopOpacity="0.4"/><stop offset="25%" stopColor="#f97316" stopOpacity="0.6"/><stop offset="50%" stopColor="#f97316" stopOpacity="0.5"/><stop offset="75%" stopColor="#ea580c" stopOpacity="0.6"/><stop offset="100%" stopColor="#16a34a" stopOpacity="0.4"/>
						</linearGradient>
						<filter id="destGlow"><feGaussianBlur stdDeviation="1" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
					</defs>
					<path d="M 0,25 Q 150,8 300,25 T 600,25 T 900,25 T 1200,25" stroke="url(#destTrail)" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#destGlow)"/>
					<path d="M 0,30 Q 150,12 300,30 T 600,30 T 900,30 T 1200,30" stroke="#f97316" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3"/>
					<circle cx="150" cy="25" r="3" fill="#16a34a" opacity="0.7"/><circle cx="300" cy="25" r="3.5" fill="#f97316" opacity="0.8"/><circle cx="450" cy="25" r="2.5" fill="#ea580c" opacity="0.6"/><circle cx="600" cy="25" r="3.5" fill="#f97316" opacity="0.8"/><circle cx="750" cy="25" r="2.5" fill="#16a34a" opacity="0.6"/><circle cx="900" cy="25" r="3.5" fill="#f97316" opacity="0.8"/><circle cx="1050" cy="25" r="3" fill="#ea580c" opacity="0.7"/>
				</svg>
			</div>
		
		{/* Full-width Aurora Background */}
		<AuroraBackground showRadialGradient={true}>
			<div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-40 sm:pt-48 md:pt-32">
				{/* Featured Destinations Section */}
				<motion.div
					className="text-center mb-12 md:mb-16"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-great-adventurer font-bold text-forest-green mb-2 sm:mb-3 md:mb-4">
						Featured Adventures
					</h2>
					<p className="text-sm sm:text-base md:text-lg lg:text-xl font-inter text-mountain-blue/80 max-w-3xl mx-auto px-2">
						Discover our most popular destinations, carefully curated for the ultimate adventure experience
						</p>
				</motion.div>

			{/* Destinations Grid */}
			<motion.div
				className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 w-full mb-16 sm:mb-20 md:mb-24"
				variants={containerVariants}
				initial="hidden"
				whileInView="show"
				viewport={{ once: true }}
			>
				{destinations.map((destination) => (
					<motion.div key={destination.id} variants={itemVariants}>
						<Card className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
							{/* Image Container */}
							<div className="relative overflow-hidden flex-shrink-0 h-40 sm:h-48">
								<img
									src={destination.images?.[0] || '/placeholder.jpg'}
									alt={destination.name}
									className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
									loading="lazy"
									decoding="async"
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
								/>

								{/* Image Overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

								{/* Category Badge */}
								<div className="absolute top-3 left-3">
									<span
										className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-md ${categoryColors[destination.category as keyof typeof categoryColors]}`}
									>
										{destination.category}
									</span>
								</div>

								{/* Difficulty Badge */}
								<div className="absolute top-3 right-3">
									<span
										className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${difficultyColors[destination.difficulty as keyof typeof difficultyColors] || 'text-gray-600 bg-gray-100'}`}
									>
										{destination.difficulty || 'Mixed'}
									</span>
								</div>

								{/* Status Badges */}
								<div className="absolute top-3 left-24 flex gap-2">
									{destination.status === 'promoted' && (
										<span className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse">
											🔥 Hot Deal
										</span>
									)}
									{destination.availableSlots !== undefined && destination.availableSlots <= 2 && destination.availableSlots > 0 && (
										<span className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
											Only {destination.availableSlots} left!
										</span>
									)}
									{destination.availableSlots !== undefined && destination.availableSlots === 0 && (
										<span className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-gray-600 text-white shadow-lg">
											Fully Booked
										</span>
									)}
								</div>

								{/* Rating */}
								<div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
									<StarIcon className="w-4 h-4 fill-current text-sunset-yellow" />
									<span className="text-sm font-bold text-white">{destination.rating}</span>
									<span className="text-xs text-white/80">({destination.reviewCount})</span>
								</div>
							</div>

							{/* Content */}
							<div className="p-3 sm:p-4 flex flex-col flex-grow">
								<h3 className="text-base sm:text-lg font-bold text-forest-green mb-2 group-hover:text-adventure-orange transition-colors line-clamp-2">
									{destination.name}
								</h3>

								<div className="flex items-center text-mountain-blue/80 mb-2 text-xs sm:text-sm">
									<MapPin className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 flex-shrink-0" />
									<span className="truncate">{destination.location}</span>
								</div>

								{/* Highlights */}
								<ul className="text-xs text-gray-600 mb-3 space-y-1 flex-grow">
									{destination.highlights?.slice(0, 2).map((highlight, i) => (
										<li key={i} className="flex items-start">
											<div className="w-1.5 h-1.5 bg-adventure-orange rounded-full mr-2 mt-0.5 flex-shrink-0" />
											<span className="line-clamp-1">{highlight}</span>
										</li>
									))}
								</ul>

								{/* Meta Info */}
								<div className="flex items-center justify-between text-xs text-mountain-blue/80 mb-3 gap-1">
									<div className="flex items-center min-w-fit">
										<Clock className="w-3 h-3 mr-1 flex-shrink-0" />
										<span className="truncate">{destination.duration}</span>
									</div>
									<div className="flex items-center min-w-fit text-right">
										<Users className="w-3 h-3 mr-1 flex-shrink-0" />
										<span className="truncate">{destination.availableSlots !== undefined ? `${destination.availableSlots} avail` : 'Check'}</span>
									</div>
								</div>

								{/* Price and CTA */}
								<div className="flex items-center justify-between gap-1 flex-wrap">
									<div className="flex-shrink-0 flex flex-col">
										<span className="text-base sm:text-lg font-bold text-forest-green">
											₹{destination.price?.toLocaleString()}
										</span>
										<span className="text-xs text-gray-500">/person</span>
									</div>
									<div className="flex items-center gap-1 flex-wrap">
										<Button
											variant="secondary"
											size="sm"
											onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.stopPropagation();
												setQuickView(destination);
											}}
											aria-label={`Quick view ${destination.name}`}
											className="text-xs px-2 py-1 whitespace-nowrap"
										>
											Quick view
										</Button>
										<Link to={`/trip/${destination.id}`} className="flex-shrink-0">
											<Button
												variant="adventure"
												size="sm"
												className="group-hover:scale-110 transition-transform px-2 py-1"
												aria-label={`View details for ${destination.name}`}
											>
												<ArrowRight className="w-3 h-3" />
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				))}
			</motion.div>

					{/* Featured Stays Section */}
					<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12 md:mb-16"
				>
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-oswald font-bold text-forest-green mb-3 sm:mb-4">
						Featured Stays
					</h2>
					<p className="text-sm sm:text-base md:text-lg lg:text-xl font-inter text-mountain-blue max-w-3xl mx-auto px-2">
						Discover handpicked accommodations that offer exceptional experiences and comfort for your perfect getaway
					</p>
				</motion.div>					{/* Stays Grid */}
					<motion.div
						variants={staysContainerVariants}
						initial="hidden"
						whileInView="visible"
					viewport={{ once: true }}
					className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
				>
					{featuredStays.map((stay) => (
						<motion.div key={stay.id} variants={staysItemVariants}>
							<Card className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
								<div className="relative flex-shrink-0">
									<img
										src={stay.image}
										alt={stay.name}
										className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
									/>
									<div className="absolute top-3 left-3">
										<Badge className="bg-red-500 text-white font-semibold text-xs sm:text-sm">
											{stay.discount}
										</Badge>
									</div>
									<div className="absolute top-3 right-3">
										<Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs sm:text-sm">
											{stay.category}
										</Badge>
									</div>
								</div>
								
								<div className="p-3 sm:p-4 flex flex-col flex-grow">
									<div className="flex items-center gap-2 mb-2">
										<MapPin className="w-3 sm:w-4 h-3 sm:h-4 text-adventure-orange flex-shrink-0" />
										<span className="text-xs sm:text-sm text-mountain-blue truncate">{stay.location}</span>
									</div>
									
									<h3 className="text-base sm:text-lg font-oswald font-bold text-forest-green mb-1 group-hover:text-adventure-orange transition-colors line-clamp-2">
										{stay.name}
									</h3>
									
									<p className="font-inter text-mountain-blue text-xs sm:text-sm mb-2 line-clamp-2">{stay.description}</p>
									
									<div className="flex items-center gap-1 mb-3">
										<div className="flex items-center gap-1">
											<Star className="w-3 sm:w-4 h-3 sm:h-4 fill-yellow-400 text-yellow-400" />
											<span className="text-xs sm:text-sm font-semibold">{stay.rating}</span>
										</div>
										<span className="text-xs text-gray-500">({stay.reviews})</span>
									</div>
									
									<div className="flex items-center gap-1 mb-3 flex-wrap">
										{stay.amenities.slice(0, 3).map((amenity) => (
											<div
												key={amenity}
												className="flex items-center justify-center w-6 sm:w-8 h-6 sm:h-8 bg-adventure-orange/10 rounded-lg text-adventure-orange flex-shrink-0"
											>
												{getAmenityIcon(amenity)}
											</div>
										))}
									</div>
									
									<div className="flex items-center justify-between mb-3 gap-2 flex-wrap flex-grow">
										<div className="flex items-center gap-1">
											<span className="text-base sm:text-lg font-oswald font-bold text-adventure-orange">{stay.price}</span>
											<span className="text-xs text-mountain-blue line-through">{stay.originalPrice}</span>
										</div>
										<span className="text-xs text-mountain-blue whitespace-nowrap">per night</span>
									</div>
									
									<Button
										onClick={() => navigate(`/stays/${stay.id}`)}
										variant="adventure"
										size="sm"
										className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 group-hover:scale-110 transition-transform w-full text-xs sm:text-sm"
									>
										Book Now
									</Button>
								</div>
							</Card>
						</motion.div>
					))}
				</motion.div>					{/* View All Buttons */}
					<motion.div
						className="text-center mt-12 md:mt-16"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						<div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
							<Link to="/destinations">
								<Button
									variant="primary"
									size="lg"
									className="font-tall-rugged text-base md:text-lg px-6 md:px-8"
								>
									View All Destinations
									<ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
								</Button>
							</Link>
							<Link
								to="/catalog"
								className="text-sm md:text-base text-mountain-blue hover:text-forest-green underline-offset-2 hover:underline"
							>
								or open the full catalog explorer
							</Link>
						</div>
					</motion.div>

				{/* Quick View Modal */}
				<CenterModal
					isOpen={!!quickView}
					onClose={() => setQuickView(null)}
					title={quickView?.name}
					showCloseButton={true}
				>
						{quickView && (
							<div className="w-full">
								{/* Image Section */}
								<div className="relative w-full h-40 sm:h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
									<img
										src={quickView.images?.[0] || '/placeholder.jpg'}
										alt={quickView.name}
										className="w-full h-full object-cover"
										loading="lazy"
										decoding="async"
									/>
									<div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full text-white">
										<StarIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-current text-sunset-yellow" />
										<span className="text-xs sm:text-sm md:text-base font-medium">{quickView.rating} ({quickView.reviewCount})</span>
									</div>
								</div>

								{/* Content */}
								<div className="space-y-3 sm:space-y-4 md:space-y-5">
									{/* Location */}
									<div className="flex items-center text-mountain-blue gap-2">
										<MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
										<span className="text-sm sm:text-base md:text-lg">{quickView.location}</span>
									</div>

									{/* Highlights */}
									<div>
										<h4 className="text-sm sm:text-base md:text-lg font-bold text-gray-700 mb-2">Highlights:</h4>
										<ul className="space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-base text-gray-700">
											{quickView.highlights?.slice(0, 3).map((h, i) => (
												<li key={i} className="flex items-start">
													<div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-adventure-orange rounded-full mr-2 sm:mr-3 md:mr-4 mt-1.5 flex-shrink-0" />
													<span>{h}</span>
												</li>
											))}
										</ul>
									</div>

									{/* Info Grid */}
									<div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 py-3 sm:py-4 md:py-5 border-t border-b border-gray-200">
										<div className="text-center">
											<Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1 sm:mb-1.5 md:mb-2 text-mountain-blue" />
											<div className="text-xs sm:text-sm md:text-base font-semibold text-gray-800">{quickView.duration}</div>
										</div>
										<div className="text-center">
											<Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1 sm:mb-1.5 md:mb-2 text-mountain-blue" />
											<div className="text-xs sm:text-sm md:text-base font-semibold text-gray-800">{quickView.availableSlots || 'Check'}</div>
										</div>
										<div className="text-center">
											<ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mx-auto mb-1 sm:mb-1.5 md:mb-2 text-green-600" />
											<div className="text-xs sm:text-sm md:text-base font-semibold text-green-700">Certified</div>
										</div>
									</div>

									{/* Price */}
									<div>
										<span className="text-xl sm:text-2xl md:text-3xl font-outbrave font-bold text-forest-green">₹{quickView.price?.toLocaleString()}</span>
										<span className="text-xs sm:text-sm md:text-base text-gray-500 ml-2">/person</span>
									</div>

									{/* CTAs */}
									<div className="space-y-2 sm:space-y-2.5 md:space-y-3 pt-2 sm:pt-3 md:pt-4">
										<Link to={`/trip/${quickView.id}`} className="block">
											<Button
												variant="primary"
												size="lg"
												className="w-full text-sm sm:text-base md:text-lg py-2 sm:py-2.5 md:py-3"
												onClick={() => setQuickView(null)}
											>
												View Full Details & Book
											</Button>
										</Link>
										<button
											className="w-full py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-5 border-2 border-gray-300 text-gray-700 font-semibold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-gray-50 transition-colors"
											onClick={() => setQuickView(null)}
										>
											Close
										</button>
									</div>
								</div>
							</div>
						)}
					</CenterModal>
				</div>
			</AuroraBackground>

			{/* Gradient fade-out at bottom - blend to next section */}
			<div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-transparent via-white/30 to-white/80 z-20 pointer-events-none" />
		</section>
	);
};
