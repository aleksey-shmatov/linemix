import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@linemix/model'],
  cacheComponents: true,
};

export default nextConfig;
