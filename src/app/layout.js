import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileCta from "@/components/MobileCta";
import { AuthProvider } from "@/context/AuthContext";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
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
    images: [{ url: "/images/logo-mark.png", width: 1024, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chameleon Care Group",
    description: "Personalised NDIS support and nursing care across NSW.",
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
  verification: {
    // Add your Google Search Console verification code when available:
    // google: "your-verification-code",
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
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <MobileCta />
        </AuthProvider>
      </body>
    </html>
  );
}
