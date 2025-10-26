// utils/constants.ts
export const CLEANUP_CONFIG = {
  EXPIRED_INTERVAL: 60 * 60 * 1000,      // 1 hour
  IDLE_INTERVAL: 5 * 60 * 1000,          // 5 minutes
  STOPPED_INTERVAL: 60 * 60 * 1000,      // 1 hour
  IDLE_TIMEOUT: 10 * 60 * 1000,          // 10 minutes
  STOPPED_TIMEOUT: 2 * 60 * 60 * 1000,   // 2 hours
  MAX_AGE: 24 * 60 * 60 * 1000,          // 24 hours
  IDLE_CLEANUP_COOLDOWN: 4 * 60 * 1000,  // 4 minutes
} as const

export const SANDBOX_CONFIG = {
  DEFAULT_PORT: 5173,
  MAX_READY_ATTEMPTS: 20,
  READY_DELAY_MS: 2000,
  START_DELAY_MS: 3000,
  EXPIRES_HOURS: 24,
} as const

export const RESPONSE_HEADERS = {
  CORS: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'X-Daytona-Skip-Preview-Warning': 'true',
  }
} as const

export const SESSION_IDS = {
  FILE_SESSION: 'file-session',
  UPDATE_SESSION: 'update-session',
  PKG_FIX: 'pkg-fix',
  INSTALL: 'install',
  DEV: 'dev',
  PROBE: 'probe',
} as const

export const COMMANDS = {
  NPM_INSTALL: 'npm install',
  NPM_RUN_DEV: 'bash -lc "cd . && npm run dev -- --host 0.0.0.0 --port 5173"',
  NPM_BUILD: 'npm run build',
  INSTALL_REACT_PLUGIN: 'npm i -D @vitejs/plugin-react || true',
  REMOVE_OLD_REACT_PLUGIN: 'npm rm vite-plugin-react || true',
  CHECK_PORT: 'ss -lntp | grep :5173 || netstat -tlnp | grep :5173 || echo "noport"',
  CHECK_HTTP: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 || echo "curlfail"',
  CHECK_DEV_RUNNING: 'ps aux | grep "npm run dev" | grep -v grep || echo "notrunning"',
  CHECK_VITE_RUNNING: 'ps aux | grep "vite" | grep -v grep || echo "novite"',
  CHECK_PACKAGE_JSON: 'test -f package.json && echo "haspackage" || echo "nopackage"',
  CHECK_DEV_SCRIPT: 'grep -q \'"dev"\' package.json && echo "hasdev" || echo "nodev"',
  CHECK_REACT: 'cat package.json | grep -q "react" && echo "hasreact" || echo "noreact"',
  SHOW_TREE: 'find . -maxdepth 3 -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.html" -o -name "*.css" \\) | sed -n "1,50p"',
} as const
