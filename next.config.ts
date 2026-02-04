import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Use modern JavaScript for faster performance
  experimental: {
    optimizePackageImports: ['@/src/presentation/components', '@/src/domain/entities'],
  },

  // Production optimizations
  reactStrictMode: true,
  
  // Production URL configuration
  productionBrowserSourceMaps: false,
  
  // Compress responses
  compress: true,
  
  // Optimize images
  images: {
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
