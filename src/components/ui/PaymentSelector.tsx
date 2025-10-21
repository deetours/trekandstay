import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Building, 
  Shield, 
  Check,
  AlertCircle,
  Zap,
  Gift,
  Clock,
  Percent,
  TrendingUp
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'wallet' | 'netbanking' | 'emi';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  processingTime: string;
  discount?: number;
  cashback?: number;
  popular?: boolean;
  instant?: boolean;
  offers?: string[];
}

interface PaymentSelectorProps {
  amount: number;
  onPaymentSelect: (method: PaymentMethod) => void;
  selectedMethod?: string;
  className?: string;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  amount,
  onPaymentSelect,
  selectedMethod,
  className = ''
}) => {
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [showOffers, setShowOffers] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI Payment',
      type: 'upi',
      icon: Smartphone,
      description: 'Pay using Google Pay, PhonePe, Paytm',
      processingTime: 'Instant',
      discount: 2,
      popular: true,
      instant: true,
      offers: ['2% instant discount', 'No processing fee', 'Instant confirmation']
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay accepted',
      processingTime: '2-3 minutes',
      cashback: 1,
      offers: ['1% cashback on select cards', 'EMI options available', 'Secure 3D payment']
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      type: 'wallet',
      icon: Wallet,
      description: 'Paytm, Amazon Pay, JioMoney',
      processingTime: 'Instant',
      discount: 1,
      instant: true,
      offers: ['1% discount on first payment', 'Wallet cashback eligible']
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      type: 'netbanking',
      icon: Building,
      description: 'All major banks supported',
      processingTime: '3-5 minutes',
      offers: ['Bank-specific offers available', 'No additional charges']
    },
    {
      id: 'emi',
      name: 'EMI Options',
      type: 'emi',
      icon: CreditCard,
      description: 'Convert to easy EMIs',
      processingTime: '5-10 minutes',
      offers: ['0% interest on select tenures', '3, 6, 9, 12 months available']
    }
  ];

  const calculateFinalAmount = (method: PaymentMethod) => {
    let finalAmount = amount;
    
    if (method.discount) {
      finalAmount = amount * (1 - method.discount / 100);
    }
    
    return finalAmount;
  };

  const calculateSavings = (method: PaymentMethod) => {
    if (method.discount) {
      return amount * (method.discount / 100);
    }
    if (method.cashback) {
      return amount * (method.cashback / 100);
    }
    return 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Secure Payment</h2>
              <p className="text-blue-100">Choose your preferred payment method</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-blue-100 text-sm">Amount to Pay</p>
            <p className="text-3xl font-bold">{formatCurrency(amount)}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">256-bit</p>
            <p className="text-blue-100 text-xs">SSL Encryption</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-blue-100 text-xs">Secure</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">24/7</p>
            <p className="text-blue-100 text-xs">Support</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Special Offers Banner */}
        <motion.div
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6 cursor-pointer"
          onClick={() => setShowOffers(!showOffers)}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Special Offers Available!</h3>
                <p className="text-sm text-gray-600">Save up to ₹{Math.round(amount * 0.05)} on your booking</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showOffers ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {showOffers && (
              <motion.div
                className="mt-4 pt-4 border-t border-yellow-200 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Percent className="w-4 h-4 text-green-500" />
                    <span>2% off with UPI payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>Instant booking confirmation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <span>Cashback on wallet payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>100% refund protection</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            const isExpanded = expandedMethod === method.id;
            const savings = calculateSavings(method);
            const finalAmount = calculateFinalAmount(method);

            return (
              <motion.div
                key={method.id}
                className={`border-2 rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  onPaymentSelect(method);
                  setExpandedMethod(isExpanded ? null : method.id);
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{method.name}</h3>
                          {method.popular && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                              Popular
                            </span>
                          )}
                          {method.instant && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full flex items-center space-x-1">
                              <Zap className="w-3 h-3" />
                              <span>Instant</span>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{method.processingTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {savings > 0 && (
                        <div className="text-green-600 font-semibold mb-1">
                          Save {formatCurrency(savings)}
                        </div>
                      )}
                      <div className="text-lg font-bold text-gray-800">
                        {formatCurrency(finalAmount)}
                      </div>
                      {isSelected && (
                        <motion.div
                          className="flex justify-end mt-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="mt-4 pt-4 border-t border-gray-200"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {method.offers && method.offers.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800 flex items-center space-x-2">
                              <Gift className="w-4 h-4 text-green-500" />
                              <span>Special Offers</span>
                            </h4>
                            <div className="space-y-2">
                              {method.offers.map((offer, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>{offer}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {method.type === 'emi' && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-3">
                            <h4 className="font-medium text-gray-800 mb-2">EMI Breakdown</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">3 months:</span>
                                <span className="font-semibold ml-2">
                                  {formatCurrency(finalAmount / 3)}/month
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">6 months:</span>
                                <span className="font-semibold ml-2">
                                  {formatCurrency(finalAmount / 6)}/month
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">9 months:</span>
                                <span className="font-semibold ml-2">
                                  {formatCurrency(finalAmount / 9)}/month
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">12 months:</span>
                                <span className="font-semibold ml-2">
                                  {formatCurrency(finalAmount / 12)}/month
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Security Features */}
                        <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span>SSL Encrypted</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Check className="w-3 h-3 text-green-500" />
                            <span>PCI DSS Compliant</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="w-3 h-3 text-green-500" />
                            <span>Bank Grade Security</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Your payment is 100% secure</p>
              <p>We use industry-standard encryption and security measures to protect your payment information. Your card details are never stored on our servers.</p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {selectedMethod && (
          <motion.button
            className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shield className="w-5 h-5" />
            <span>Continue with {paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PaymentSelector;
