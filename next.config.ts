import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Production build optimization
  reactStrictMode: true,
  
  // IMPORTANT: Fix these in production
  typescript: {
    // TODO: Set to false once all TypeScript errors are resolved
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // TODO: Set to false once all ESLint errors are resolved
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Compression
  compress: true,
  
  // Output optimization for Docker and Static Export
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : process.env.NEXT_PUBLIC_BUILD_MODE === 'export' ? 'export' : undefined,
  
  // Image optimization (disable for static export)
  images: process.env.NEXT_PUBLIC_BUILD_MODE === 'export' ? {
    unoptimized: true,
  } : {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
  
  // Development origins
  allowedDevOrigins: [
    'https://6000-firebase-studio-1758944682678.cluster-wurh6gchdjcjmwrw2tqtufvhss.cloudworkstations.dev',
  ],
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Loni Panchayat',
  },
};

export default nextConfig;
