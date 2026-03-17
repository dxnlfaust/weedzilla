"use client";

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface CompareSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt?: string;
}

export function CompareSlider({ beforeSrc, afterSrc, alt = "" }: CompareSliderProps) {
  return (
    <div className="relative">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt={`Before: ${alt}`}
            className="object-contain"
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt={`After: ${alt}`}
            className="object-contain"
          />
        }
        className="w-full max-h-[600px] rounded-lg"
      />
      {/* Before / After labels */}
      <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded">
        Before
      </span>
      <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded">
        After
      </span>
    </div>
  );
}
