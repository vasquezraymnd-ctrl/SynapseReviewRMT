
// This file configures OpenNext for Cloudflare Pages.

const config = {
  default: {
    override: {
      // This tells the build system to treat these packages as external.
      // It is the definitive fix for the 'Could not resolve "jose"' error.
      esbuild: {
        external: ["jose", "jwks-rsa"],
      },
    },
  },
};

export default config;
