import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  redisUrl : string;
  sessionSecret: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: number;
  appPassword: string;
  appEmail: string;
  appUrl: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl : process.env.REDIS_URL || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: Number(process.env.REFRESH_TOKEN_EXPIRY_SECONDS) || 2592000,
  appPassword: process.env.APP_PASSWORD || '',
  appEmail: process.env.APP_EMAIL || '',
  appUrl: process.env.APP_URL || '',
};

export default config;