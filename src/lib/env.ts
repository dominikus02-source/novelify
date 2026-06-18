const REQUIRED_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
] as const;

const OPTIONAL_VARS = [
  'OPENAI_API_KEY',
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_STORE_ID',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'RESEND_API_KEY',
  'BLOB_READ_WRITE_TOKEN',
] as const;

export function validateEnv(): { ok: boolean; missing: string[] } {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  return { ok: missing.length === 0, missing };
}

export function getEnv(key: (typeof REQUIRED_VARS)[number] | (typeof OPTIONAL_VARS)[number]): string {
  return process.env[key] || '';
}

if (typeof window === 'undefined') {
  const { ok, missing } = validateEnv();
  if (!ok) {
    console.warn(`[env] Missing required variables: ${missing.join(', ')}`);
  }
}
