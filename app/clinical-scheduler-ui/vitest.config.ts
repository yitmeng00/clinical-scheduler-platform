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
        // Test infrastructure
        "src/test/**",
        // App entry points / wiring (no logic to assert on)
        "src/main.tsx",
        "src/app/router.tsx",
        "src/app/store.ts",
        "src/App.tsx",
        // Pure type definitions
        "src/types/**",
        // Static constant data — no branches to cover
        "src/constants/**",
        // SignalR — requires a live hub; too coupled to network I/O for unit tests
        "src/signalr/**",
        // Build output and E2E helpers
        "dist/**",
        "e2e/**",
        // Config files in the project root
        "*.config.{js,ts}",
        // TypeScript declaration files
        "**/*.d.ts",
      ],
    },
  },
});
