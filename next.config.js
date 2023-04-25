/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    APP_ID: process.env.APP_ID,
    WHITEBOARD_SDK_TOKEN: process.env.WHITEBOARD_SDK_TOKEN,
    APP_IDENTIFIRE: process.env.APP_IDENTIFIRE,
    REGION: process.env.REGION,
  },
};

module.exports = nextConfig;
