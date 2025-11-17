"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
  image: string;
};

const interval: NodeJS.Timeout | null = null;

// ---------------------------
// CardSlide Component
// ---------------------------
export const CardSlide = ({
  items,
  offset = 22,
  scaleFactor = 0.06,
  intervalDuration = 3000,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  intervalDuration?: number;
}) => {
  const [cards] = useState<Card[]>(items);
  const [dynamicOffset, setDynamicOffset] = useState(offset);
  const [dynamicScale, setDynamicScale] = useState(scaleFactor);
  const [cardSize, setCardSize] = useState({ height: "26rem", width: "22rem" });

  // Responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDynamicOffset(6);
        setDynamicScale(0.04);
        setCardSize({ height: "23rem", width: "21rem" });
      } else if (window.innerWidth < 1024) {
        setDynamicOffset(10);
        setDynamicScale(0.05);
        setCardSize({ height: "27rem", width: "25rem" });
      } else {
        setDynamicOffset(offset);
        setDynamicScale(scaleFactor);
        setCardSize({ height: "33rem", width: "27rem" });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [offset, scaleFactor]);

  // Auto-rotation - DISABLED to prevent flickering
  useEffect(() => {
    // Auto-rotation disabled - causes flickering and layout shift
    // Keeping cards static for better UX
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [intervalDuration]);

  return (
    <div
      className="relative mx-auto pointer-events-auto z-10"
      style={{
        height: `calc(${cardSize.height} + ${cards.length * dynamicOffset}px)`,
        width: cardSize.width,
        overflow: "visible",
      }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-3xl p-6 md:p-8 lg:p-8 shadow-2xl border border-slate-200/50 flex flex-col justify-between text-left overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-300"
          style={{
            transformOrigin: "top center",
            height: cardSize.height,
            width: cardSize.width,
            background: `linear-gradient(135deg, ${['#ffffff', '#f8fafc', '#fef7f0', '#f0f9ff', '#f0fdf4', '#fdf2f8'][index % 6]} 0%, ${['#f1f5f9', '#f1f8fc', '#fef3e2', '#ecf9ff', '#dcfce7', '#fce7f3'][index % 6]} 100%)`,
          }}
          animate={{
            top: index * -dynamicOffset,
            scale: 1 - index * dynamicScale,
            zIndex: cards.length - index,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <div className="space-y-4 md:space-y-5 lg:space-y-6 flex-1 flex flex-col pb-2 text-center">
            {/* Premium Experience Badge - Centered */}
            <div className="flex justify-center mb-2">
              <div className="flex items-center gap-2 bg-adventure-orange/10 border border-adventure-orange/20 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-adventure-orange flex-shrink-0"></div>
                <p className="font-tall-rugged text-adventure-orange font-bold text-xs uppercase tracking-wider">
                  Premium Experience
                </p>
              </div>
            </div>

            {/* Icon and Title */}
            <div>
              <h3 className="font-oswald font-bold text-xl md:text-2xl lg:text-3xl text-forest-green mb-2 md:mb-3 leading-tight text-center">
                {card.name}
              </h3>
              <p className="font-tall-rugged font-bold text-sm md:text-base lg:text-lg leading-tight uppercase tracking-wider text-adventure-orange text-center">
                {card.designation}
              </p>
            </div>

            {/* Content Text - Concise and Well-Aligned */}
            <p className="font-inter font-normal text-slate-700 text-sm md:text-base lg:text-base leading-relaxed flex-1 min-h-12 md:min-h-14 text-justify">
              {card.content}
            </p>

            {/* Image Section - Centered and Larger */}
            <div className="mt-3 md:mt-4 lg:mt-5 flex justify-center">
              <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow w-full max-w-xs">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-36 md:h-40 lg:h-44 object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ---------------------------
// HeroPreviewWalls Component
// ---------------------------
export function HeroPreviewWalls() {
  const CARDS = [
    {
      id: 0,
      name: "AI-Powered Automation",
      designation: "Efficiency through Intelligence",
      content: (
        <p>
          We design intelligent systems that streamline workflows, reduce
          overhead, and enable you to scale without friction. Our automation
          modules integrate seamlessly across{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            multiple platforms and APIs
          </span>
          , ensuring precision and reliability.
        </p>
      ),
      image:
        "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/dashboard-gradient.png",
    },
    {
      id: 1,
      name: "Modern Design Systems",
      designation: "Built for Flexibility and Speed",
      content: (
        <p>
          From concept to code, our design systems empower product teams to move
          faster. We build reusable components, maintain visual consistency, and
          support{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            theme-aware UI kits
          </span>{" "}
          that adapt dynamically to dark and light modes.
        </p>
      ),
      image:
        "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/crm-featured.png",
    },
    {
      id: 2,
      name: "Cloud & Edge Deployment",
      designation: "Reliable Infrastructure at Scale",
      content: (
        <p>
          Our deployments leverage the latest in container orchestration and
          edge computing. Whether you're hosting on{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            AWS, GCP, or on-prem
          </span>
          , our pipelines ensure performance, monitoring, and fault tolerance.
        </p>
      ),
      image:
        "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/featured-06.png",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-black text-black dark:text-white py-16 sm:py-20 md:py-24">
      <div className="max-w-5xl mx-auto text-left px-4 sm:px-6">
        <div className="inline-block mb-4 border border-neutral-300 dark:border-neutral-700 rounded-full px-3 py-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Your building and design partner
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
          We build technology that moves your vision forward
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-8">
          Empowering startups and teams to turn ambitious ideas into stunning
          products — fast, scalable, and beautifully engineered.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-20">
          <button className="rounded-full bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-medium hover:opacity-80 transition">
            Explore Components
          </button>
          <button className="rounded-full border border-neutral-400 dark:border-neutral-600 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Background Image */}
      <div className="relative flex justify-center max-w-5xl mx-auto px-4 sm:px-6">
        <img
          src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/abstract-glass-walls.jpg"
          alt="Background"
          className="rounded-2xl shadow-xl w-full object-cover border-8 border-neutral-200 dark:border-neutral-800"
        />

        {/* Anchored Card Stack */}
        <div className="absolute -bottom-36 sm:-bottom-16 md:-bottom-9 flex justify-center w-full">
          <CardSlide items={CARDS} />
        </div>
      </div>
    </section>
  );
}