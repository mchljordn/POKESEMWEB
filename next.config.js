/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Environment variables
  env: {
    FUSEKI_URL: process.env.FUSEKI_URL || 'http://localhost:3030/pokemon/query',
    FUSEKI_DATASET: process.env.FUSEKI_DATASET || 'pokemon',
  },
};

export default nextConfig;
