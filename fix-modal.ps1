$file = "src/components/sections/FeaturedDestinations.tsx"
$content = Get-Content $file
$lines = $content | Measure-Object -Line | Select-Object -ExpandProperty Lines

Write-Host "Total lines: $lines"

# Get first 372 lines (before modal)
$before = $content[0..371]

# Get last lines (after modal closes, just closing braces)
$after = $content[520..($lines-1)]

# Build new modal
$newModal = @'
		{/* Quick View Modal - Using ResponsiveModal wrapper */}
		<ResponsiveModal
			isOpen={!!quickView}
			onClose={() => setQuickView(null)}
			maxWidth="2xl"
		>
			{quickView && (
				<div className="space-y-4">
					{/* Image Section */}
					<div className="relative w-full h-40 sm:h-60 md:h-72 bg-gray-100 rounded-lg overflow-hidden">
						<img
							src={quickView.image}
							alt={quickView.name}
							className="w-full h-full object-cover"
							loading="lazy"
							decoding="async"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BWUR2ZW50dXJlPC90ZXh0Pjwvc3ZnPg==';
								target.onerror = null;
							}}
						/>
						{/* Rating Badge */}
						<div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white">
							<StarIcon className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-sunset-yellow" />
							<span className="text-xs sm:text-sm font-medium">{quickView.rating} ({quickView.reviewCount})</span>
						</div>
					</div>

					{/* Title and Location */}
					<div>
						<h3 className="text-lg sm:text-2xl font-expat-rugged font-bold text-forest-green mb-2">{quickView.name}</h3>
						<div className="flex items-center text-mountain-blue">
							<MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
							<span className="text-sm">{quickView.location}</span>
						</div>
					</div>

					{/* Highlights */}
					<div>
						<h4 className="text-sm font-bold text-gray-700 mb-2">Highlights:</h4>
						<ul className="space-y-1">
							{quickView.highlights.slice(0, 3).map((h, i) => (
								<li key={i} className="flex items-start text-sm text-gray-700">
									<div className="w-1.5 h-1.5 bg-adventure-orange rounded-full mr-2 mt-1.5 flex-shrink-0" />
									<span>{h}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Info Grid */}
					<div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-200">
						<div className="text-center">
							<Clock className="w-4 h-4 mx-auto mb-1 text-mountain-blue" />
							<div className="text-xs sm:text-sm font-semibold text-gray-800">{quickView.duration}</div>
						</div>
						<div className="text-center">
							<Users className="w-4 h-4 mx-auto mb-1 text-mountain-blue" />
							<div className="text-xs sm:text-sm font-semibold text-gray-800">{quickView.availableSlots || 'Check'}</div>
						</div>
						<div className="text-center">
							<ShieldCheck className="w-4 h-4 mx-auto mb-1 text-green-600" />
							<div className="text-xs sm:text-sm font-semibold text-green-700">Certified</div>
						</div>
					</div>

					{/* Price and CTA */}
					<div className="space-y-3">
						<div>
							<span className="text-2xl sm:text-3xl font-outbrave font-bold text-forest-green">₹{quickView.price.toLocaleString()}</span>
							<span className="text-sm text-gray-500 ml-2">/person</span>
						</div>
						<div className="flex flex-col sm:flex-row gap-2">
							<Link to={`/trip/${ quickView.id }`} className="flex-1">
								<Button
									variant="primary"
									size="lg"
									className="w-full"
									onClick={() => setQuickView(null)}
								>
									View Full Details & Book
								</Button>
							</Link>
							<button
								onClick={() => setQuickView(null)}
								className="px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</ResponsiveModal>
'@

# Combine all parts
$newContent = $before + @($newModal) + $after

# Write back to file
$newContent | Set-Content $file -Encoding UTF8

Write-Host "File updated successfully"
