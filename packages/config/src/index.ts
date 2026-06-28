class ConfigError extends Error {
  constructor(key: string) {
    super(`Required environment variable "${key}" is not set. Set it in .env or export it before starting the server.`);
    this.name = 'ConfigError';
  }
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new ConfigError(key);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  get FRONTEND_URL() { return required('FRONTEND_URL'); },
  get BACKEND_URL() { return required('BACKEND_URL'); },
  get PORT() { return optional('PORT', '4000'); },
  get CORS_ORIGIN() { return required('CORS_ORIGIN'); },
  get JWT_SECRET() { return required('JWT_SECRET'); },
  get JWT_EXPIRATION() { return optional('JWT_EXPIRATION', '15m'); },
  get JWT_REFRESH_EXPIRATION() { return optional('JWT_REFRESH_EXPIRATION', '7d'); },
  get DATABASE_URL() { return required('DATABASE_URL'); },
  get AI_PROVIDER() { return optional('AI_PROVIDER', 'groq'); },
  get AI_API_KEY() { return optional('AI_API_KEY', ''); },
  get AI_MODEL() { return optional('AI_MODEL', 'llama-3.1-8b-instant'); },
  get GOOGLE_CLIENT_ID() { return optional('GOOGLE_CLIENT_ID', ''); },
  get GOOGLE_CLIENT_SECRET() { return optional('GOOGLE_CLIENT_SECRET', ''); },
  get GITHUB_CLIENT_ID() { return optional('GITHUB_CLIENT_ID', ''); },
  get GITHUB_CLIENT_SECRET() { return optional('GITHUB_CLIENT_SECRET', ''); },
  get REDIS_URL() { return optional('REDIS_URL', ''); },
  get SMTP_HOST() { return optional('SMTP_HOST', ''); },
  get SMTP_PORT() { return optional('SMTP_PORT', '587'); },
  get SMTP_USER() { return optional('SMTP_USER', ''); },
  get SMTP_PASS() { return optional('SMTP_PASS', ''); },
  get STRIPE_SECRET_KEY() { return optional('STRIPE_SECRET_KEY', ''); },
  get STORAGE_BUCKET() { return optional('STORAGE_BUCKET', ''); },
  get STORAGE_REGION() { return optional('STORAGE_REGION', ''); },
  get STORAGE_ACCESS_KEY() { return optional('STORAGE_ACCESS_KEY', ''); },
  get STORAGE_SECRET_KEY() { return optional('STORAGE_SECRET_KEY', ''); },
  get SENTRY_DSN() { return optional('SENTRY_DSN', ''); },
  get NODE_ENV() { return optional('NODE_ENV', 'development'); },
};
