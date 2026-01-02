import { create } from 'zustand';
import type { Account } from '../types/account';
import { accountService } from '../services/accountService';

interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (email: string, refreshToken: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  refreshQuotas: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await accountService.getAccounts();
      set({ accounts, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取账号列表失败',
        loading: false,
      });
    }
  },

  addAccount: async (email, refreshToken) => {
    set({ loading: true, error: null });
    try {
      await accountService.addAccount({ email, refreshToken });
      await get().fetchAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '添加账号失败',
        loading: false,
      });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      await accountService.deleteAccount(id);
      await get().fetchAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除账号失败',
        loading: false,
      });
      throw error;
    }
  },

  refreshQuotas: async () => {
    set({ loading: true, error: null });
    try {
      await accountService.refreshAllQuotas();
      await get().fetchAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '刷新配额失败',
        loading: false,
      });
      throw error;
    }
  },
}));
