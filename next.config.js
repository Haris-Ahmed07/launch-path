/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdf-parse": require.resolve("pdf-parse")
    };
    return config;
  }
};

module.exports = nextConfig;