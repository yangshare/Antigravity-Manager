// 账号相关类型
export interface Account {
  id: string;
  email: string;
  name?: string;
  token: TokenData;
  quota?: QuotaData;
  disabled?: boolean;
  disabled_reason?: string;
  disabled_at?: number;
  proxy_disabled?: boolean;
  proxy_disabled_reason?: string;
  proxy_disabled_at?: number;
  created_at: number;
  last_used: number;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expiry_timestamp: number;
  token_type: string;
  email?: string;
}

export interface QuotaData {
  models: ModelQuota[];
  last_updated: number;
  is_forbidden?: boolean;
  subscription_tier?: 'FREE' | 'PRO' | 'ULTRA';
}

export interface ModelQuota {
  name: string;
  percentage: number;
  reset_time: string;
}

// API 请求/响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// OAuth 类型
export interface OAuthState {
  state: string;
  redirectUri: string;
  createdAt: number;
}

// 代理配置类型
export interface ProxyConfig {
  port: number;
  modelMapping: Record<string, string>;
  schedulingMode: 'cache-first' | 'balanced' | 'performance';
  allowLanAccess: boolean;
}

// 请求日志类型
export interface RequestLog {
  id: string;
  timestamp: number;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  accountId?: string;
  model?: string;
  tokensUsed?: number;
}

// 刷新统计类型
export interface RefreshStats {
  total: number;
  success: number;
  failed: number;
  details?: string[];
}
