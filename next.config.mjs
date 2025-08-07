/** @type {import('next').NextConfig} */
const nextConfig = {
  // Konfigurasi yang lebih aman untuk ESLint dan TypeScript
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production' && process.env.IGNORE_ESLINT === 'true',
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production' && process.env.IGNORE_TYPESCRIPT === 'true',
  },
  
  // Optimasi Images
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Optimasi Experimental Features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      'recharts',
      'date-fns',
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Optimasi Webpack
  webpack: (config, { dev, isServer }) => {
    // Optimasi untuk production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 10,
          },
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 10,
          },
        },
      }
    }
    
    return config
  },
  
  // Optimasi Compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimasi Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
  
  // Security
  poweredByHeader: false,
  
  // Optimasi Output
  output: 'standalone',
  
  // Optimasi Trailing Slash
  trailingSlash: false,
}

export default nextConfig
