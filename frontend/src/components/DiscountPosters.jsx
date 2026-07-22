import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const DiscountPosters = ({ posters }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  const defaultPosters = [
    { id: 'def1', image: '/discount_banner_1.png', title: 'Mega Sale' },
    { id: 'def2', image: '/discount_banner_2.png', title: 'Home Appliances' },
    { id: 'def3', image: '/discount_banner_3.png', title: 'Fashion Offer' },
    { id: 'def4', image: '/discount_banner_1.png', title: 'Mega Sale' },
    { id: 'def5', image: '/discount_banner_2.png', title: 'Home Appliances' },
    { id: 'def6', image: '/discount_banner_3.png', title: 'Fashion Offer' },
  ];

  const displayPostersRaw = (posters && posters.length > 0) ? posters : defaultPosters;
  // Duplicate posters to ensure we have enough items to scroll (at least 6)
  const displayPosters = displayPostersRaw.length < 6 
    ? [...displayPostersRaw, ...displayPostersRaw, ...displayPostersRaw].slice(0, Math.max(6, displayPostersRaw.length * 2))
    : displayPostersRaw;

  useEffect(() => {
    if (displayPosters.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [displayPosters.length, isPaused]);

  const handleNext = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const itemWidth = scrollRef.current.children[0].clientWidth + 16; // width + gap
        scrollRef.current.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft <= 0) {
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        const itemWidth = scrollRef.current.children[0].clientWidth + 16;
        scrollRef.current.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const itemWidth = scrollRef.current.children[0].clientWidth + 16;
      const newIndex = Math.round(scrollPosition / itemWidth);
      setCurrentIndex(newIndex);
    }
  };

  return (
    <section 
      className="px-2 md:px-6 mx-auto max-w-7xl pt-8 pb-4 relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows */}
      {displayPosters.length > 3 && (
        <>
          <button 
            onClick={handlePrev} 
            className="absolute left-0 md:left-4 top-[40%] -translate-y-1/2 z-10 bg-white/95 shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:bg-white w-9 h-16 md:w-11 md:h-24 rounded-r-xl flex items-center justify-center border border-slate-100 transition-all opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button 
            onClick={handleNext} 
            className="absolute right-0 md:right-4 top-[40%] -translate-y-1/2 z-10 bg-white/95 shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:bg-white w-9 h-16 md:w-11 md:h-24 rounded-l-xl flex items-center justify-center border border-slate-100 transition-all opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-900"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </>
      )}

      {/* Slider Track */}
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 hide-scrollbar snap-x snap-mandatory pb-4 scroll-smooth"
      >
        {displayPosters.map((poster, index) => (
          <div 
            key={poster.id || index} 
            className="shrink-0 w-[280px] md:w-[420px] h-[160px] md:h-[220px] rounded-xl md:rounded-2xl overflow-hidden snap-start shadow-sm border border-slate-200/60 cursor-pointer relative"
          >
            <img 
              src={poster.image || poster.image_file} 
              alt={poster.title || 'Discount Poster'} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-1">
        {displayPosters.map((_, idx) => {
          // Hide dots for items that are visually at the end and can't be snapped to
          // If we show 3 items, the last 2 dots aren't really reachable cleanly without empty space
          return (
            <button
              key={idx}
              onClick={() => {
                if (scrollRef.current) {
                  const itemWidth = scrollRef.current.children[0].clientWidth + 16;
                  scrollRef.current.scrollTo({ left: itemWidth * idx, behavior: 'smooth' });
                  setCurrentIndex(idx);
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-slate-800' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </section>
  );
};
