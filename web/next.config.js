/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@firebase/firestore']
  },
  // Temporarily show full errors
  productionBrowserSourceMaps: true,
  reactStrictMode: false
}

module.exports = nextConfig
