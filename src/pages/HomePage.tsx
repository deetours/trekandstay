import { motion } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedDestinationsAndStays } from '../components/sections/FeaturedDestinationsAndStays';
import { StoriesWidget } from '../components/dashboard/StoriesWidgetNew';
// import { BookingWidget } from '../components/sections/BookingWidget';
// import { TrustStripImproved } from '../components/sections/TrustStripImproved';
import { ValueProps } from '../components/sections/ValueProps';
import FAQ from '../components/sections/FAQ';
import { NewsletterCTA } from '../components/sections/NewsletterCTA';
import { PartnerLogos } from '../components/sections/PartnerLogos';
import { LocalScene } from '../components/3d/LocalScene';
import { FeaturedTreks } from '../components/sections/FeaturedTreks';
import { BackgroundBeams } from '../components/ui/background-beams';

export function HomePage() {
  return (
    <PageTransition>
      <div className="relative">
        <LocalScene variant="compass" size={260} />
        <HeroSection />
      </div>

      {/* TrustStrip component removed - trust indicators no longer needed */}
      {/* <div className="-mt-10 relative z-10 px-4">
        <TrustStripImproved />
      </div> */}
      
      <ValueProps />
      <FeaturedTreks />
      <PartnerLogos />
      <FeaturedDestinationsAndStays />
      
      {/* Stories Section with BackgroundBeams - Blended */}
      <section className="relative py-0 bg-gradient-to-b from-white/5 via-white/0 to-stone-gray/20 overflow-hidden">
        {/* Full-width Background Beams */}
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <BackgroundBeams className="opacity-35" />
        </div>

        {/* Gradient fade-in from FeaturedDestinationsAndStays */}
        <div className="absolute top-0 left-0 right-0 h-20 md:h-28 bg-gradient-to-b from-white/60 via-white/30 to-transparent z-5 pointer-events-none" />

        <div className="relative z-10 py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-oswald font-bold text-gray-900 mb-4"
              >
                Traveler Stories
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-inter text-gray-600 max-w-2xl mx-auto"
              >
                Real adventures from our community. Discover inspiring journeys and create your own unforgettable memories.
              </motion.p>
            </div>
            <StoriesWidget />
          </div>
        </div>

        {/* Gradient fade-out to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-28 bg-gradient-to-b from-transparent via-white/30 to-white/80 z-20 pointer-events-none" />
      </section>
      <FAQ />
      <NewsletterCTA />
    </PageTransition>
  );
}

export default HomePage;
