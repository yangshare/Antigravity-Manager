import api from './api';
import type { SystemInfo, ProxyStatus } from '../types/api';

export const systemService = {
  // 获取系统信息
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await api.get<{success: boolean; data: SystemInfo}>('/api/system/info');
    return response.data.data;
  },

  // 获取代理状态
  async getProxyStatus(): Promise<ProxyStatus> {
    const response = await api.get<{success: boolean; data: ProxyStatus}>('/api/proxy/status');
    return response.data.data;
  },

  // 启动代理
  async startProxy(port: number): Promise<void> {
    await api.post('/api/proxy/start', { port });
  },

  // 停止代理
  async stopProxy(): Promise<void> {
    await api.post('/api/proxy/stop');
  },

  // 健康检查
  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get<{ status: string }>('/health');
    return response.data;
  },
};
