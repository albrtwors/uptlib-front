import { api } from "@/consts/api";
import type { NextConfig } from "next";

// https://uptalib-back-porsi.vercel.app/:path*s

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${api.base_url}/:path*`,
      },
    ];
  },
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

};

export default nextConfig;
