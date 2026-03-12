import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WeedZilla",
  description:
    "Share your weed removal wins and compete in weekly voting competitions!",
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
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
