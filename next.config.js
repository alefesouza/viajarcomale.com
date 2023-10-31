const withPWA = require('next-pwa')({
  dest: 'public',
  sw: 'serviceworker.js',
  register: false,
})

/** @type {import('next').NextConfig} */
const nextConfig =  withPWA({
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'viajarcomale.com',
        port: '',
        pathname: '/**',
      },
    ],
  }
});

module.exports = nextConfig
