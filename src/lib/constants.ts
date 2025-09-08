export const WEBHOOK_CONFIG = {
  // Use Next.js API route as proxy to avoid CORS issues
  DEFAULT_URL: '/api/webhook',
  EXTERNAL_URL: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:3001/webhook',
  SECRET: process.env.NEXT_PUBLIC_SECRET || '',
  TIMEOUT: 120000, // 120 seconds
  RETRIES: 3,
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGES: 100,
  TYPING_DELAY: 1000,
} as const;

export const POST_CONFIG = {
  MAX_LENGTH: 3000, // LinkedIn character limit
  HASHTAG_LIMIT: 30,
} as const;
