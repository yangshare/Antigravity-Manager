import api from './api';
import type { Account, AccountFormData, RefreshStats } from '../types/account';

export const accountService = {
  // 获取账号列表
  async getAccounts(): Promise<Account[]> {
    const response = await api.get<{success: boolean; data: Account[]}>('/api/accounts');
    return response.data.data;
  },

  // 获取单个账号
  async getAccount(id: string): Promise<Account> {
    const response = await api.get<{success: boolean; data: Account}>(`/api/accounts/${id}`);
    return response.data.data;
  },

  // 添加账号
  async addAccount(data: AccountFormData): Promise<Account> {
    const response = await api.post<{success: boolean; data: Account}>('/api/accounts', data);
    return response.data.data;
  },

  // 删除账号
  async deleteAccount(id: string): Promise<void> {
    await api.delete(`/api/accounts/${id}`);
  },

  // 刷新所有账号配额
  async refreshAllQuotas(): Promise<RefreshStats> {
    const response = await api.post<{success: boolean; data: RefreshStats}>('/api/accounts/refresh');
    return response.data.data;
  },

  // 启用/禁用账号
  async toggleAccountDisabled(id: string, disabled: boolean): Promise<void> {
    await api.put(`/api/accounts/${id}`, { disabled });
  },
};
