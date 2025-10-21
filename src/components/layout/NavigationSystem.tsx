import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Clock, DollarSign, 
  ArrowRight
} from 'lucide-react';
import { THEME } from '../../config/theme';

interface NavigationBreadcrumb {
  label: string;
  path: string;
}

interface RelatedTrip {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  rating: number;
  difficulty: string;
}

interface NavigationSystemProps {
  showBackButton?: boolean;
  breadcrumbs?: NavigationBreadcrumb[];
  relatedTrips?: RelatedTrip[];
  pageTitle?: string;
}

export const NavigationSystem: React.FC<NavigationSystemProps> = ({
  showBackButton = true,
  breadcrumbs = [],
  relatedTrips = [],
  pageTitle = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Track navigation history
  useEffect(() => {
    setNavigationHistory(prev => {
      const newHistory = [...prev, location.pathname];
      // Keep only last 5 items
      return newHistory.slice(-5);
    });
  }, [location.pathname]);

  const handleBackClick = () => {
    if (navigationHistory.length > 1) {
      const previousPath = navigationHistory[navigationHistory.length - 2];
      navigate(previousPath);
    } else {
      navigate(-1);
    }
  };

  // Generate breadcrumbs from URL if not provided
  const generateBreadcrumbs = (): NavigationBreadcrumb[] => {
    if (breadcrumbs.length > 0) return breadcrumbs;

    const pathnames = location.pathname.split('/').filter(x => x);
    const generated: NavigationBreadcrumb[] = [
      { label: 'Home', path: '/' }
    ];

    pathnames.forEach((pathname, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = pathname
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      generated.push({ label, path });
    });

    return generated;
  };

  const currentBreadcrumbs = generateBreadcrumbs();

  return (
    <>
      {/* Back Button and Breadcrumb Navigation */}
      {(showBackButton || currentBreadcrumbs.length > 1) && (
        <motion.div
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back Button */}
          {showBackButton && (
            <motion.button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              whileHover={{ scale: 1.05, x: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                color: THEME.colors.forestGreen,
                borderColor: THEME.colors.forestGreen,
                border: `2px solid ${THEME.colors.forestGreen}`
              }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>
          )}

          {/* Breadcrumb Trail */}
          {currentBreadcrumbs.length > 1 && (
            <nav className="flex items-center gap-2 flex-1 ml-4 overflow-x-auto pb-2">
              {currentBreadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.path}>
                  <motion.button
                    onClick={() => navigate(breadcrumb.path)}
                    className="px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      color: index === currentBreadcrumbs.length - 1 
                        ? THEME.colors.waterfallBlue
                        : THEME.colors.forestGreen,
                      backgroundColor: index === currentBreadcrumbs.length - 1 
                        ? `${THEME.colors.waterfallBlue}20`
                        : 'transparent'
                    }}
                  >
                    {breadcrumb.label}
                  </motion.button>
                  {index < currentBreadcrumbs.length - 1 && (
                    <div style={{ color: THEME.colors.gray300 }}>
                      /
                    </div>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </motion.div>
      )}

      {/* Page Title */}
      {pageTitle && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 
            className="text-3xl font-bold"
            style={{ color: THEME.colors.forestGreen }}
          >
            {pageTitle}
          </h1>
        </motion.div>
      )}

      {/* Related Trips Section */}
      {relatedTrips && relatedTrips.length > 0 && (
        <motion.div
          className="mt-12 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 
            className="text-2xl font-bold mb-6"
            style={{ color: THEME.colors.forestGreen }}
          >
            🎒 Related Adventures You Might Love
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border-2"
                whileHover={{ scale: 1.02, y: -5 }}
                style={{
                  borderColor: THEME.colors.forestGreen,
                  background: 'white'
                }}
                onClick={() => navigate(`/trips/${trip.id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Trip Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-white text-sm font-bold"
                    style={{ background: THEME.colors.waterfallBlue }}
                  >
                    ⭐ {trip.rating}
                  </div>
                </div>

                {/* Trip Info */}
                <div className="p-4">
                  <h3 
                    className="font-bold text-lg mb-2 line-clamp-2"
                    style={{ color: THEME.colors.forestGreen }}
                  >
                    {trip.title}
                  </h3>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" style={{ color: THEME.colors.waterfallBlue }} />
                      <span style={{ color: THEME.colors.gray600 }}>
                        {trip.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" style={{ color: THEME.colors.waterfallBlue }} />
                      <span style={{ color: THEME.colors.gray600 }}>
                        {trip.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" style={{ color: THEME.colors.adventureOrange }} />
                        <span className="font-bold" style={{ color: THEME.colors.forestGreen }}>
                          ₹{trip.price?.toLocaleString()}
                        </span>
                      </div>
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{
                          background: `${THEME.colors.forestGreen}20`,
                          color: THEME.colors.forestGreen
                        }}
                      >
                        {trip.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    className="w-full py-2 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: `linear-gradient(135deg, ${THEME.colors.forestGreen}, ${THEME.colors.waterfallBlue})`
                    }}
                  >
                    Explore <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default NavigationSystem;
