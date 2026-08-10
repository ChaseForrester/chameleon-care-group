import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

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
  title: {
    default:
      "Chameleon Care Group | Personalised NDIS Support in Sutherland Shire",
    template: "%s | Chameleon Care Group",
  },
  description:
    "Personalised NDIS, aged care and private nursing support across Sutherland Shire, Illawarra, Central Coast and Sydney. Care that adapts to you.",
  keywords: [
    "NDIS",
    "Sutherland Shire",
    "nursing care",
    "disability support",
    "continence assessment",
    "aged care",
    "home care Sydney",
  ],
  openGraph: {
    title: "Chameleon Care Group",
    description:
      "Providing support, delivering care that adapts to you. NDIS, aged care & private nursing.",
    locale: "en_AU",
    type: "website",
  },
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
        </AuthProvider>
      </body>
    </html>
  );
}
