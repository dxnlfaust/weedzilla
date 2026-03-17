"use client";

import NextTopLoader from "nextjs-toploader";

export function ProgressBar() {
  return (
    <NextTopLoader
      color="#2D6A4F"
      height={3}
      showSpinner={false}
    />
  );
}
