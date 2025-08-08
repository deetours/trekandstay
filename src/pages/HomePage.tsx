import { PageTransition } from '../components/layout/PageTransition';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedDestinations } from '../components/sections/FeaturedDestinations';
// import { BookingWidget } from '../components/sections/BookingWidget';
import { StoriesWidget } from '../components/dashboard/StoriesWidget';
import { TrustStrip } from '../components/sections/TrustStrip';
import { ValueProps } from '../components/sections/ValueProps';
import { FAQ } from '../components/sections/FAQ';
import { NewsletterCTA } from '../components/sections/NewsletterCTA';
import { PartnerLogos } from '../components/sections/PartnerLogos';

export function HomePage() {
  return (
    <PageTransition>
      <HeroSection />
      <div className="-mt-10 relative z-10 px-4">
        <TrustStrip />
      </div>
      <ValueProps />
      <PartnerLogos />
      <FeaturedDestinations />
      <div className="mt-12">
        <StoriesWidget />
      </div>
      <FAQ />
      <NewsletterCTA />
    </PageTransition>
  );
}
