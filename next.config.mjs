/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.algonode.xyz",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
