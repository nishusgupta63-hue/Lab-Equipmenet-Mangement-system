import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      host: "localhost",
    },
  },

  nitro: {
    preset: "node-server",
  },

  tanstackStart: {
    server: { entry: "server" },
  },
});