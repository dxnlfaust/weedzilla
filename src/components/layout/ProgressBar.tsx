"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function ProgressBar() {
  return (
    <AppProgressBar
      height="3px"
      color="#2D6A4F"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
