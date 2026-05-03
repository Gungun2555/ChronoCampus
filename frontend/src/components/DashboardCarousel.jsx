import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DashboardCarousel({ slides, autoPlay = true, interval = 3500, className = "" }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const timerRef = useRef(null);

  const stopTimer = () => clearInterval(timerRef.current);
  const startTimer = useCallback(() => {
    if (!autoPlay) return;
    stopTimer();
    timerRef.current = setInterval(() => {
      emblaApi?.scrollNext();
    }, interval);
  }, [emblaApi, autoPlay, interval]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    startTimer();
    return () => stopTimer();
  }, [emblaApi, startTimer]);

  const scrollTo = (i) => { emblaApi?.scrollTo(i); startTimer(); };
  const scrollPrev = () => { emblaApi?.scrollPrev(); startTimer(); };
  const scrollNext = () => { emblaApi?.scrollNext(); startTimer(); };

  return (
    <div className={`relative group ${className}`}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}>
      {/* Viewport */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div key={i} className="flex-none w-full min-w-0">
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next arrows — show on hover */}
      {slides.length > 1 && (
        <>
          <button onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {scrollSnaps.map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? "w-4 h-1.5 bg-orange-500"
                  : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600"
              }`} />
          ))}
        </div>
      )}
    </div>
  );
}
