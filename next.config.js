/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Silence Turbopack/webpack conflict warning in Next.js 16+
  turbopack: {},
  webpack: (config) => {
    // Silence known false-positive "module not found" warnings from
    // @metamask/sdk (React Native storage) and WalletConnect (pino-pretty)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

module.exports = nextConfig;
