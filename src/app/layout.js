import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCta from "@/components/MobileCta";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
  weight: ["500", "600", "700"],
  adjustFontFallback: true,
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default:
      "Chameleon Care Group | Personalised NDIS Support in Sutherland Shire",
    template: "%s | Chameleon Care Group",
  },
  description:
    "Personalised NDIS, aged care and private nursing across Sutherland Shire, Illawarra, Central Coast and Greater Sydney. Care that adapts to you.",
  keywords: [
    "NDIS Sutherland Shire",
    "NDIS Cronulla",
    "NDIS Miranda",
    "home nursing Sydney",
    "disability support Illawarra",
    "NDIS Gosford",
    "continence assessment",
    "aged care Sutherland",
    "Chameleon Care Group",
  ],
  authors: [{ name: "Chameleon Care Group" }],
  openGraph: {
    title: "Chameleon Care Group",
    description:
      "Providing support, delivering care that adapts to you. NDIS, aged care & private nursing.",
    locale: "en_AU",
    type: "website",
    siteName: "Chameleon Care Group",
    images: [
      {
        url: "/images/about-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Chameleon Care Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chameleon Care Group",
    description: "Personalised NDIS support and nursing care across NSW.",
    images: ["/images/about-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a2a3d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <MobileCta />
      </body>
    </html>
  );
}
