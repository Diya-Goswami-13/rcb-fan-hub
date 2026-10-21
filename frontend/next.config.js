/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // small hardening / smaller response headers
  compress: true,
};
module.exports = nextConfig;
