import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Navigation } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  location: string;
  feels_like: number;
}

const WeatherWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'sunny',
    humidity: 68,
    windSpeed: 12,
    visibility: 8.5,
    location: 'Maharashtra Hills',
    feels_like: 26
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Simulate real weather data fetching
    const fetchWeather = () => {
      setIsLoading(true);
      setTimeout(() => {
        const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        setWeather({
          temperature: Math.round(20 + Math.random() * 15),
          condition: randomCondition,
          humidity: Math.round(40 + Math.random() * 40),
          windSpeed: Math.round(5 + Math.random() * 20),
          visibility: Number((5 + Math.random() * 10).toFixed(1)),
          location: 'Maharashtra Hills',
          feels_like: Math.round(22 + Math.random() * 15)
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string, animate: boolean = true) => {
    const iconProps = {
      className: `w-8 h-8 ${animate ? 'animate-pulse' : ''}`,
      strokeWidth: 2
    };

    switch (condition) {
      case 'sunny':
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      case 'cloudy':
        return <Cloud {...iconProps} className={`${iconProps.className} text-gray-500`} />;
      case 'rainy':
        return <CloudRain {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case 'partly-cloudy':
        return (
          <div className="relative">
            <Sun className="w-8 h-8 text-yellow-400 absolute" />
            <Cloud className="w-6 h-6 text-gray-400 relative left-3 top-1" />
          </div>
        );
      default:
        return <Sun {...iconProps} />;
    }
  };

  const getBackgroundGradient = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return 'from-orange-100 to-yellow-50 border-yellow-200';
      case 'cloudy':
        return 'from-gray-100 to-slate-50 border-gray-200';
      case 'rainy':
        return 'from-blue-100 to-slate-50 border-blue-200';
      case 'partly-cloudy':
        return 'from-yellow-50 to-gray-50 border-gray-200';
      default:
        return 'from-blue-50 to-white border-blue-100';
    }
  };

  return (
    <motion.div
      className={`${className} bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border ${getBackgroundGradient(weather.condition)} overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Weather Now</h3>
          <motion.button
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            onClick={() => setShowDetails(!showDetails)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Navigation className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="flex items-center justify-center h-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getWeatherIcon(weather.condition, false)}
                  <div>
                    <p className="text-3xl font-bold text-gray-800">
                      {weather.temperature}°C
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {weather.condition.replace('-', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Feels like</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {weather.feels_like}°C
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">📍 {weather.location}</p>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t pt-4 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Humidity</p>
                          <p className="text-sm font-semibold">{weather.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Wind</p>
                          <p className="text-sm font-semibold">{weather.windSpeed} km/h</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Visibility</p>
                          <p className="text-sm font-semibold">{weather.visibility} km</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-xs text-gray-500">Perfect for</p>
                          <p className="text-sm font-semibold">Trekking! 🥾</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animated weather particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {weather.condition === 'rainy' && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-4 bg-blue-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`
                }}
                animate={{
                  y: [0, 200],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
              />
            ))}
          </>
        )}
        
        {weather.condition === 'sunny' && (
          <motion.div
            className="absolute top-2 right-2 w-16 h-16 rounded-full bg-yellow-300/10"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
