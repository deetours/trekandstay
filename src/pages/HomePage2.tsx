import { useEffect, useState } from 'react';
import ScrollExpandMedia from '../components/ui/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1280&auto=format&fit=crop',
    background: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
    title: 'Immersive Travel Experience',
    date: 'Adventure Awaits',
    scrollToExpand: 'Scroll to Expand',
    about: {
      overview:
        'Experience the most immersive travel experiences with our carefully curated adventures. As you scroll, the video expands to fill your screen, creating an engaging introduction to your next journey. This is how modern travel platforms showcase their content.',
      conclusion:
        'Our scroll-based hero component provides a unique way to engage users with travel content. Watch as the video grows larger with each scroll, drawing you into the adventure. This modern interaction pattern keeps users engaged and intrigued.',
    },
  },
};

const MediaContent = () => {
  const currentMedia = sampleMediaContent.video;

  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-forest-green'>
        About This Experience
      </h2>
      <p className='text-lg mb-8 text-gray-700'>
        {currentMedia.about.overview}
      </p>

      <div className='grid md:grid-cols-3 gap-6 my-12'>
        <div className='p-6 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-lg transition-shadow'>
          <div className='text-3xl font-bold text-adventure-orange mb-2'>✨</div>
          <h3 className='font-bold text-forest-green mb-2'>Immersive Design</h3>
          <p className='text-gray-600'>Modern scroll-based interactions that captivate users and create memorable experiences</p>
        </div>
        <div className='p-6 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-lg transition-shadow'>
          <div className='text-3xl font-bold text-adventure-orange mb-2'>🎬</div>
          <h3 className='font-bold text-forest-green mb-2'>Video & Images</h3>
          <p className='text-gray-600'>Seamless support for both video and image content with smooth animations and effects</p>
        </div>
        <div className='p-6 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-lg transition-shadow'>
          <div className='text-3xl font-bold text-adventure-orange mb-2'>📱</div>
          <h3 className='font-bold text-forest-green mb-2'>Fully Responsive</h3>
          <p className='text-gray-600'>Perfect experience on desktop, tablet, and mobile devices with optimized touch interactions</p>
        </div>
      </div>

      <p className='text-lg text-gray-700 mb-8'>
        {currentMedia.about.conclusion}
      </p>

      <div className='mt-12 p-8 bg-gradient-to-r from-adventure-orange to-orange-600 rounded-xl text-white shadow-lg'>
        <h3 className='text-2xl font-bold mb-3'>Ready for Your Next Adventure?</h3>
        <p className='mb-4 text-orange-50'>Start exploring our collection of carefully curated travel experiences tailored for adventurers like you.</p>
        <button className='px-6 py-3 bg-white text-adventure-orange font-bold rounded-lg hover:bg-orange-50 transition-all transform hover:scale-105'>
          Explore Trips
        </button>
      </div>

      {/* Additional Info Section */}
      <div className='mt-16 grid md:grid-cols-2 gap-8'>
        <div>
          <h3 className='text-xl font-bold text-forest-green mb-4'>Why Choose Us?</h3>
          <ul className='space-y-3 text-gray-700'>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>✓</span>
              <span>Expert guides with years of experience</span>
            </li>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>✓</span>
              <span>Small group sizes for personalized attention</span>
            </li>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>✓</span>
              <span>Safety is our top priority</span>
            </li>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>✓</span>
              <span>Eco-friendly travel practices</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className='text-xl font-bold text-forest-green mb-4'>What You'll Experience</h3>
          <ul className='space-y-3 text-gray-700'>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>★</span>
              <span>Breathtaking landscapes and views</span>
            </li>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>★</span>
              <span>Cultural immersion and local interactions</span>
            </li>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>★</span>
              <span>Adventure sports and activities</span>
            </li>
            <li className='flex items-center gap-3'>
              <span className='text-adventure-orange text-xl'>★</span>
              <span>Unforgettable memories with fellow travelers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function HomePage2() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-adventure-orange mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Test: Check if ScrollExpandMedia renders */}
      <div className='h-screen bg-gradient-to-b from-red-100 to-red-200 flex items-center justify-center'>
        <h1 className='text-4xl font-bold'>ScrollExpandMedia Loading...</h1>
      </div>
      
      <ScrollExpandMedia
        mediaType='video'
        mediaSrc={sampleMediaContent.video.src}
        posterSrc={sampleMediaContent.video.poster}
        bgImageSrc={sampleMediaContent.video.background}
        title={sampleMediaContent.video.title}
        date={sampleMediaContent.video.date}
        scrollToExpand={sampleMediaContent.video.scrollToExpand}
      >
        <MediaContent />
      </ScrollExpandMedia>

      {/* Footer */}
      <footer className='bg-forest-green text-white py-12 md:py-16'>
        <div className='max-w-6xl mx-auto px-4 md:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-12'>
            <div>
              <h4 className='font-semibold mb-4'>Company</h4>
              <ul className='space-y-2 text-green-100 text-sm'>
                <li><a href='#' className='hover:text-white transition-colors'>About Us</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Careers</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Explore</h4>
              <ul className='space-y-2 text-green-100 text-sm'>
                <li><a href='#' className='hover:text-white transition-colors'>Destinations</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Treks</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Guides</a></li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Support</h4>
              <ul className='space-y-2 text-green-100 text-sm'>
                <li><a href='#' className='hover:text-white transition-colors'>Help Center</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Contact</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className='font-semibold mb-4'>Legal</h4>
              <ul className='space-y-2 text-green-100 text-sm'>
                <li><a href='#' className='hover:text-white transition-colors'>Privacy</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Terms</a></li>
                <li><a href='#' className='hover:text-white transition-colors'>Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className='pt-8 border-t border-green-700 text-center text-green-100 text-sm'>
            <p>&copy; 2024 Trek & Stay. All rights reserved. | Scroll-Expansion Hero Test Page</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
