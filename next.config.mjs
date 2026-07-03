/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/HIREFLOW-DASHBOARD',
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
