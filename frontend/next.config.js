/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    turbopack: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  watchOptions: {
    ignored: [
      '**/node_modules',
      '**/.git',
      '**/Library/**',
      '**/Library/Containers/**',
      '**/Library/Application Support/**',
      '**/tmp/**',
    ],
  },
};

module.exports = nextConfig;