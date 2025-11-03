import { motion } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedDestinations } from '../components/sections/FeaturedDestinations';
import { FeaturedStays } from '../components/sections/FeaturedStays';
import { StoriesWidget } from '../components/dashboard/StoriesWidgetNew';
// import { BookingWidget } from '../components/sections/BookingWidget';
import { TrustStrip } from '../components/sections/TrustStrip';
import { ValueProps } from '../components/sections/ValueProps';
import FAQ from '../components/sections/FAQ';
import { NewsletterCTA } from '../components/sections/NewsletterCTA';
import { PartnerLogos } from '../components/sections/PartnerLogos';
import { LocalScene } from '../components/3d/LocalScene';
import { FeaturedTreks } from '../components/sections/FeaturedTreks';

export function HomePage() {
  return (
    <PageTransition>
      <div className="relative">
        <LocalScene variant="compass" size={260} />
        <HeroSection />
      </div>
      <div className="-mt-10 relative z-10 px-4">
        <TrustStrip />
      </div>
      <ValueProps />
      <FeaturedTreks />
      <PartnerLogos />
      <FeaturedDestinations />
      <FeaturedStays />
      {/* Stories Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Traveler Stories
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Real adventures from our community. Discover inspiring journeys and create your own unforgettable memories.
            </motion.p>
          </div>
          <StoriesWidget />
        </div>
      </section>
      <FAQ />
      <NewsletterCTA />
    </PageTransition>
  );
}

export default HomePage;
