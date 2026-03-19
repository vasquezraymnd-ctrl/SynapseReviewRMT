
import { type OpenNextConfig } from "opennext/dist/open-next";

const config: OpenNextConfig = {
  default: {
    override: {
      esbuild: {
        external: ["jose", "jwks-rsa"],
      },
    },
  },
};

export default config;
