const withPWA = require('next-pwa')({
  dest: 'public',
  sw: 'serviceworker.js',
  register: false,
  runtimeCaching: require('./src/cache'),
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
      {
        protocol: 'https',
        hostname: 'viajarcomale.com.br',
        port: '',
        pathname: '/**',
      },
    ],
  }
});

module.exports = nextConfig
