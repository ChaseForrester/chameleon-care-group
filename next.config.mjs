/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
};

export default nextConfig;
