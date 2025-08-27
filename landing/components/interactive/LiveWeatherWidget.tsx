import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSnow, 
  Wind, 
  Thermometer,
  Droplets,
  Eye,
  Compass,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    rainChance: number;
  }>;
  trekingCondition: {
    status: 'excellent' | 'good' | 'moderate' | 'poor' | 'dangerous';
    recommendation: string;
    factors: string[];
  };
  lastUpdated: string;
}

interface LiveWeatherWidgetProps {
  location?: string;
  compact?: boolean;
  className?: string;
}

export const LiveWeatherWidget: React.FC<LiveWeatherWidgetProps> = ({
  location = 'Maharashtra',
  compact = false,
  className = ''
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock weather data - in production, this would fetch from a weather API
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: WeatherData = {
        location: location,
        temperature: 24,
        condition: 'partly-cloudy',
        humidity: 68,
        windSpeed: 12,
        visibility: 8.5,
        pressure: 1012,
        forecast: [
          { day: 'Today', high: 26, low: 18, condition: 'partly-cloudy', rainChance: 20 },
          { day: 'Tomorrow', high: 28, low: 20, condition: 'sunny', rainChance: 5 },
          { day: 'Day 3', high: 25, low: 19, condition: 'rainy', rainChance: 85 },
          { day: 'Day 4', high: 23, low: 17, condition: 'cloudy', rainChance: 45 },
          { day: 'Day 5', high: 27, low: 21, condition: 'sunny', rainChance: 10 }
        ],
        trekingCondition: {
          status: 'good',
          recommendation: 'Great weather for trekking! Pack light rain gear just in case.',
          factors: ['Comfortable temperature', 'Low rain chance', 'Good visibility']
        },
        lastUpdated: new Date().toLocaleTimeString()
      };
      
      setWeatherData(mockData);
      setLoading(false);
    };

    fetchWeatherData();
    
    // Update every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const getWeatherIcon = (condition: string, size: string = 'w-6 h-6') => {
    const iconClass = `${size} transition-all duration-300`;
    
    switch (condition) {
      case 'sunny':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'partly-cloudy':
        return <Cloud className={`${iconClass} text-blue-400`} />;
      case 'cloudy':
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-600`} />;
      case 'snowy':
        return <CloudSnow className={`${iconClass} text-blue-200`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getConditionAnimation = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return {
          animate: { rotate: [0, 360] },
          transition: { duration: 10, repeat: Infinity, ease: "linear" }
        };
      case 'rainy':
        return {
          animate: { y: [0, -5, 0] },
          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'cloudy':
      case 'partly-cloudy':
        return {
          animate: { x: [-2, 2, -2] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  const getTrekConditionColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-emerald-600 bg-emerald-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'dangerous': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <motion.div
        className={`bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 ${className}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/30 rounded-full animate-spin"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/30 rounded mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!weatherData) return null;

  if (compact) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className={`bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-300 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <motion.div {...getConditionAnimation(weatherData.condition)}>
            {getWeatherIcon(weatherData.condition, 'w-5 h-5')}
          </motion.div>
          <span className="text-white font-medium">{weatherData.temperature}°C</span>
          <MapPin className="w-3 h-3 text-white/70" />
        </div>
      </motion.button>
    );
  }

  return (
    <>
      <motion.div
        className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h3 className="text-white font-semibold">{weatherData.location}</h3>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        {/* Current Weather */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="flex-shrink-0"
            {...getConditionAnimation(weatherData.condition)}
          >
            {getWeatherIcon(weatherData.condition, 'w-12 h-12')}
          </motion.div>
          
          <div className="flex-1">
            <div className="text-3xl font-bold text-white mb-1">
              {weatherData.temperature}°C
            </div>
            <div className="text-white/80 capitalize">
              {weatherData.condition.replace('-', ' ')}
            </div>
          </div>

          <div className="text-right text-sm text-white/70">
            <div className="flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              <span>{weatherData.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Wind className="w-3 h-3" />
              <span>{weatherData.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Trek Condition */}
        <div className={`rounded-lg p-3 mb-4 ${getTrekConditionColor(weatherData.trekingCondition.status)}`}>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4" />
            <span className="font-semibold capitalize">Trek Condition: {weatherData.trekingCondition.status}</span>
          </div>
          <p className="text-sm opacity-90">{weatherData.trekingCondition.recommendation}</p>
        </div>

        {/* Mini Forecast */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Calendar className="w-3 h-3" />
            <span>5-Day Outlook</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {weatherData.forecast.map((day, index) => (
              <motion.div
                key={day.day}
                className="bg-white/10 rounded-lg p-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-xs text-white/70 mb-1">{day.day}</div>
                <motion.div
                  className="mb-2"
                  {...getConditionAnimation(day.condition)}
                >
                  {getWeatherIcon(day.condition, 'w-4 h-4 mx-auto')}
                </motion.div>
                <div className="text-xs text-white font-medium">{day.high}°</div>
                <div className="text-xs text-white/60">{day.low}°</div>
                {day.rainChance > 30 && (
                  <div className="text-xs text-blue-300 mt-1">{day.rainChance}%</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1 text-xs text-white/50 mt-4">
          <Clock className="w-3 h-3" />
          <span>Updated: {weatherData.lastUpdated}</span>
        </div>
      </motion.div>

      {/* Expanded Weather Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Weather Details</h2>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Detailed Weather Info */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{weatherData.temperature}°C</div>
                  </div>
                  
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-cyan-600" />
                      <span className="font-semibold">Visibility</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-600">{weatherData.visibility} km</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">Pressure</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{weatherData.pressure} hPa</div>
                  </div>
                </div>

                {/* Trek Recommendations */}
                <div className="bg-emerald-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-3">Trekking Recommendations</h3>
                  <div className="space-y-2">
                    {weatherData.trekingCondition.factors.map((factor, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-700">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};