// agentConfig.ts - Embedded config for Vercel deployment
// This file replaces agent.yaml to ensure it's bundled with the build

export const agentConfig = {
  model: {
    provider: "openai",
    name: "gpt-5-nano",
    temperature: 1,
    max_completion_tokens: 2000,
    timeout: 120,
    fallback: {
      name: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 4000,
      timeout: 60,
    },
    retry_policy: {
      max_retries: 2,
      fallback_on_failure: true,
      fallback_triggers: ["rate_limit", "timeout", "api_error"],
    },
  },
} as const;

