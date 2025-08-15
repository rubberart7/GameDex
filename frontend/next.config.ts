import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        port: '',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'www.cheapshark.com',
        port: '',
        pathname: '/img/stores/**',
      },
      {
        protocol: 'https',
        hostname: 'shared.fastly.steamstatic.com',
        port: '',
        pathname: '/store_item_assets/**',
      },
      {
        protocol: 'https',
        hostname: 'hb.imgix.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.wingamestore.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.greenmangaming.com', // added new one
        port: '',
        pathname: '/**',
      },
      
      {
        protocol: 'https',
        hostname: '**', // allow any HTTPS hostname
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
