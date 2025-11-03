import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star as StarIcon, Clock, Users, ArrowRight, Flame } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { fetchTrips } from '../../services/api';

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
function deriveCategory(t: TripDoc): string {
	if (t.category) return t.category;
	const tags = (t.tags || []).map(s => s.toLowerCase());
	const name = t.name.toLowerCase();
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

export const FeaturedTreks: React.FC = () => {
	const [trips, setTrips] = useState<TripDoc[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				setLoading(true);
				setError(null);
				
				// Fetch from Django backend
				const data = await fetchTrips();
				console.log('FeaturedTreks: Fetched trips:', data);
				
				if (!active) return;
				
				if (!data || data.length === 0) {
					console.warn('FeaturedTreks: No trips returned from API');
					setTrips([]);
					setLoading(false);
					return;
				}

				// Sort trips: popular/confirmed first, then others
				const sortedTrips = data
					.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
						// Priority 1: Confirmed/popular trips (status === 'confirmed' or rating > 4.5)
						const aPriority = (a.status === 'confirmed' || (a.rating && typeof a.rating === 'number' && a.rating > 4.5)) ? 2 : 
										(a.status === 'promoted') ? 1 : 0;
						const bPriority = (b.status === 'confirmed' || (b.rating && typeof b.rating === 'number' && b.rating > 4.5)) ? 2 : 
										(b.status === 'promoted') ? 1 : 0;
						
						if (aPriority !== bPriority) return bPriority - aPriority;
						
						// Secondary sort by rating
						return (typeof b.rating === 'number' ? b.rating : 0) - (typeof a.rating === 'number' ? a.rating : 0);
					})
					.slice(0, 6) // Take first 6 trips (prioritized)
					.map((trip: Record<string, unknown>) => ({
						id: trip.id?.toString() || trip.slug,
						name: trip.name || trip.title,
						location: trip.location,
						difficulty: trip.difficulty,
						duration: trip.duration || `${trip.duration_days || 3} Days`,
						price: trip.price,
						highlights: trip.highlights || [],
						images: trip.images || [trip.image],
						rating: trip.rating || 4.5,
						reviewCount: trip.review_count || trip.reviewCount || 0,
						category: trip.category,
						tags: trip.tags || [],
						spotsAvailable: trip.available_seats || trip.spotsLeft,
						nextDeparture: trip.next_departure,
						availableSlots: trip.available_slots,
						isAvailable: trip.is_available,
						status: trip.status,
						maxCapacity: trip.max_capacity,
					}));

				console.log('FeaturedTreks: Sorted trips:', sortedTrips);
				setTrips(sortedTrips);
			} catch (err) {
				console.error('FeaturedTreks: Error fetching trips:', err);
				if (active) {
					setError('Failed to load featured treks');
					setTrips([]);
				}
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, []);

	const featuredTreks = useMemo(() => trips.map(t => ({
		id: t.id,
		name: t.name,
		category: deriveCategory(t),
		location: t.location,
		difficulty: t.difficulty || 'Moderate',
		duration: t.duration || '3 Days',
		price: t.price || 0,
		rating: t.rating || 4.7,
		reviewCount: t.reviewCount || 12,
		image: (t.images && t.images[0]) || 'https://via.placeholder.com/400x300?text=Adventure',
		highlights: t.highlights && t.highlights.length ? t.highlights : ['Scenic views','Great experience','Guided trek'],
		availableSlots: t.availableSlots,
		isAvailable: t.isAvailable,
		status: t.status,
		maxCapacity: t.maxCapacity,
	})), [trips]);

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

	// Don't render section if no trips and not loading
	if (!loading && !error && featuredTreks.length === 0) {
		console.warn('FeaturedTreks: No featured treks to display');
		return null;
	}

	// Show error state
	if (error && !loading) {
		return (
			<section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
				<div className="max-w-7xl mx-auto px-4 text-center">
					<p className="text-red-600 text-lg mb-4">{error}</p>
					<p className="text-gray-600">Please ensure Django backend is running on http://localhost:8000</p>
				</div>
			</section>
		);
	}

	if (loading) {
		return (
			<section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{Array.from({ length: 4 }).map((_,i) => (
							<div key={i} className="h-72 rounded-2xl bg-gradient-to-r from-orange-200 via-red-100 to-orange-200 animate-pulse" />
						))}
					</div>
				</div>
			</section>
		);
	}
	if (error) {
		return null; // Silently fail for this section
	}

	return (
		<section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
			<div className="max-w-7xl mx-auto px-4">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<div className="flex items-center justify-center gap-2 mb-4">
						<Flame className="w-8 h-8 text-orange-500" />
						<h2 className="text-4xl lg:text-5xl font-oswald font-bold text-orange-600">
							🔥 Hot Deals
						</h2>
						<Flame className="w-8 h-8 text-red-500" />
					</div>
					<p className="text-xl text-orange-700 font-inter max-w-3xl mx-auto">
						Don't miss out on these limited-time offers! These treks are filling up fast.
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
					variants={containerVariants}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
				>
					{featuredTreks.map((trek) => (
						<motion.div key={trek.id} variants={itemVariants}>
							<Card
								className="h-full group cursor-pointer overflow-hidden ring-2 ring-orange-400 shadow-lg shadow-orange-400/30"
								hover
								tilt
								glow
							>
								<div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
									   <motion.img
										   src={trek.image}
										   alt={trek.name}
										   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
										   loading="lazy"
										   decoding="async"
										   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
									   />

									   {/* Image Overlay */}
									   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

									   {/* Hot Deal Badge */}
									   <div className="absolute top-3 left-3">
										   <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg animate-pulse">
											   🔥 HOT DEAL
										   </span>
									   </div>

									   {/* Capacity Badge */}
									   {trek.availableSlots !== undefined && trek.availableSlots <= 3 && trek.availableSlots > 0 && (
										   <div className="absolute top-3 right-3">
											   <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-bounce">
												   Only {trek.availableSlots} left!
											   </span>
										   </div>
									   )}

									   {/* Rating */}
									   <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-white">
										   <StarIcon className="w-4 h-4 fill-current text-sunset-yellow" />
										   <span className="text-sm font-medium">{trek.rating}</span>
										   <span className="text-xs opacity-80">({trek.reviewCount})</span>
									   </div>
								   </div>

								{/* Content */}
								<div className="p-5">
									<h3 className="text-lg font-oswald font-bold text-orange-600 mb-2 group-hover:text-red-600 transition-colors">
										{trek.name}
									</h3>

									<div className="flex items-center text-orange-700 mb-3">
										<MapPin className="w-4 h-4 mr-1" />
										<span className="text-sm font-inter">{trek.location}</span>
									</div>

									{/* Highlights */}
									<ul className="text-sm text-gray-600 mb-4 space-y-1">
										{trek.highlights.slice(0, 2).map((highlight, i) => (
											<li key={i} className="flex items-center">
												<div className="w-1 h-1 bg-orange-500 rounded-full mr-2" />
												{highlight}
											</li>
										))}
									</ul>

									{/* Meta Info */}
									<div className="flex items-center justify-between text-sm text-orange-700 mb-4">
										<div className="flex items-center">
											<Clock className="w-4 h-4 mr-1" />
											<span>{trek.duration}</span>
										</div>
										<div className="flex items-center">
											<Users className="w-4 h-4 mr-1" />
											<span>{trek.availableSlots !== undefined ? `${trek.availableSlots} available` : 'Limited spots'}</span>
										</div>
									</div>

									{/* Price and CTA */}
									<div className="flex items-center justify-between">
										<div>
											<span className="text-2xl font-oswald font-bold text-orange-600">
												₹{trek.price.toLocaleString()}
											</span>
											<span className="text-sm text-gray-500 ml-1">per person</span>
										</div>
										<Link to={`/trip/${trek.id}`}>
											<Button
												variant="adventure"
												size="sm"
												className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 group-hover:scale-110 transition-transform"
											>
												Book Now <ArrowRight className="w-4 h-4 ml-1" />
											</Button>
										</Link>
									</div>
								</div>
							</Card>
						</motion.div>
					))}

				</motion.div>
			</div>
		</section>
	);
};