import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

interface Analytics {
  total_bookings: number;
  total_revenue: number;
  confirmed_bookings: number;
  pending_bookings: number;
  popular_trips: Array<{
    id: number;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  daily_bookings: Array<{
    date: string;
    count: number;
  }>;
  conversion_rate: number;
  average_booking_value: number;
  repeat_customers: number;
}

interface ConversionData {
  total_leads: number;
  converted_leads: number;
  conversion_rate: number;
  avg_conversion_time: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [conversionData, setConversionData] = useState<ConversionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [analyticsData, conversionInfo] = await Promise.all([
          adminAPI.getAnalytics(dateRange),
          adminAPI.getConversionReport()
        ]);
        setAnalytics(analyticsData);
        setConversionData(conversionInfo);
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || 'Failed to load analytics'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Business performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'year')}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600">₹{(analytics.total_revenue / 100000).toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-2">{analytics.confirmed_bookings} confirmed bookings</p>
            </div>
            <TrendingUp className="text-emerald-600" size={32} />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.total_bookings}</p>
              <p className="text-xs text-gray-500 mt-2">{analytics.pending_bookings} pending</p>
            </div>
            <BarChart3 className="text-blue-600" size={32} />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.conversion_rate?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500 mt-2">From {conversionData?.total_leads || 0} leads</p>
            </div>
            <PieChart className="text-purple-600" size={32} />
          </div>
        </div>

        {/* Avg Booking Value */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Avg Booking Value</p>
              <p className="text-3xl font-bold text-orange-600">₹{analytics.average_booking_value?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-2">{analytics.repeat_customers || 0} repeat customers</p>
            </div>
            <Activity className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Popular Trips Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Trips */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Trips</h3>
          <div className="space-y-3">
            {analytics.popular_trips?.slice(0, 5).map((trip, idx) => (
              <div key={trip.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{idx + 1}. {trip.name}</p>
                  <p className="text-sm text-gray-600">{trip.bookings} bookings</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">₹{trip.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Conversion</h3>
          {conversionData && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                  <span className="text-sm font-bold text-emerald-600">{conversionData.conversion_rate?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${conversionData.conversion_rate || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-blue-600">{conversionData.total_leads}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Converted</p>
                  <p className="text-2xl font-bold text-green-600">{conversionData.converted_leads}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <strong>Avg Conversion Time:</strong> {conversionData.avg_conversion_time}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Bookings Chart (Simple Bar) */}
      {analytics.daily_bookings && analytics.daily_bookings.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Bookings</h3>
          <div className="flex items-end gap-2 h-48">
            {analytics.daily_bookings.slice(-7).map((day, idx) => {
              const maxCount = Math.max(...analytics.daily_bookings.map(d => d.count));
              const height = (day.count / maxCount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-emerald-200 rounded-t" style={{ height: `${height}%`, minHeight: '20px' }}>
                    {day.count > 0 && (
                      <div className="text-xs font-bold text-center text-emerald-700 mt-1">
                        {day.count}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Metrics Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Booking Status</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              <span className="text-green-600">{analytics.confirmed_bookings}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-yellow-600">{analytics.pending_bookings}</span>
            </p>
            <p className="text-xs text-gray-500">Confirmed/Pending</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{analytics.total_bookings}</p>
            <p className="text-xs text-gray-500">All time</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Revenue Per Booking</p>
            <p className="text-lg font-bold text-gray-900 mt-1">₹{analytics.average_booking_value?.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Average</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Repeat Customer Rate</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {analytics.total_bookings > 0 ? ((analytics.repeat_customers / analytics.total_bookings) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500">Loyalty indicator</p>
          </div>
        </div>
      </div>
    </div>
  );
};
