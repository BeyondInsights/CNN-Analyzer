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
  // Custom webpack config to fix Firebase/undici compatibility issue
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configure TypeScript to show all errors
    config.stats = {
      errorDetails: true,
      errors: true,
      warnings: true,
      moduleTrace: true,
    };

    // More aggressive fix for Firebase/undici compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Completely exclude undici and problematic modules
      config.externals = config.externals || [];
      config.externals.push({
        'undici': 'undici',
        'firebase-admin': 'firebase-admin',
        '@firebase/functions': '@firebase/functions',
        'node:crypto': 'node:crypto',
        'node:fs': 'node:fs',
        'node:http': 'node:http',
        'node:https': 'node:https',
        'node:net': 'node:net',
        'node:path': 'node:path',
        'node:stream': 'node:stream',
        'node:url': 'node:url',
        'node:util': 'node:util',
        'node:zlib': 'node:zlib',
      });
      
      // Alias problematic modules to false
      config.resolve.alias = {
        ...config.resolve.alias,
        'undici': false,
        'node:crypto': false,
        'node:fs': false,
        'node:http': false,
        'node:https': false,
        'node:net': false,
        'node:path': false,
        'node:stream': false,
        'node:url': false,
        'node:util': false,
        'node:zlib': false,
      };
    }

    // Add rule for undici specifically
    config.module.rules.push({
      test: /node_modules\/undici/,
      use: 'null-loader',
    });
    
    return config;
  },
}

module.exports = nextConfig
