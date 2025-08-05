/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip linting during build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
