"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prev = () => setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleDragEnd = (event: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      next();
    } else if (info.offset.x > swipeThreshold) {
      prev();
    }
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start select-none">
      {/* Thumbnail Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:flex-col md:overflow-x-visible md:pb-0 md:w-20 lg:w-24 shrink-0">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`relative aspect-square w-16 md:w-full overflow-hidden rounded-xl border bg-surface transition-all shrink-0 cursor-pointer ${
              index === i 
                ? "border-primary ring-2 ring-primary/20 scale-95" 
                : "border-accent/10 hover:border-accent/30"
            }`}
          >
            <Image src={img} alt={`${title} Thumbnail ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image Screen */}
      <div ref={containerRef} className="relative aspect-square w-full overflow-hidden rounded-3xl border border-accent/10 bg-surface shadow-sm">
        <motion.div
          className="flex h-full w-full cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative h-full w-full shrink-0"
            >
              <Image
                src={images[index]}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover pointer-events-none"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Nav Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 shadow-md border border-accent/10 hover:bg-surface hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-surface/95 shadow-md border border-accent/10 hover:bg-surface hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </>
        )}

        {/* Index Dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-foreground/10 px-3 py-1.5 backdrop-blur-md">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === i ? "w-4 bg-primary" : "w-1.5 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
