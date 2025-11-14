import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../components/navigation/Header';
import Footer from '../components/shared/Footer';
import WhatsAppFloat from '../components/shared/WhatsAppFloat';

const partnerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  businessType: z.string().min(1, 'Please select your business type'),
  experience: z.string().min(1, 'Please select your experience level'),
  expectedVolume: z.string().min(1, 'Please select expected booking volume'),
  message: z.string().min(20, 'Please tell us more about your business')
});

type PartnerForm = z.infer<typeof partnerSchema>;

export default function B2BPortalPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PartnerForm>({
    resolver: zodResolver(partnerSchema)
  });

  const onSubmit = async (data: PartnerForm) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Partner application submitted:', data);
    setIsSubmitted(true);
    reset();
  };

  const benefits = [
    {
      icon: CurrencyRupeeIcon,
      title: 'Attractive Commissions',
      description: 'Earn 15-25% commission on every booking with transparent tracking and monthly payouts.'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-Time Dashboard',
      description: 'Track bookings, commissions, and performance with our comprehensive partner portal.'
    },
    {
      icon: UsersIcon,
      title: 'Marketing Support',
      description: 'Get access to high-quality marketing materials, training, and co-marketing opportunities.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Exclusive Inventory',
      description: 'Access to unique retreat experiences not available on other platforms.'
    }
  ];

  const stats = [
    { number: '50+', label: 'Active Partners' },
    { number: '₹2.5Cr+', label: 'Partner Earnings' },
    { number: '95%', label: 'Partner Satisfaction' },
    { number: '24/7', label: 'Support Available' }
  ];

  const partnerTypes = [
    {
      title: 'Travel Agencies',
      description: 'Traditional and online travel agencies looking to add transformational experiences',
      commission: '15-20%'
    },
    {
      title: 'Corporate Wellness',
      description: 'Companies offering employee wellness programs and corporate retreats',
      commission: '20-25%'
    },
    {
      title: 'Wellness Centers',
      description: 'Yoga studios, meditation centers, and wellness practitioners',
      commission: '18-23%'
    },
    {
      title: 'Influencers & Coaches',
      description: 'Life coaches, wellness influencers, and transformation specialists',
      commission: '20-25%'
    }
  ];

  return (
    <div className="min-h-screen bg-warm-sand">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-6xl font-serif text-deep-forest mb-6">
                  Partner With Us &<br />Transform Lives
                </h1>
                <p className="text-xl text-mystic-indigo leading-relaxed mb-8">
                  Join our network of trusted partners and offer your clients life-changing 
                  retreat experiences while earning attractive commissions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-sunrise-coral text-cloud-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-deep-forest transition-colors"
                  >
                    Become a Partner
                  </motion.button>
                  <button className="border-2 border-sunrise-coral text-sunrise-coral px-8 py-4 rounded-lg font-bold text-lg hover:bg-sunrise-coral hover:text-cloud-white transition-colors">
                    View Partner Portal
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <img
                  src="https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Business partnership"
                  className="w-full h-96 object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-cloud-white rounded-xl p-6 shadow-xl">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-8 h-8 text-sunrise-coral" />
                    <div>
                      <div className="text-2xl font-bold text-deep-forest">50+</div>
                      <div className="text-sm text-mystic-indigo">Active Partners</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-deep-forest">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-sunrise-coral mb-2">
                    {stat.number}
                  </div>
                  <div className="text-cloud-white font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-cloud-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-serif text-deep-forest mb-6">
                Why Partner With Us?
              </h2>
              <p className="text-xl text-mystic-indigo max-w-2xl mx-auto">
                We provide everything you need to successfully sell transformational retreat experiences.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-warm-sand rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <benefit.icon className="w-12 h-12 text-sunrise-coral mb-4" />
                  <h3 className="text-2xl font-serif text-deep-forest mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-mystic-indigo leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partner Types */}
        <section className="py-20 bg-warm-sand">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-serif text-deep-forest mb-6">
                Perfect For All Business Types
              </h2>
              <p className="text-xl text-mystic-indigo max-w-2xl mx-auto">
                Whether you're a travel agency, wellness center, or corporate consultant, 
                we have a partnership model that works for you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnerTypes.map((type, index) => (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-cloud-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-serif text-deep-forest">
                      {type.title}
                    </h3>
                    <span className="bg-sage-green text-cloud-white px-3 py-1 rounded-full text-sm font-bold">
                      {type.commission}
                    </span>
                  </div>
                  <p className="text-mystic-indigo leading-relaxed mb-6">
                    {type.description}
                  </p>
                  <div className="flex items-center gap-2 text-sunrise-coral font-medium">
                    <span>Learn More</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section ref={ref} className="py-20 bg-cloud-white">
          <div className="max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-serif text-deep-forest mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-mystic-indigo">
                Fill out our partner application and we'll get back to you within 24 hours.
              </p>
            </motion.div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-sage-green text-cloud-white rounded-2xl p-8 text-center"
              >
                <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-serif mb-4">Application Submitted! 🎉</h3>
                <p className="text-lg mb-4">
                  Thank you for your interest in partnering with us. Our team will review 
                  your application and get back to you within 24 hours.
                </p>
                <p className="text-sm opacity-90">
                  In the meantime, feel free to WhatsApp us if you have any questions!
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="bg-warm-sand rounded-2xl shadow-lg p-8"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Company Name *
                      </label>
                      <input
                        {...register('companyName')}
                        type="text"
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                        placeholder="Your company name"
                      />
                      {errors.companyName && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Contact Name *
                      </label>
                      <input
                        {...register('contactName')}
                        type="text"
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                        placeholder="Your full name"
                      />
                      {errors.contactName && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.contactName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                        placeholder="your.email@company.com"
                      />
                      {errors.email && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-deep-forest font-medium mb-2">
                      Website URL
                    </label>
                    <input
                      {...register('website')}
                      type="url"
                      className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                      placeholder="https://yourcompany.com"
                    />
                    {errors.website && (
                      <p className="text-alert-crimson text-sm mt-1">{errors.website.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Business Type *
                      </label>
                      <select
                        {...register('businessType')}
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                      >
                        <option value="">Select type</option>
                        <option value="travel-agency">Travel Agency</option>
                        <option value="corporate-wellness">Corporate Wellness</option>
                        <option value="wellness-center">Wellness Center</option>
                        <option value="influencer-coach">Influencer/Coach</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.businessType && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.businessType.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Experience Level *
                      </label>
                      <select
                        {...register('experience')}
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                      >
                        <option value="">Select experience</option>
                        <option value="new">New to travel/wellness</option>
                        <option value="some">Some experience</option>
                        <option value="experienced">Very experienced</option>
                      </select>
                      {errors.experience && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.experience.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-deep-forest font-medium mb-2">
                        Expected Volume *
                      </label>
                      <select
                        {...register('expectedVolume')}
                        className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors"
                      >
                        <option value="">Select volume</option>
                        <option value="1-5">1-5 bookings/month</option>
                        <option value="6-15">6-15 bookings/month</option>
                        <option value="16-30">16-30 bookings/month</option>
                        <option value="30+">30+ bookings/month</option>
                      </select>
                      {errors.expectedVolume && (
                        <p className="text-alert-crimson text-sm mt-1">{errors.expectedVolume.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-deep-forest font-medium mb-2">
                      Tell Us About Your Business *
                    </label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-soft-grey rounded-lg focus:border-sage-green focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about your business, your clients, and why you're interested in partnering with us..."
                    />
                    {errors.message && (
                      <p className="text-alert-crimson text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-sunrise-coral text-cloud-white py-4 rounded-lg font-bold text-lg hover:bg-deep-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Partner Application'}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </div>
        </section>
      </div>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}