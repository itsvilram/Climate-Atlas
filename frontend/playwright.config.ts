import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default defineConfig({
  testDir: './browser-tests', workers: 1, retries: 0, timeout: 60_000,
  outputDir: join(tmpdir(), 'climate-hazard-verification', 'browser-results'),
  reporter: [['list'], ['html', { open: 'never', outputFolder: join(tmpdir(), 'climate-hazard-verification', 'browser-report') }]],
  use: { baseURL: 'http://127.0.0.1:5180', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run build && npm run preview -- --port 5180 --strictPort', url: 'http://127.0.0.1:5180', reuseExistingServer: false,
      env: { VITE_API_BASE_URL: 'http://127.0.0.1:8001' } },
    { command: `${process.platform === 'win32' ? '..\\backend\\.venv\\Scripts\\python.exe' : '../backend/.venv/bin/python'} -m uvicorn app.main:app --app-dir ../backend --host 127.0.0.1 --port 8001 --no-proxy-headers --no-access-log`,
      url: 'http://127.0.0.1:8001/api/v1/health', timeout: 30_000, reuseExistingServer: false,
      env: { ALLOWED_ORIGINS: '["http://127.0.0.1:5180"]' } },
  ],
})
