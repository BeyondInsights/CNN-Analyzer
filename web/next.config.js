/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Show all TypeScript errors but don't fail build immediately
    ignoreBuildErrors: false,
  },
  eslint: {
    // Show all ESLint errors but don't fail build immediately
    ignoreDuringBuilds: false,
  },
  // Better error reporting
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Add experimental features for better error handling
  experimental: {
    // Better error overlay
    forceSwcTransforms: false,
  },
  // Custom webpack config to show all errors
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configure TypeScript to show all errors
    config.stats = {
      errorDetails: true,
      errors: true,
      warnings: true,
      moduleTrace: true,
    };
    
    return config;
  },
}

module.exports = nextConfig
