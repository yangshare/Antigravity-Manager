import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  // 服务配置
  port: parseInt(process.env.PORT || '8046', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // 数据库配置
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../../data/antigravity.db'),

  // 安全配置
  apiKey: process.env.API_KEY || '',
  allowLanAccess: process.env.ALLOW_LAN_ACCESS === 'true',

  // OAuth 配置
  oauthRedirectPort: parseInt(process.env.OAUTH_REDIRECT_PORT || '8047', 10),

  // 日志配置
  logLevel: process.env.LOG_LEVEL || 'info',
} as const;

export type Config = typeof config;
