/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  externals: { 'agora-electron-sdk': 'commonjs2 agora-electron-sdk' }
}

module.exports = nextConfig
