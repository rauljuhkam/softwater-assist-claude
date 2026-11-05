export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_CUSTOM_PERSONAS = 100;
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
] as const;

export const DROPLET_TIP_INTERVAL_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export const MODEL_OPTIONS = [
  { value: "GPT4", label: "GPT-4 (simulated)" },
  { value: "CLAUDE", label: "Claude (simulated)" },
  { value: "LOCAL_LLAMA", label: "Local Llama (simulated)" },
] as const;

export const SIMULATED_REPLY_DELAY_MS = 1500;
