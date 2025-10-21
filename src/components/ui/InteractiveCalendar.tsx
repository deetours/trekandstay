import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Star,
  AlertCircle
} from 'lucide-react';

interface TrekDate {
  date: Date;
  available: boolean;
  price: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  spotsLeft: number;
  totalSpots: number;
  weather: 'sunny' | 'cloudy' | 'rainy';
  season: 'peak' | 'shoulder' | 'off-peak';
  featured: boolean;
}

interface InteractiveCalendarProps {
  className?: string;
  onDateSelect?: (date: TrekDate) => void;
  selectedDate?: Date;
}

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  className = '',
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Mock trek data - in real app this would come from API
  const trekDates = useMemo((): TrekDate[] => {
    const dates: TrekDate[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Skip past dates
      if (date < new Date()) continue;

      // Only weekends for treks
      if (date.getDay() === 6 || date.getDay() === 0) {
        const month = date.getMonth();
        
        // Determine season
        let season: TrekDate['season'] = 'shoulder';
        if (month >= 10 || month <= 2) season = 'peak'; // Winter
        if (month >= 3 && month <= 5) season = 'shoulder'; // Spring
        if (month >= 6 && month <= 9) season = 'off-peak'; // Monsoon

        // Random availability and pricing
        const available = Math.random() > 0.2;
        const basePrice = season === 'peak' ? 3500 : season === 'shoulder' ? 2800 : 2200;
        const priceVariation = Math.random() * 500 - 250;
        
        dates.push({
          date,
          available,
          price: Math.round(basePrice + priceVariation),
          difficulty: ['easy', 'moderate', 'hard'][Math.floor(Math.random() * 3)] as TrekDate['difficulty'],
          spotsLeft: available ? Math.floor(Math.random() * 8) + 2 : 0,
          totalSpots: 10,
          weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)] as TrekDate['weather'],
          season,
          featured: Math.random() > 0.8
        });
      }
    }

    return dates;
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTrekDateInfo = (date: Date) => {
    return trekDates.find(td => 
      td.date.getDate() === date.getDate() &&
      td.date.getMonth() === date.getMonth() &&
      td.date.getFullYear() === date.getFullYear()
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getWeatherEmoji = (weather: string) => {
    switch (weather) {
      case 'sunny': return '☀️';
      case 'cloudy': return '⛅';
      case 'rainy': return '🌧️';
      default: return '☀️';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'peak': return 'text-red-600 bg-red-100';
      case 'shoulder': return 'text-blue-600 bg-blue-100';
      case 'off-peak': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const trekInfo = getTrekDateInfo(date);
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <motion.div
          key={day}
          className={`h-24 border border-gray-100 p-1 cursor-pointer relative transition-all ${
            trekInfo?.available 
              ? 'hover:bg-emerald-50 hover:border-emerald-200' 
              : 'bg-gray-50 cursor-not-allowed'
          } ${isSelected ? 'bg-emerald-100 border-emerald-400' : ''}`}
          onMouseEnter={() => trekInfo && setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          onClick={() => trekInfo?.available && onDateSelect?.(trekInfo)}
          whileHover={trekInfo?.available ? { scale: 1.02 } : {}}
          whileTap={trekInfo?.available ? { scale: 0.98 } : {}}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${
                trekInfo?.available ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {day}
              </span>
              {trekInfo?.featured && (
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
              )}
            </div>

            {trekInfo && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-emerald-600">
                    {formatCurrency(trekInfo.price)}
                  </div>
                  
                  {trekInfo.available && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {trekInfo.spotsLeft}/{trekInfo.totalSpots}
                      </span>
                      <span className="text-xs">
                        {getWeatherEmoji(trekInfo.weather)}
                      </span>
                    </div>
                  )}
                </div>

                {!trekInfo.available && (
                  <div className="text-xs text-red-500 font-medium">
                    Full
                  </div>
                )}
              </div>
            )}

            {/* Availability indicator */}
            {trekInfo && (
              <div className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
                trekInfo.available 
                  ? trekInfo.spotsLeft <= 2 
                    ? 'bg-yellow-400' 
                    : 'bg-green-400'
                  : 'bg-red-400'
              }`} />
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const currentMonthTreks = trekDates.filter(trek => 
    trek.date.getMonth() === currentMonth.getMonth() &&
    trek.date.getFullYear() === currentMonth.getFullYear()
  );

  const availableTreks = currentMonthTreks.filter(trek => trek.available);
  const avgPrice = availableTreks.length > 0 
    ? availableTreks.reduce((sum, trek) => sum + trek.price, 0) / availableTreks.length 
    : 0;

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Trek Calendar</h2>
              <p className="text-emerald-100">Choose your adventure date</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Avg. Price</p>
            <p className="text-xl font-bold">{formatCurrency(avgPrice)}</p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h3 className="text-xl font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-50 p-4 grid grid-cols-3 gap-4 text-center border-b">
        <div>
          <p className="text-2xl font-bold text-emerald-600">{availableTreks.length}</p>
          <p className="text-sm text-gray-600">Available Dates</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">
            {availableTreks.reduce((sum, trek) => sum + trek.spotsLeft, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Spots</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(avgPrice * 0.1)} {/* Mock savings */}
          </p>
          <p className="text-sm text-gray-600">Avg. Savings</p>
        </div>
      </div>

      <div className="p-6">
        {/* Calendar Grid */}
        <div className="mb-6">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Available (3+ spots)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>Limited (1-2 spots)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span>Featured Trek</span>
            </div>
          </div>
        </div>

        {/* Hover Details */}
        <AnimatePresence>
          {hoveredDate && (
            <motion.div
              className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 max-w-sm"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {(() => {
                const trekInfo = getTrekDateInfo(hoveredDate);
                if (!trekInfo) return null;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">
                        {hoveredDate.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      {trekInfo.featured && (
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(trekInfo.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Available</p>
                        <p className="font-semibold">
                          {trekInfo.spotsLeft}/{trekInfo.totalSpots} spots
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Difficulty</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(trekInfo.difficulty)}`}>
                          {trekInfo.difficulty}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Season</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeasonColor(trekInfo.season)}`}>
                          {trekInfo.season}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{getWeatherEmoji(trekInfo.weather)}</span>
                        <span className="capitalize">{trekInfo.weather} weather</span>
                      </div>
                      
                      {trekInfo.spotsLeft <= 2 && trekInfo.available && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Filling fast!</span>
                        </div>
                      )}
                    </div>

                    {trekInfo.available && (
                      <button
                        onClick={() => onDateSelect?.(trekInfo)}
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors"
                      >
                        Select This Date
                      </button>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InteractiveCalendar;
