import { defineConfig } from "vitest/config";

// No React plugin needed — esbuild handles TSX natively.
// `jsx: "automatic"` uses react/jsx-runtime so components don't need to import React.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "src/test/**",
        "src/main.tsx",
        "src/app/router.tsx",
        "**/*.d.ts",
      ],
    },
  },
});
