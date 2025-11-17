import {
  useRef,
  ReactNode,
} from 'react';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  children,
}: ScrollExpandMediaProps) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={sectionRef} className='w-full bg-white'>
      <section className='relative w-full min-h-[100dvh] bg-white flex flex-col items-center justify-center'>
        {/* Background */}
        <div className='absolute inset-0 z-0'>
          <img
            src={bgImageSrc}
            alt='Background'
            className='w-full h-full object-cover opacity-30'
          />
        </div>

        {/* Hero Content */}
        <div className='relative z-10 w-full flex flex-col items-center justify-center h-full px-4'>
          {/* Media */}
          <div className='w-full max-w-3xl mb-8'>
            <div className='aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black'>
              {mediaType === 'video' ? (
                mediaSrc.includes('youtube.com') ? (
                  <iframe
                    width='100%'
                    height='100%'
                    src={
                      mediaSrc.includes('embed')
                        ? mediaSrc +
                          (mediaSrc.includes('?') ? '&' : '?') +
                          'autoplay=1&mute=1'
                        : mediaSrc.replace('watch?v=', 'embed/') +
                          '?autoplay=1&mute=1'
                    }
                    className='w-full h-full'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={mediaSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className='w-full h-full object-cover'
                  />
                )
              ) : (
                <img
                  src={mediaSrc}
                  alt={title}
                  className='w-full h-full object-cover'
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div className='text-center mb-6'>
            {date && (
              <p className='text-2xl font-semibold text-adventure-orange mb-2'>
                {date}
              </p>
            )}
            {scrollToExpand && (
              <p className='text-sm font-medium text-adventure-orange animate-pulse'>
                {scrollToExpand}
              </p>
            )}
          </div>

          {/* Title */}
          <div className='text-center mb-8'>
            <h1 className='text-5xl md:text-6xl font-bold text-forest-green'>
              {title}
            </h1>
          </div>
        </div>
      </section>

      {/* Content Below */}
      <section className='w-full px-4 md:px-8 py-12 md:py-20 bg-white'>
        {children}
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
