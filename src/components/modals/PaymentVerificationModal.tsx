import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  QrCode,
  Smartphone,
  CreditCard,
  XCircle,
  ArrowRight,
  Shield,
  AlertTriangle,
  Upload,
} from 'lucide-react';

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  amount: number;
  destination: string;
  userPhone: string;
  onPaymentConfirmed?: () => void;
}

interface PaymentData {
  id: number;
  reference_number: string;
  status: string;
  verification_status: string;
  upi_link?: string;
  expires_at: string;
  risk_level: string;
  risk_score: number;
}

type PaymentStep = 'confirm' | 'initiate' | 'payment' | 'proof' | 'waiting' | 'confirmed';

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  destination,
  userPhone,
  onPaymentConfirmed,
}) => {
  const [step, setStep] = useState<PaymentStep>('confirm');
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upiTxnId, setUpiTxnId] = useState('');
  const [customerVpa, setCustomerVpa] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Create payment on component mount if modal is open
  useEffect(() => {
    if (isOpen && step === 'confirm') {
      createPayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Timer for payment expiry
  useEffect(() => {
    if (payment?.expires_at && step !== 'confirmed' && step !== 'waiting') {
      const interval = setInterval(() => {
        const expiryTime = new Date(payment.expires_at).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

        setTimeRemaining(remaining);

        if (remaining === 0) {
          setStep('confirm');
          setError('Payment window expired. Please start again.');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [payment?.expires_at, step]);

  const createPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          amount,
          customer_vpa: customerVpa,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();
      setPayment(data.payment);
      setStep('initiate');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!payment) return;

      const response = await fetch(`/api/payments/${payment.id}/initiate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: payment.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const data = await response.json();
      setPayment(data.payment);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const submitPaymentProof = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!payment) return;

      const response = await fetch(`/api/payments/${payment.id}/submit-proof/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: payment.id,
          upi_txn_id: upiTxnId,
          customer_vpa: customerVpa,
          proof_image_url: proofUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit payment proof');
      }

      const data = await response.json();
      setPayment(data.payment);
      setStep('waiting');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-forest-green to-waterfall-blue p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Secure Payment</h2>
              <p className="text-white/80">Trek & Stay Adventures</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-700">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Risk Level Warning */}
            {payment && payment.risk_level !== 'low' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg flex items-start gap-3"
              >
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-700">Enhanced Verification</p>
                  <p className="text-yellow-600 text-sm">
                    Your payment requires manual verification for security. This is normal.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step: Confirm */}
            <AnimatePresence mode="wait">
              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-forest-green/5 to-waterfall-blue/5 p-6 rounded-xl border border-forest-green/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-600 text-sm">Booking Amount</p>
                        <p className="text-4xl font-bold text-forest-green">₹{amount.toLocaleString()}</p>
                      </div>
                      <Shield className="w-8 h-8 text-forest-green" />
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination</span>
                        <span className="font-semibold">{destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmation to</span>
                        <span className="font-semibold">{userPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800">Payment Method</h3>
                    <p className="text-gray-600 text-sm">
                      We accept UPI payments for secure and fast transactions. Your payment is encrypted and verified.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-semibold mb-1">Security Notice</p>
                      <p>
                        All payments are verified manually by our team before booking confirmation.
                        You'll receive a confirmation via WhatsApp.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={createPayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Payment...' : 'Proceed to Payment'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Step: Initiate */}
              {step === 'initiate' && payment && (
                <motion.div
                  key="initiate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Payment Ready</h3>
                    <p className="text-gray-600 mb-4">
                      Reference Number: <span className="font-mono font-bold">{payment.reference_number}</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <p className="text-sm text-gray-600">
                        Payment valid for: <span className="font-bold">{timeRemaining ? formatTime(timeRemaining) : 'Loading...'}</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Please complete payment within this time window
                    </p>
                  </div>

                  <button
                    onClick={initiatePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Initiating...' : 'I have UPI App'}
                    <Smartphone className="w-5 h-5" />
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Next: You'll be guided to your UPI app for payment
                  </p>
                </motion.div>
              )}

              {/* Step: Payment */}
              {step === 'payment' && payment && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-forest-green/5 to-waterfall-blue/5 p-6 rounded-xl border border-forest-green/20">
                    <div className="text-center mb-6">
                      <QrCode className="w-12 h-12 mx-auto text-forest-green mb-3" />
                      <h3 className="font-bold text-gray-800 mb-2">UPI Payment Details</h3>
                      <p className="text-gray-600 text-sm">Complete payment using any UPI app</p>
                    </div>

                    <div className="space-y-3 text-sm bg-white p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="text-gray-600 mb-1">UPI ID</p>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                          <span className="font-mono font-bold">trekandstay@ybl</span>
                          <button
                            onClick={() => copyToClipboard('trekandstay@ybl')}
                            className="text-forest-green hover:text-forest-green/70 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-600 mb-1">Amount</p>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                          <span className="font-bold">₹{amount.toLocaleString()}</span>
                          <button
                            onClick={() => copyToClipboard(`₹${amount}`)}
                            className="text-forest-green hover:text-forest-green/70 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-600 mb-1">Reference</p>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                          <span className="font-mono font-bold text-xs">{payment.reference_number}</span>
                          <button
                            onClick={() => copyToClipboard(payment.reference_number)}
                            className="text-forest-green hover:text-forest-green/70 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={payment.upi_link || 'upi://pay'}
                      className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                    >
                      <Smartphone className="w-5 h-5" />
                      Open UPI App & Pay
                    </a>

                    <button
                      onClick={() => setStep('proof')}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-300"
                    >
                      <CreditCard className="w-5 h-5" />
                      I Paid Manually
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    ⏱️ Time remaining: {timeRemaining ? formatTime(timeRemaining) : 'Expired'}
                  </div>
                </motion.div>
              )}

              {/* Step: Proof */}
              {step === 'proof' && payment && (
                <motion.div
                  key="proof"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Payment Confirmation</h3>
                    <p className="text-gray-600 text-sm">
                      Please provide your UPI transaction details so we can verify your payment
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        UPI Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={upiTxnId}
                        onChange={(e) => setUpiTxnId(e.target.value)}
                        placeholder="E.g., 321656891236541"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Found in your UPI app's transaction history or SMS receipt
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your UPI ID *
                      </label>
                      <input
                        type="text"
                        value={customerVpa}
                        onChange={(e) => setCustomerVpa(e.target.value)}
                        placeholder="E.g., yourname@ybl"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Screenshot/Proof URL (optional)
                      </label>
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Share a screenshot of the payment receipt
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Your payment will be verified by our team. You'll receive a WhatsApp confirmation shortly.
                    </p>
                  </div>

                  <button
                    onClick={submitPaymentProof}
                    disabled={loading || !upiTxnId || !customerVpa}
                    className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Payment Details'}
                    <Upload className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Step: Waiting */}
              {step === 'waiting' && payment && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 mx-auto mb-4"
                    >
                      <Clock className="w-full h-full text-forest-green" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Under Verification</h3>
                    <p className="text-gray-600">
                      Reference: <span className="font-mono font-bold">{payment.reference_number}</span>
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-green-700 text-sm">
                      ✓ Payment details received successfully
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                    <p className="font-semibold text-blue-900">What happens next?</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>✓ Our team verifies your payment (usually within 1 hour)</li>
                      <li>✓ You'll receive a WhatsApp confirmation</li>
                      <li>✓ Your booking will be automatically confirmed</li>
                    </ul>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
                  >
                    Close & Wait for Confirmation
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Keep this reference number for your records
                  </p>
                </motion.div>
              )}

              {/* Step: Confirmed */}
              {step === 'confirmed' && payment && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.6, repeat: 3 }}
                      className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed! 🎉</h3>
                    <p className="text-gray-600">Your adventure awaits!</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
                    <p className="font-semibold text-green-900">Payment Verified</p>
                    <p className="text-green-700 text-sm">
                      Amount: ₹{amount.toLocaleString()}
                    </p>
                    <p className="text-green-700 text-sm">
                      Reference: {payment.reference_number}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                    <p className="font-semibold text-blue-900">📱 Confirmation Details</p>
                    <p className="text-blue-700 text-sm">
                      WhatsApp updates will be sent to: <span className="font-bold">{userPhone}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onPaymentConfirmed?.();
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-forest-green to-waterfall-blue text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition-all duration-300"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentVerificationModal;
