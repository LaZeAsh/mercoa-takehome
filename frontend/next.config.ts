import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    MERCOA_KEY: process.env.MERCOA_KEY,
    MERCOA_ORG_ID: process.env.MERCOA_ORG_ID
  },
};

export default nextConfig;
