/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tkzsjgtxkvfdvjcqnydr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // framer-motion vendor-chunk 누락 오류 방지 (번들 일관성)
  transpilePackages: ["framer-motion"],
};

export default nextConfig;
