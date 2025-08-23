import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star as StarIcon, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, getDbOrThrow, waitForFirestore } from '../../firebase';

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
	category?: string; // derived if absent
	tags?: string[];
	spotsAvailable?: number;
	nextDeparture?: string; // ISO or YYYY-MM-DD
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

export const FeaturedDestinations: React.FC = () => {
	const [quickView, setQuickView] = useState<typeof destinations[number] | null>(null);
	const [trips, setTrips] = useState<TripDoc[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				let activeDb = db;
				if (!activeDb) {
					try {
						activeDb = await waitForFirestore(3000);
					} catch {
						try { activeDb = getDbOrThrow(); } catch (err) {
							console.warn('Firestore still unavailable after wait. Falling back.', err);
							setError('Firestore unavailable');
							return;
						}
					}
				}
				const snap = await getDocs(query(collection(activeDb, 'trips'), limit(8)));
				if (!active) return;
				const docs: TripDoc[] = snap.docs.map(d => {
					const data = d.data();
					return {
						id: d.id,
						name: data.name,
						location: data.location,
						difficulty: data.difficulty,
						duration: data.duration,
						price: data.price,
						highlights: data.highlights,
						images: data.images,
						rating: data.rating,
						reviewCount: data.reviewCount,
						category: data.category,
						tags: data.tags,
						spotsAvailable: data.spotsAvailable,
						nextDeparture: data.nextDeparture
					};
				});
				// Filter to show only "near" trips (nextDeparture within 45 days) if date present
				const NEAR_DAYS = 45;
				const now = new Date();
				const near = docs
					.map(t => ({
						...t,
						__departureTs: (() => {
							if (!t.nextDeparture) return Number.MAX_SAFE_INTEGER; // put undated trips at end
							// Accept YYYY-MM-DD or full ISO
							const parsed = new Date(t.nextDeparture);
							return isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime();
						})()
					}))
					.sort((a,b) => a.__departureTs - b.__departureTs)
					.filter(t => {
						if (!t.nextDeparture) return true; // keep if no date
						const dt = new Date(t.nextDeparture);
						if (isNaN(dt.getTime())) return true;
						const diffDays = (dt.getTime() - now.getTime()) / 86400000;
						return diffDays >= 0 && diffDays <= NEAR_DAYS;
					})
					.slice(0,8)
					.map(obj => {
						interface WithTs extends TripDoc { __departureTs?: number }
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { __departureTs, ...rest } = obj as WithTs;
						return rest;
					});
				setTrips(near.length ? near : docs.slice(0,8));
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Failed to load');
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, []);

	const destinations = useMemo(() => trips.map(t => ({
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
		highlights: t.highlights && t.highlights.length ? t.highlights : ['Scenic views','Great experience','Guided trek']
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

	if (loading) {
		return (
			<section id="destinations" className="py-20 bg-gradient-to-br from-stone-gray to-white">
				<div className="max-w-7xl mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{Array.from({ length: 4 }).map((_,i) => (
							<div key={i} className="h-80 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
						))}
					</div>
				</div>
			</section>
		);
	}
	if (error) {
		return (
			<section id="destinations" className="py-20"><div className="max-w-4xl mx-auto px-4 text-center text-red-600">{error}</div></section>
		);
	}

	return (
		<section id="destinations" className="py-20 bg-gradient-to-br from-stone-gray to-white">
			<div className="max-w-7xl mx-auto px-4">
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<h2 className="text-4xl lg:text-5xl font-oswald font-bold text-forest-green mb-4">
						Featured Adventures
					</h2>
					<p className="text-xl text-mountain-blue font-inter max-w-3xl mx-auto">
						Discover our most popular destinations, carefully curated for the ultimate adventure experience
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8"
					variants={containerVariants}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
				>
					{destinations.map((destination, index) => (
						<motion.div key={destination.id} variants={itemVariants}>
							<Card
								className="h-full group cursor-pointer overflow-hidden"
								hover
								tilt
								glow={index % 2 === 0}
							>
								<div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
									   <motion.img
										   src={destination.image}
										   alt={destination.name}
										   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
										   loading="lazy"
										   decoding="async"
										   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
									   />

									   {/* Image Overlay */}
									   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

									   {/* Category Badge */}
									   <div className="absolute top-4 left-4">
										   <span
											   className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[destination.category as keyof typeof categoryColors]}`}
										   >
											   {destination.category}
										   </span>
									   </div>

									   {/* Difficulty Badge */}
									   <div className="absolute top-4 right-4">
										   <span
											   className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[destination.difficulty as keyof typeof difficultyColors]}`}
										   >
											   {destination.difficulty}
										   </span>
									   </div>

									   {/* Rating */}
									   <div className="absolute bottom-4 left-4 flex items-center space-x-1 text-white">
										   <StarIcon className="w-4 h-4 fill-current text-sunset-yellow" />
										   <span className="text-sm font-medium">{destination.rating}</span>
										   <span className="text-xs opacity-80">({destination.reviewCount})</span>
									   </div>
								   </div>

								{/* Content */}
								<div className="p-6">
									<h3 className="text-xl font-oswald font-bold text-forest-green mb-2 group-hover:text-adventure-orange transition-colors">
										{destination.name}
									</h3>

									<div className="flex items-center text-mountain-blue mb-3">
										<MapPin className="w-4 h-4 mr-1" />
										<span className="text-sm font-inter">{destination.location}</span>
									</div>

									{/* Highlights */}
									<ul className="text-sm text-gray-600 mb-4 space-y-1">
										{destination.highlights.slice(0, 2).map((highlight, i) => (
											<li key={i} className="flex items-center">
												<div className="w-1 h-1 bg-adventure-orange rounded-full mr-2" />
												{highlight}
											</li>
										))}
									</ul>

									{/* Meta Info */}
									<div className="flex items-center justify-between text-sm text-mountain-blue mb-4">
										<div className="flex items-center">
											<Clock className="w-4 h-4 mr-1" />
											<span>{destination.duration}</span>
										</div>
										<div className="flex items-center">
											<Users className="w-4 h-4 mr-1" />
											<span>Max 12</span>
										</div>
									</div>

									{/* Price and CTA */}
									<div className="flex items-center justify-between">
										<div>
											<span className="text-2xl font-oswald font-bold text-forest-green">
												₹{destination.price.toLocaleString()}
											</span>
											<span className="text-sm text-gray-500 ml-1">per person</span>
										</div>
										<div className="flex items-center gap-2">
											<Button
												variant="secondary"
												size="sm"
												onClick={() => setQuickView(destination)}
												aria-label={`Quick view ${destination.name}`}
											>
												Quick view
											</Button>
											<Link to={`/trip/${destination.id}`}>
												<Button
													variant="adventure"
													size="sm"
													className="group-hover:scale-110 transition-transform"
													aria-label={`View details for ${destination.name}`}
												>
													<ArrowRight className="w-4 h-4" />
												</Button>
											</Link>
										</div>
									</div>
								</div>
							</Card>
						</motion.div>
					))}
				</motion.div>

				{/* View All Button + Link */}
				<motion.div
					className="text-center mt-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.5, duration: 0.6 }}
				>
					<div className="flex items-center justify-center gap-4">
						<Link to="/destinations">
							<Button
								variant="primary"
								size="lg"
								className="font-oswald text-lg px-8"
							>
								View All Destinations
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
						</Link>
						<Link
							to="/catalog"
							className="text-mountain-blue hover:text-forest-green underline-offset-2 hover:underline"
						>
							or open the full catalog explorer
						</Link>
					</div>
				</motion.div>
			</div>

			{/* Quick View Modal */}
			{quickView && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label={`${quickView.name} quick view`}
					className="fixed inset-0 z-50 flex items-center justify-center"
				>
					<div className="absolute inset-0 bg-black/50" onClick={() => setQuickView(null)} />
					<div className="relative bg-white dark:bg-[#111827] rounded-2xl shadow-2xl max-w-3xl w-[92vw] overflow-hidden">
						<button
							className="absolute top-3 right-3 p-2 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
							aria-label="Close"
							onClick={() => setQuickView(null)}
						>
							<X className="w-5 h-5" />
						</button>
						<div className="grid md:grid-cols-2">
							<div className="relative aspect-[4/3] bg-gray-100">
								<img
									src={quickView.image}
									alt={quickView.name}
									className="w-full h-full object-cover"
									loading="lazy"
									decoding="async"
								/>
								<div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
									<StarIcon className="w-4 h-4 text-sunset-yellow" />
									<span className="text-sm font-medium">{quickView.rating} ({quickView.reviewCount})</span>
								</div>
							</div>
							<div className="p-5 md:p-6">
								<h3 className="text-xl font-oswald font-bold text-forest-green dark:text-white">{quickView.name}</h3>
								<div className="flex items-center text-mountain-blue dark:text-gray-300 mt-1">
									<MapPin className="w-4 h-4 mr-1" />
									<span className="text-sm">{quickView.location}</span>
								</div>
								<ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
									{quickView.highlights.slice(0, 3).map((h, i) => (
										<li key={i} className="flex items-center">
											<div className="w-1.5 h-1.5 bg-adventure-orange rounded-full mr-2" />
											{h}
										</li>
									))}
								</ul>
								<div className="mt-4 flex items-center gap-4 text-sm text-mountain-blue dark:text-gray-300">
									<div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{quickView.duration}</div>
									<div className="flex items-center"><Users className="w-4 h-4 mr-1" />Max 12</div>
								</div>
								<div className="mt-6 flex items-center justify-between">
									<div>
										<span className="text-2xl font-oswald font-bold text-forest-green dark:text-white">₹{quickView.price.toLocaleString()}</span>
										<span className="text-sm text-gray-500 ml-1">per person</span>
									</div>
									<div className="flex gap-2">
										<Link to={`/trip/${quickView.id}`} onClick={() => setQuickView(null)}>
											<Button variant="adventure" size="md">View details</Button>
										</Link>
										<Button variant="secondary" size="md" onClick={() => setQuickView(null)}>Close</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};