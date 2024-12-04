import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { rollupImportMapPlugin } from "rollup-plugin-import-map";
import { terser } from "rollup-plugin-terser";
import { ConfigEnv } from "vite";
import viteCompression from "vite-plugin-compression";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import EnvironmentPlugin from "vite-plugin-environment";
import { viteMockServe } from "vite-plugin-mock";
import { UserConfigExport } from "vitest/config";

const imports = {
  react: "https://www.nav.no/tms-min-side-assets/react/18/esm/index.js",
  "react-dom": "https://www.nav.no/tms-min-side-assets/react/18/esm/index.js",
};

export default ({ command }: ConfigEnv): UserConfigExport => ({
  plugins: [
    react(),
    terser(),
    cssInjectedByJsPlugin(),
    viteCompression({
      algorithm: "gzip",
    }),
    viteCompression({
      algorithm: "brotliCompress",
    }),
    viteMockServe({
      mockPath: "mock",
      localEnabled: command === "serve",
    }),
    {
      ...rollupImportMapPlugin([{ imports }]),
      enforce: "pre",
      apply: "build",
    },
    EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV || "development",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/Mikrofrontend.tsx"),
      name: "meldekort-mikrofrontend",
      formats: ["es"],
      fileName: () => `meldekort-mikrofrontend.js`,
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    deps: {
      inline: ["@testing-library/user-event"],
    },
  },
});
