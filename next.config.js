/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      extensions: [...config.resolve?.extensions, ".ts", ".tsx", ".js", ".css"],
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        net: false,
        tls: false,
      },
    };

    return config;
  },
};

module.exports = nextConfig;
