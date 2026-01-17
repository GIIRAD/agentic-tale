import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import { NextConfig } from "next";

import { version } from "./package.json";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    dirs: ["."],
  },
  experimental: {
    optimizePackageImports: ["flowbite-react", "react-icons", "lodash"],
    serverActions: {
      // bodySizeLimit: "5mb",
    },
  },
  env: {
    APP_VERSION: version,
  },
  // Add Azure Application Insights packages to the list of externals.
  webpack: (config, { isServer }) => {
    if (isServer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      config.externals = [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        ...(config.externals || []),
        "@azure/functions-core",
        "@opentelemetry/sdk-node",
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config;
  },
};

export default withFlowbiteReact(nextConfig);
