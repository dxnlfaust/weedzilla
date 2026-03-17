import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Winners",
  description: "Weekly Weed of the Week and B&A of the Week winners on WeedZilla",
};

export default function WinnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
