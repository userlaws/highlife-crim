import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The Neon CLI keeps NEON_FUNCTION_API_BASE_URL fresh in .env.local on every
  // `neon deploy`; re-export it so the browser bundle sees one source of truth.
  env: {
    NEXT_PUBLIC_NEON_API_URL: process.env.NEON_FUNCTION_API_BASE_URL ?? '',
  },
};

export default nextConfig;
