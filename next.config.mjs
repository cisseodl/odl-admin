/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Rewrites uniquement en développement local
  // En production, les appels API se font directement vers https://api.smart-odc.com
  async rewrites() {
    // Ne pas utiliser de rewrites en production
    if (process.env.NODE_ENV === 'production') {
      return []
    }
    // En développement local uniquement
    return [
      {
        source: '/awsodclearning/:path*',
        destination: 'http://localhost:8080/awsodclearning/:path*',
      },
    ]
  },
}

export default nextConfig
