"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface CompareSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt?: string;
  compact?: boolean;
}

export function CompareSlider({ beforeSrc, afterSrc, alt = "", compact = false }: CompareSliderProps) {
  return (
    <div className="relative">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt={`Before: ${alt}`}
            className={compact ? "object-cover w-full h-full" : "object-contain"}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt={`After: ${alt}`}
            className={compact ? "object-cover w-full h-full" : "object-contain"}
          />
        }
        className={compact ? "w-full aspect-square" : "w-full max-h-[600px] rounded-lg"}
      />
      <span className={`absolute ${compact ? "top-1.5 left-1.5" : "top-3 left-3"} bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded`}>
        Before
      </span>
      <span className={`absolute ${compact ? "top-1.5 right-1.5" : "top-3 right-3"} bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded`}>
        After
      </span>
    </div>
  );
}
