import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "setup.js")],
    coverage: {
      provider: "v8",
      reportsDirectory: resolve(__dirname, "coverage"),
      reporter: ["text", "json", "html"],
    },
  },
});
