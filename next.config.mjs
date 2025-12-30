/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/awsodclearning/:path*',
        destination: 'http://localhost:8080/awsodclearning/:path*',
      },
    ]
  },
}

export default nextConfig
