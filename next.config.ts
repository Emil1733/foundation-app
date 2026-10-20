import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep build configuration portable. Vercel/Next resolves the project root
  // from the deployment workspace, so a developer-machine path must not be
  // committed here.
  async redirects() {
    return [
      // Verified historical Allen URL. Keep this exact mapping ahead of the
      // older ZIP-pattern rule; do not guess destinations for other cities.
      {
        source: '/services/foundation-repair/allen-tx-75002',
        destination: '/services/foundation-repair/allen-tx',
        permanent: true,
      },
      {
        source: '/services/foundation-repair/:city([\\w-]+)-\\d{5}',
        destination: '/services/foundation-repair/:city',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.supabase.co https://*.foundationrisk.org https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com; connect-src 'self' https://*.supabase.co https://*.foundationrisk.org https://maps.googleapis.com; frame-ancestors 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
