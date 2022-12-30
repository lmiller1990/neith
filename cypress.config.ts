import { defineConfig } from "cypress";
import { startServer, stopServer } from "./cypress/tasks/server.js";
import { scaffoldDatabase } from "./cypress/tasks/resetdb.js";
import viteConfig from "./src/frontend/vite.config";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4444",
    async setupNodeEvents(on, config) {
      await startServer();

      on("task", {
        startServer,
        stopServer,
        scaffoldDatabase,
      });
    },
  },

  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
      viteConfig,
    },
  },
});
