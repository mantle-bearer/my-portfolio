import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:8000"
  },
  webServer: {
    command:
      "bash -lc 'if command -v python >/dev/null 2>&1; then python -m uv run uvicorn app.main:app --host 127.0.0.1 --port 8000; elif command -v python3 >/dev/null 2>&1 && python3 -m uv --version >/dev/null 2>&1; then python3 -m uv run uvicorn app.main:app --host 127.0.0.1 --port 8000; else ~/.local/bin/uv run uvicorn app.main:app --host 127.0.0.1 --port 8000; fi'",
    url: "http://127.0.0.1:8000/api/v1/health",
    reuseExistingServer: true,
    cwd: "..",
    env: {
      ENVIRONMENT: "test",
      DATABASE_URL: "sqlite:///./test-e2e.db",
      REDIS_URL: "",
      JWT_SECRET: "test-secret-with-at-least-32-bytes"
    }
  }
});
