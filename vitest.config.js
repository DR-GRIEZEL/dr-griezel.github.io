import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.js"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["test/**/*.js"],
      exclude: ["test/**/*.test.js"]
    }
  }
});
