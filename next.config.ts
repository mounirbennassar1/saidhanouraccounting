import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Optimize for Vercel Edge Functions - exclude heavy Node.js packages from middleware
  serverExternalPackages: ['@prisma/client', 'prisma', 'bcryptjs'],
};

export default nextConfig;
