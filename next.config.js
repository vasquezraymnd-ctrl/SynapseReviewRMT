/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '50mb', // Increase the body size limit to 50MB
  },
};

module.exports = nextConfig;
