import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'udpad-secure-citizen-jwt-secret-key-2026');

if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is mandatory in production.');
}

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: jwtSecret || 'udpad-secure-citizen-jwt-secret-key-2026',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  databaseUrl: process.env.DATABASE_URL || ''
};
