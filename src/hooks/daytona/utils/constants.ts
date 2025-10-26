// utils/constants.ts
import { HeartbeatConfig, CacheConfig, DebounceConfig } from '../types/preview'

export const HEARTBEAT_CONFIG: HeartbeatConfig = {
  interval: 2 * 60 * 1000, // 2 minutes
  timeout: 30 * 1000, // 30 seconds
}

export const CACHE_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}

export const DEBOUNCE_CONFIG: DebounceConfig = {
  delay: 1000, // 1 second
}

export const API_ENDPOINTS = {
  CREATE: '/api/preview/daytona',
  STATUS: (sandboxId: string) => `/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`,
  UPDATE: (sandboxId: string) => `/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`,
  DELETE: (sandboxId: string) => `/api/preview/daytona?sandboxId=${encodeURIComponent(sandboxId)}`,
} as const

export const CACHE_KEYS = {
  PREVIEW_CACHE: (projectId: string) => `preview-cache-${projectId}`,
} as const

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
} as const

