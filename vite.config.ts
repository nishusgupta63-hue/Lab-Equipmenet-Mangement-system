import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      host: "localhost",
    },
  },

  tanstackStart: {
    server: { entry: "server" },
  },
});