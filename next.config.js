const nextConfig = {
  // Removed 'output: standalone' for Vercel deployment
  // Vercel handles builds automatically

  // A stray lockfile in the user's home directory otherwise makes Next
  // infer the wrong workspace root.
  outputFileTracingRoot: __dirname,

  // NFT follows process.cwd()-based fs reads (e.g. localPropertiesStore) and
  // can pull import source media into every serverless function. data/import
  // alone is ~270MB of listing images/videos that must never ship in the
  // function bundle — only data/local-properties.json is needed at runtime.
  outputFileTracingExcludes: {
    '/*': [
      './data/import/**/*',
      './scripts/**/*',
      './docs/**/*',
      './**/*.mp4',
      './public/uploads/properties/**/*.mp4',
    ],
  },

  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io',       pathname: '**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '**' },
      // Idealista and im-cdn.it both shard images across multiple
      // subdomains (img1..imgN, pwm/etc). Whitelist all of them so every
      // image variant resolves through the next/image optimizer.
      { protocol: 'https', hostname: '**.im-cdn.it',        pathname: '**' },
      { protocol: 'https', hostname: '**.idealista.it',     pathname: '**' },
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


