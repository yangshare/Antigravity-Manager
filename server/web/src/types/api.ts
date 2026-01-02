export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface SystemInfo {
  version: string;
  uptime: number;
  environment: string;
}

export interface ProxyStatus {
  running: boolean;
  port: number;
  availableAccounts: number;
}
