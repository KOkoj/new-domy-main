const nextConfig = {
  // Removed 'output: standalone' for Vercel deployment
  // Vercel handles builds automatically
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io',       pathname: '**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '**' },
      { protocol: 'https', hostname: 'pwm.im-cdn.it',       pathname: '**' },
      { protocol: 'https', hostname: 'img4.idealista.it',   pathname: '**' },
      { protocol: 'https', hostname: '**.supabase.co',      pathname: '/storage/v1/object/public/**' },
    ],
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self';" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/regions',
        destination: '/regions',
        permanent: true,
      },
    ];
  }
};
module.exports = nextConfig;


