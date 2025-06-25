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
  // Custom webpack config to show all errors and fix Firebase/undici issue
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configure TypeScript to show all errors
    config.stats = {
      errorDetails: true,
      errors: true,
      warnings: true,
      moduleTrace: true,
    };

    // Fix Firebase/undici compatibility issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Handle undici module parsing issues more aggressively
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/undici/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Exclude problematic Firebase modules from client bundle
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'firebase-admin',
        'undici': 'undici',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig
