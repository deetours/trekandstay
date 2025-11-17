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

const sampleMediaContent: MediaContent = {
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
};

const MediaContent = () => {
  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-slate-900'>
        About This Experience
      </h2>
      <p className='text-lg mb-8 text-slate-700'>
        {sampleMediaContent.about.overview}
      </p>

      <div className='grid md:grid-cols-3 gap-6 my-12'>
        <div className='p-6 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-lg transition'>
          <div className='text-3xl font-bold text-adventure-orange mb-2'>✨</div>
          <h3 className='font-bold text-slate-900 mb-2'>Immersive Design</h3>
          <p className='text-slate-600'>Modern scroll-based interactions that captivate users</p>
        </div>
        <div className='p-6 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-lg transition'>
          <div className='text-3xl font-bold text-adventure-orange mb-2'>🎬</div>
          <h3 className='font-bold text-slate-900 mb-2'>Video & Images</h3>
          <p className='text-slate-600'>Seamless support for both video and image content</p>
        </div>
        <div className='p-6 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200 hover:shadow-lg transition'>
          <div className='text-3xl font-bold text-adventure-orange mb-2'>📱</div>
          <h3 className='font-bold text-slate-900 mb-2'>Fully Responsive</h3>
          <p className='text-slate-600'>Perfect experience on desktop, tablet, and mobile devices</p>
        </div>
      </div>

      <p className='text-lg text-slate-700 mb-8'>
        {sampleMediaContent.about.conclusion}
      </p>

      <div className='grid md:grid-cols-2 gap-8 my-12'>
        <div>
          <h3 className='text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
            <span className='text-adventure-orange'>🏔️</span> Adventure Types
          </h3>
          <ul className='space-y-2 text-slate-700'>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>•</span> Mountain Trekking
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>•</span> Beach & Water Sports
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>•</span> Cultural Expeditions
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>•</span> Wildlife Safari
            </li>
          </ul>
        </div>
        <div>
          <h3 className='text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2'>
            <span className='text-adventure-orange'>🌟</span> Why Choose Us
          </h3>
          <ul className='space-y-2 text-slate-700'>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>✓</span> Expert Local Guides
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>✓</span> Safe & Insured
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>✓</span> Small Group Sizes
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-adventure-orange font-bold'>✓</span> Eco-Friendly
            </li>
          </ul>
        </div>
      </div>

      <div className='mt-12 p-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white shadow-xl'>
        <h3 className='text-2xl font-bold mb-3'>Ready for Your Next Adventure?</h3>
        <p className='mb-4 text-orange-100'>Start exploring our collection of carefully curated travel experiences.</p>
        <button className='px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition transform hover:scale-105'>
          Explore Trips Now
        </button>
      </div>
    </div>
  );
};

export default function HomePage2Test() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-white'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4'></div>
          <p className='text-slate-600'>Loading immersive experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <ScrollExpandMedia
        mediaType='video'
        mediaSrc={sampleMediaContent.src}
        posterSrc={sampleMediaContent.poster}
        bgImageSrc={sampleMediaContent.background}
        title={sampleMediaContent.title}
        date={sampleMediaContent.date}
        scrollToExpand={sampleMediaContent.scrollToExpand}
      >
        <MediaContent />
      </ScrollExpandMedia>
    </div>
  );
}
