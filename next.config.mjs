/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "chameleon-care-group-au.firebasestorage.app",
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Do NOT add optimizePackageImports for "firebase" — it breaks service
  // registration and causes "Service firestore is not available" at runtime.
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/book", destination: "/book-with-us", permanent: true },
      { source: "/book-with-us.html", destination: "/book-with-us", permanent: true },
      { source: "/about-us.html", destination: "/about-us", permanent: true },
      { source: "/contact-us.html", destination: "/contact-us", permanent: true },
      { source: "/referral.html", destination: "/referral", permanent: true },
      { source: "/laws.html", destination: "/laws", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/pdfs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
