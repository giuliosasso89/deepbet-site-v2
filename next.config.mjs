/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { typedRoutes: true, optimizePackageImports: ['recharts','lucide-react'] },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  }
};
export default nextConfig;
