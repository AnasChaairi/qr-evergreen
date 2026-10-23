import { defineConfig } from "@playwright/test";

const PORT = 3123;

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: `http://localhost:${PORT}`, acceptDownloads: true },
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
