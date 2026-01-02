import { create } from 'zustand';
import type { SystemInfo, ProxyStatus } from '../types/api';
import { systemService } from '../services/systemService';

interface SystemState {
  systemInfo: SystemInfo | null;
  proxyStatus: ProxyStatus | null;
  loading: boolean;
  error: string | null;
  fetchSystemInfo: () => Promise<void>;
  fetchProxyStatus: () => Promise<void>;
  startProxy: (port: number) => Promise<void>;
  stopProxy: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set, get) => ({
  systemInfo: null,
  proxyStatus: null,
  loading: false,
  error: null,

  fetchSystemInfo: async () => {
    set({ loading: true, error: null });
    try {
      const info = await systemService.getSystemInfo();
      set({ systemInfo: info, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取系统信息失败',
        loading: false,
      });
    }
  },

  fetchProxyStatus: async () => {
    set({ loading: true, error: null });
    try {
      const status = await systemService.getProxyStatus();
      set({ proxyStatus: status, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取代理状态失败',
        loading: false,
      });
    }
  },

  startProxy: async (port) => {
    set({ loading: true, error: null });
    try {
      await systemService.startProxy(port);
      await get().fetchProxyStatus();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '启动代理失败',
        loading: false,
      });
      throw error;
    }
  },

  stopProxy: async () => {
    set({ loading: true, error: null });
    try {
      await systemService.stopProxy();
      await get().fetchProxyStatus();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '停止代理失败',
        loading: false,
      });
      throw error;
    }
  },
}));
