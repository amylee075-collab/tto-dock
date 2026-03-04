/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // framer-motion vendor-chunk 누락 오류 방지 (번들 일관성)
  transpilePackages: ["framer-motion"],
};

export default nextConfig;
