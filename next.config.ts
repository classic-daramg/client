import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kldd-images-bucket.s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
    // 정적 이미지 캐시 헤더
  headers: async () => [
    {
      source: "/icons/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=2592000, stale-while-revalidate=86400",
        },
      ],
    },
  ],
  // 로컬 개발 환경에서 API 프록시
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "https://classic-daramg.duckdns.org/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
