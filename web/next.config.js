/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@firebase/firestore']
  },
  // Temporarily show errors in production for debugging
  productionBrowserSourceMaps: true,
  env: {
    SHOW_ERRORS: 'true'
  }
}

module.exports = nextConfig
