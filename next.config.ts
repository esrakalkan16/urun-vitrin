import type { NextConfig } from "next";

// Tüm sayfalara eklenen güvenlik başlıkları
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' }, // başka sitede çerçeve içinde açılamaz (clickjacking)
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Yalnızca `next dev` için: telefondan / aynı ağdaki başka cihazdan (ör. 10.x.x.x:3000) açınca
  // geliştirme dosyaları 403 ile engellenmesin. Canlı siteyi etkilemez.
  allowedDevOrigins: ['10.*.*.*', '192.168.*.*', '172.*.*.*'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Yönetim sayfaları arama motorlarında görünmesin
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};


export default nextConfig;
