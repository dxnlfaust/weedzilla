import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { WinNotifier } from "@/components/layout/WinNotifier";
import { ServiceWorkerRegistrar } from "@/components/layout/ServiceWorkerRegistrar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://weedzilla.app"),
  title: {
    default: "WeedZilla",
    template: "%s | WeedZilla",
  },
  description:
    "Share your weed removal wins and compete in weekly voting competitions!",
  manifest: "/manifest.json",
  icons: [
    { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WeedZilla",
  },
  openGraph: {
    siteName: "WeedZilla",
    type: "website",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#1B4332",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-20 pb-20 md:pb-6">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <ProgressBar />
        <WinNotifier />
        <ServiceWorkerRegistrar />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
