import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const defaultSEO: Required<SEOProps> = {
  title: 'Trek & Stay - Discover Karnataka\'s Hidden Gems',
  description: 'Embark on unforgettable adventures through pristine waterfalls, ancient forts, and breathtaking landscapes across Karnataka and Maharashtra. Professional guides, safety equipment included.',
  keywords: 'Karnataka trekking, waterfall adventures, fort exploration, wildlife safari, Western Ghats, adventure tourism, eco-friendly travel, guided tours, photography tours, mountain climbing',
  image: '/favicon.png',
  url: window.location.href,
  type: 'website'
};

export const SEOHead: React.FC<SEOProps> = (props) => {
  const seo = { ...defaultSEO, ...props };
  const fullTitle = props.title ? `${props.title} | Trek & Stay` : defaultSEO.title;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', seo.description);
    updateMetaTag('keywords', seo.keywords);
    updateMetaTag('author', 'Trek & Stay');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', seo.description, true);
    updateMetaTag('og:image', seo.image, true);
    updateMetaTag('og:url', seo.url, true);
    updateMetaTag('og:type', seo.type, true);
    updateMetaTag('og:site_name', 'Trek & Stay', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', seo.description);
    updateMetaTag('twitter:image', seo.image);
    updateMetaTag('twitter:site', '@trekandstay');

    // Additional SEO tags
    updateMetaTag('theme-color', '#1B4332');
    updateMetaTag('msapplication-TileColor', '#1B4332');
    
    // Structured data for local business
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      "name": "Trek & Stay",
      "description": seo.description,
      "url": seo.url,
      "logo": "/favicon.png",
      "image": seo.image,
      "telephone": "+91-98765-43210",
      "email": "adventures@trekandstay.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bangalore",
        "addressRegion": "Karnataka",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "12.9716",
        "longitude": "77.5946"
      },
      "priceRange": "₹₹",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "2000"
      }
    };

    // Update structured data
    let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(structuredData);

  }, [fullTitle, seo.description, seo.keywords, seo.image, seo.url, seo.type]);

  return null;
};
