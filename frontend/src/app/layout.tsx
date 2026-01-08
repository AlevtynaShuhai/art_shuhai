import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import Analytics from "@/components/Analytics";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Art Classes with Alevtyna | Calgary Art Workshops",
  description: "Join creative art classes and workshops in Calgary. Learn painting, drawing, and more with professional instruction. All materials included.",
  keywords: ["art classes Calgary", "painting workshops", "drawing classes", "art lessons", "creative workshops"],
  authors: [{ name: "Alevtyna" }],
  openGraph: {
    title: "Art Classes with Alevtyna",
    description: "Join creative art classes and workshops in Calgary",
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Classes with Alevtyna",
    description: "Join creative art classes and workshops in Calgary",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
