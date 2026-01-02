export interface Account {
  id: string;
  email: string;
  disabled: boolean;
  proxy_disabled: boolean;
  sort_index: number;
  token: {
    access_token: string;
    refresh_token: string;
    expires_at: number | null;
  };
  quota?: {
    type: string;
    limit: number;
    usage: number;
    updated_at: number;
  } | null;
  created_at: number;
  updated_at: number;
}

export interface AccountFormData {
  email: string;
  refreshToken: string;
}

export interface RefreshStats {
  total: number;
  success: number;
  failed: number;
}
