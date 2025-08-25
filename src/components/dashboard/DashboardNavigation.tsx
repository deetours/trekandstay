import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BarChart3, Sparkles, ArrowRight } from 'lucide-react';

export function DashboardNavigation() {
  const location = useLocation();
  const isAIDashboard = location.pathname === '/dashboard/ai';
  const isBasicDashboard = location.pathname === '/dashboard';

  return (
    <div className="fixed top-32 right-4 z-40">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-3"
      >
        <div className="flex flex-col gap-2">
          {/* AI Dashboard Link */}
          {!isAIDashboard && (
            <Link to="/dashboard/ai">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm font-medium">AI Dashboard</div>
                    <div className="text-xs text-purple-100">Smart features</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
          )}

          {/* Basic Dashboard Link */}
          {!isBasicDashboard && (
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Simple Dashboard</div>
                    <div className="text-xs text-emerald-100">Classic view</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
          )}

          {/* Current Dashboard Indicator */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            {isAIDashboard ? (
              <>
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-700">AI Mode</span>
                <Sparkles className="w-3 h-3 text-purple-500" />
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-gray-700">Simple Mode</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardNavigation;
