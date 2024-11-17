// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      appDir: true, // Ensure this is enabled
    },
    images: {
      domains: ['example.com'], // Add your image domains here
    },
  }
  
  module.exports = nextConfig
  