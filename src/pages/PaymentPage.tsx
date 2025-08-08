import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const UPI_ID = 'trekandstay@ybl';
const QR_IMAGE = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=trekandstay@ybl&pn=TrekAndStay';
const WHATSAPP_NUMBER = '+919876543210';

export const PaymentPage: React.FC = () => {
  const [paymentSent, setPaymentSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Simulate admin confirmation after WhatsApp message
  const handlePaymentSent = () => {
    setPaymentSent(true);
    setTimeout(() => setConfirmed(true), 4000); // Simulate admin confirmation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-gray to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-oswald font-bold text-forest-green mb-4">Complete Your Payment</h1>
          <p className="text-xl text-mountain-blue font-inter max-w-2xl mx-auto">
            Pay securely via UPI and confirm your booking instantly on WhatsApp.
          </p>
        </motion.div>

        <Card className="p-8 mb-8">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <img src={QR_IMAGE} alt="UPI QR Code" className="w-48 h-48 mb-4 rounded-xl border-4 border-adventure-orange shadow-lg" />
            <div className="text-lg font-oswald font-bold text-forest-green mb-2">Scan & Pay</div>
            <div className="text-gray-700 mb-2">UPI ID: <span className="font-semibold">{UPI_ID}</span></div>
            <div className="text-gray-500 text-sm mb-4">Use any UPI app (Google Pay, PhonePe, Paytm, etc.)</div>
            <Button
              variant="adventure"
              size="lg"
              className="mb-2"
              onClick={() => window.open(`upi://pay?pa=${UPI_ID}&pn=TrekAndStay`, '_blank')}
            >
              Pay with UPI
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </Card>

        <Card className="p-8 mb-8">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="text-lg font-oswald font-bold text-forest-green mb-2">Confirm on WhatsApp</div>
            <div className="text-gray-700 mb-4">After payment, send your payment screenshot to our team for instant confirmation.</div>
            <Button
              variant="adventure"
              size="lg"
              className="mb-2"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi!%20I%20have%20paid%20for%20my%20adventure%20booking.%20Please%20confirm.`, '_blank')}
            >
              Confirm on WhatsApp
              <MessageCircle className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="mt-4"
              onClick={handlePaymentSent}
              disabled={paymentSent}
            >
              {paymentSent ? 'Waiting for Confirmation...' : 'I Have Sent Payment'}
            </Button>
          </motion.div>
        </Card>

        {confirmed && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6 animate-bounce" />
            <h3 className="text-2xl font-oswald font-bold text-forest-green mb-4">
              Thanks for Booking!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your payment has been confirmed. Our team will contact you soon with your trip details and next steps.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
