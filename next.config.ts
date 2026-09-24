import type { NextConfig } from 'next';

// Public URL of the Neon Function that serves the leaderboard. `neon link`
// writes NEON_FUNCTION_API_BASE_URL into .env.local for local work; the default
// keeps deployments working without extra configuration. Not a secret — the
// browser calls this endpoint directly.
const leaderboardApi =
  process.env.NEON_FUNCTION_API_BASE_URL ??
  'https://br-long-unit-b524nn9i-api.compute.c-7.us-east-2.aws.neon.tech';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_NEON_API_URL: leaderboardApi,
  },
};

export default nextConfig;
