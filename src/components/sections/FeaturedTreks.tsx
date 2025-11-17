import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star as StarIcon, Clock, Users, ArrowRight, Flame } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { fetchTrips } from '../../services/api';
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

export const FeaturedTreks: React.FC = () => {
	const [trips, setTrips] = useState<TripDoc[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		let timeoutId: NodeJS.Timeout | undefined;

		(async () => {
			try {
				setLoading(true);
				setError(null);

				// Add timeout to prevent hanging requests
				const timeoutPromise = new Promise<never>((_, reject) => {
					timeoutId = setTimeout(() => reject(new Error('Request timeout')), 10000);
				});

				// Fetch from Django backend with timeout
				const fetchPromise = fetchTrips();
				const data = await Promise.race([fetchPromise, timeoutPromise]) as TripDoc[];

				if (!active) return;

			if (!data || data.length === 0) {
				console.warn('FeaturedTreks: No trips returned from API');
				setTrips([]);
				setLoading(false);
				return;
			}

			// Simplified sorting - prioritize by rating and status only  
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const sortedTrips = (data as any)
				.filter((trip: unknown) => {
					const t = trip as Record<string, unknown>;
					return t.price && typeof t.price === 'number' && t.price > 0;
				})
				.sort((a: unknown, b: unknown) => {
					const aTrip = a as Record<string, unknown>;
					const bTrip = b as Record<string, unknown>;
					// Simple priority: confirmed/popular first, then by rating
					const aScore = (aTrip.status === 'confirmed' ? 3 : aTrip.status === 'promoted' ? 2 : 1) + (typeof aTrip.rating === 'number' ? aTrip.rating : 0);
					const bScore = (bTrip.status === 'confirmed' ? 3 : bTrip.status === 'promoted' ? 2 : 1) + (typeof bTrip.rating === 'number' ? bTrip.rating : 0);
					return bScore - aScore;
				})
				.map((trip: unknown) => {
					const t = trip as Record<string, unknown>;
					return {
						id: String(t.id || t.slug || Math.random()),
						name: String(t.name || t.title || 'Adventure Trip'),
						location: String(t.location || 'Karnataka'),
						difficulty: String(t.difficulty || 'Moderate'),
						duration: String(t.duration || `${t.duration_days || 3} Days`),
						price: Number(t.price) || 0,
						highlights: Array.isArray(t.highlights) ? (t.highlights as string[]).slice(0, 2) : ['Scenic views', 'Guided trek'],
						images: Array.isArray(t.images) ? (t.images as string[]) : [String(t.image || 'https://picsum.photos/400/300?random=adventure')],
						rating: Number(t.rating) || 4.5,
						reviewCount: Number(t.review_count || t.reviewCount) || 0,
						category: String(t.category || ''),
						tags: Array.isArray(t.tags) ? (t.tags as string[]) : [],
						availableSlots: Number(t.available_slots || t.available_seats) || undefined,
						status: String(t.status || ''),
					};
				});

				console.log('FeaturedTreks: Processed trips:', sortedTrips.length);
				setTrips(sortedTrips);
			} catch (err) {
				console.error('FeaturedTreks: Error fetching trips:', err);
				if (active) {
					setError(err instanceof Error ? err.message : 'Failed to load featured treks');
					setTrips([]);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
				if (timeoutId) clearTimeout(timeoutId);
			}
		})();

		return () => {
			active = false;
			if (timeoutId !== undefined) clearTimeout(timeoutId);
		};
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
		image: (t.images && t.images[0]) || 'https://picsum.photos/400/300?random=adventure',
		highlights: t.highlights && t.highlights.length ? t.highlights : ['Scenic views','Great experience','Guided trek'],
		availableSlots: t.availableSlots,
		status: t.status,
	})), [trips]);

	const containerVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
	};

	// Don't render section if no trips and not loading
	if (!loading && !error && featuredTreks.length === 0) {
		console.warn('FeaturedTreks: No featured treks to display');
		return null;
	}

	// Show error state
	if (error && !loading) {
		return (
			<section className="relative py-0 bg-gradient-to-b from-white/5 via-white/0 to-white/10 overflow-hidden">
				<div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
					<BackgroundBeams className="opacity-30" />
				</div>
				<div className="max-w-7xl mx-auto px-4 text-center relative z-10 py-16">
					<p className="text-red-600 text-lg mb-4">{error}</p>
					<p className="text-gray-600">Please ensure Firebase/Firestore is properly configured</p>
				</div>
			</section>
		);
	}

	if (loading) {
		return (
			<section className="relative py-0 bg-gradient-to-b from-white/5 via-white/0 to-white/10 overflow-hidden">
				<div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
					<BackgroundBeams className="opacity-30" />
				</div>
				<div className="max-w-7xl mx-auto px-4 relative z-10 py-16">
					<div className="text-center mb-12">
						<div className="flex items-center justify-center gap-2 mb-4">
							<div className="w-8 h-8 bg-orange-300 rounded-full animate-pulse"></div>
							<div className="w-64 h-12 bg-orange-300 rounded-lg animate-pulse"></div>
							<div className="w-8 h-8 bg-red-300 rounded-full animate-pulse"></div>
						</div>
						<div className="w-96 h-6 bg-orange-200 rounded mx-auto animate-pulse"></div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{Array.from({ length: 4 }).map((_,i) => (
							<div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
								<div className="aspect-[4/3] bg-gradient-to-r from-orange-200 via-red-100 to-orange-200 animate-pulse"></div>
								<div className="p-5 space-y-3">
									<div className="h-5 bg-gray-200 rounded animate-pulse"></div>
									<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
									<div className="flex justify-between items-center pt-2">
										<div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
										<div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
									</div>
								</div>
							</div>
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
		<section className="relative py-0 bg-gradient-to-b from-white/5 via-stone-gray/20 to-white/10 overflow-hidden">
			{/* Full-width Background Beams */}
			<div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
				<BackgroundBeams className="opacity-40" />
			</div>

		{/* SVG Trail at Top - Behind Content but Above Beams */}
		<div className="absolute top-0 left-0 right-0 w-full" style={{ zIndex: 5 }}>
			<svg viewBox="0 0 1200 60" className="w-full h-auto max-h-10 sm:max-h-12 md:max-h-16 block" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<linearGradient id="trekTrail" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#16a34a" stopOpacity="0.4"/><stop offset="25%" stopColor="#f97316" stopOpacity="0.6"/><stop offset="50%" stopColor="#f97316" stopOpacity="0.5"/><stop offset="75%" stopColor="#ea580c" stopOpacity="0.6"/><stop offset="100%" stopColor="#16a34a" stopOpacity="0.4"/>
						</linearGradient>
						<filter id="trekGlow"><feGaussianBlur stdDeviation="1" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
					</defs>
					<path d="M 0,25 Q 150,8 300,25 T 600,25 T 900,25 T 1200,25" stroke="url(#trekTrail)" strokeWidth="2.5" fill="none" strokeLinecap="round" filter="url(#trekGlow)"/>
					<path d="M 0,30 Q 150,12 300,30 T 600,30 T 900,30 T 1200,30" stroke="#f97316" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3"/>
					<circle cx="150" cy="25" r="3" fill="#16a34a" opacity="0.7"/><circle cx="300" cy="25" r="3.5" fill="#f97316" opacity="0.8"/><circle cx="450" cy="25" r="2.5" fill="#ea580c" opacity="0.6"/><circle cx="600" cy="25" r="3.5" fill="#f97316" opacity="0.8"/><circle cx="750" cy="25" r="2.5" fill="#16a34a" opacity="0.6"/><circle cx="900" cy="25" r="3.5" fill="#f97316" opacity="0.8"/><circle cx="1050" cy="25" r="3" fill="#ea580c" opacity="0.7"/>
				</svg>
			</div>

		{/* Gradient fade-in at top - blend from PartnerLogos */}
		<div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-white/60 via-white/30 to-transparent z-5 pointer-events-none" />

		<div className="max-w-7xl mx-auto px-4 relative z-20 pt-32 sm:pt-40 md:pt-24 pb-12 md:pb-16">
				<motion.div
					className="text-center mb-12 md:mb-12"
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
									   <img
										   src={trek.image}
										   alt={trek.name}
										   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
										   loading="lazy"
										   decoding="async"
										   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
										   onError={(e) => {
										   		const target = e.target as HTMLImageElement;
										   		target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BWR2ZW50dXJlPC90ZXh0Pjwvc3ZnPg==';
										   		target.onerror = null; // Prevent infinite loop
										   	}}
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

			{/* Gradient fade-out at bottom - blend to next section */}
			<div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-transparent via-white/30 to-white/80 z-20 pointer-events-none" />
		</section>
	);
};