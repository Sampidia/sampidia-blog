import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect old /blog page to homepage
      {
        source: '/blog',
        destination: '/',
        permanent: true, // 301 redirect
      },
      // Redirect old /category/general to homepage
      {
        source: '/category/general',
        destination: '/',
        permanent: true,
      },
      // Redirect all paginated /category/general/page/1, /page/2, etc.
      {
        source: '/category/general/page/:page*',
        destination: '/',
        permanent: true,
      },
      // Catch-all for any other /category/* paths
      {
        source: '/category/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.dropbox.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.imgur.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      {
        protocol: "https",
        hostname: "**.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
