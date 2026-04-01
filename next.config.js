/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
  // EdgeOne 部署配置
  trailingSlash: true,
  basePath: '',
  assetPrefix: '',
  // 静态导出配置
  output: 'export',
};

module.exports = nextConfig;
