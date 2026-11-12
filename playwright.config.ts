import { defineConfig, devices } from '@playwright/test';

// Por padrão testa o site já buildado (npm run build antes), servido pelo astro preview.
// Com BASE_URL definido (ex.: a URL de produção), testa o site no ar e não sobe servidor.
const PORT = 4329;
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: BASE_URL
    ? undefined
    : {
        command: `npm run preview -- --port ${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
