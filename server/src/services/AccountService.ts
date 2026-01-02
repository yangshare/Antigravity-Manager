import { AccountRepository } from '../database/AccountRepository';
import { Account, TokenData, QuotaData, RefreshStats } from '../types/index';
import { logger } from '../config/logger';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 代理配置
const PROXY_URL = 'http://127.0.0.1:7897';
const httpsAgent = new HttpsProxyAgent(PROXY_URL);

// Google OAuth 配置
const CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const CLIENT_SECRET = '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';

export class AccountService {
  private get repo() {
    return new AccountRepository();
  }

  /**
   * 获取所有账号
   */
  listAccounts(): Account[] {
    return this.repo.getAllAccounts();
  }

  /**
   * 获取单个账号
   */
  getAccount(id: string): Account | null {
    return this.repo.getAccountById(id);
  }

  /**
   * 添加账号
   */
  async addAccount(email: string, refreshToken: string): Promise<Account> {
    // 使用 refresh_token 获取 access_token
    const tokenData = await this.refreshAccessToken(refreshToken);

    const account: Account = {
      id: '', // 会在 createAccount 中生成
      email,
      token: tokenData,
      created_at: Date.now(),
      last_used: Date.now(),
    };

    return this.repo.createAccount(account);
  }

  /**
   * 使用 refresh_token 刷新 access_token
   */
  private async refreshAccessToken(refreshToken: string): Promise<TokenData> {
    try {
      logger.info('[AccountService] 开始刷新 access_token...');

      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          httpsAgent,
          timeout: 30000,
        }
      );

      const tokenData: TokenData = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || refreshToken,
        expires_in: response.data.expires_in || 3600,
        expiry_timestamp: Date.now() + (response.data.expires_in || 3600) * 1000,
        token_type: response.data.token_type || 'Bearer',
      };

      logger.info('[AccountService] Access token 刷新成功');
      return tokenData;
    } catch (error: any) {
      logger.error('[AccountService] 刷新 access_token 失败，详细信息:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      if (error.code === 'ECONNREFUSED') {
        throw new Error('无法连接到代理服务器，请检查 Clash 是否启动');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('连接超时，请检查网络或代理设置');
      } else if (error.response?.status === 401) {
        throw new Error('refresh_token 无效或已过期，请重新授权');
      } else {
        throw new Error(`刷新 access_token 失败: ${error.message}`);
      }
    }
  }

  /**
   * 确保账号的 access_token 有效
   */
  async ensureAccessTokenValid(accountId: string): Promise<TokenData | null> {
    const account = this.repo.getAccountById(accountId);
    if (!account) return null;

    const now = Date.now();
    const token = account.token;

    // 如果 access_token 将在5分钟内过期（或已过期），则刷新
    const refreshThreshold = 5 * 60 * 1000; // 5分钟
    if (!token.access_token || !token.expiry_timestamp || token.expiry_timestamp - now < refreshThreshold) {
      logger.info(`刷新账号 access_token: ${account.email}`);
      const newTokenData = await this.refreshAccessToken(token.refresh_token);

      // 更新数据库中的 token
      this.repo.updateAccount(accountId, {
        token_data: JSON.stringify(newTokenData),
      });

      return newTokenData;
    }

    return token;
  }

  /**
   * 删除账号
   */
  deleteAccount(id: string): boolean {
    return this.repo.deleteAccount(id);
  }

  /**
   * 批量删除账号
   */
  deleteAccounts(ids: string[]): number {
    return this.repo.deleteAccounts(ids);
  }

  /**
   * 禁用/启用账号
   */
  setAccountDisabled(id: string, disabled: boolean, reason?: string): boolean {
    return this.repo.updateAccount(id, {
      disabled,
      disabled_reason: reason,
      disabled_at: disabled ? Date.now() : undefined,
    });
  }

  /**
   * 禁用/启用账号的反代状态
   */
  setAccountProxyDisabled(id: string, proxyDisabled: boolean, reason?: string): boolean {
    return this.repo.updateAccount(id, {
      proxy_disabled: proxyDisabled,
      proxy_disabled_reason: reason,
      proxy_disabled_at: proxyDisabled ? Date.now() : undefined,
    });
  }

  /**
   * 获取账号配额
   */
  async getAccountQuota(id: string): Promise<QuotaData | null> {
    const account = this.repo.getAccountById(id);
    if (!account) return null;

    // 如果配额信息过期（超过1小时），尝试刷新
    const oneHour = 60 * 60 * 1000;
    if (account.quota && Date.now() - account.quota.last_updated < oneHour) {
      return account.quota;
    }

    // 刷新配额
    return this.fetchAccountQuota(id);
  }

  /**
   * 从上游 API 获取账号配额
   */
  private async fetchAccountQuota(id: string): Promise<QuotaData | null> {
    const account = this.repo.getAccountById(id);
    if (!account || !account.token.access_token) {
      return null;
    }

    try {
      // 调用 Gemini API 获取配额信息
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1/models',
        {},
        {
          headers: {
            'Authorization': `Bearer ${account.token.access_token}`,
          },
          params: {
            key: account.token.access_token,
          },
          httpsAgent,
          timeout: 30000,
        }
      );

      // 解析响应获取配额信息
      // 这里需要根据实际 API 响应格式进行调整
      const quotaData: QuotaData = {
        models: [],
        last_updated: Date.now(),
      };

      this.repo.updateAccountQuota(id, quotaData);
      logger.info(`刷新账号配额: ${account.email}`);

      return quotaData;
    } catch (error: any) {
      logger.error(`获取账号配额失败: ${account.email}`, error.message);

      // 检查是否是 403 禁用
      if (error.response?.status === 403) {
        this.setAccountDisabled(id, true, '403 Forbidden');
      }

      return null;
    }
  }

  /**
   * 刷新所有账号配额
   */
  async refreshAllQuotas(): Promise<RefreshStats> {
    const accounts = this.repo.getAllAccounts();
    let success = 0;
    let failed = 0;
    const details: string[] = [];

    for (const account of accounts) {
      try {
        const quota = await this.fetchAccountQuota(account.id);
        if (quota) {
          success++;
          details.push(`${account.email}: 成功`);
        } else {
          failed++;
          details.push(`${account.email}: 失败`);
        }
      } catch (error: any) {
        failed++;
        details.push(`${account.email}: ${error.message}`);
      }
    }

    logger.info(`刷新所有配额完成: 成功 ${success}, 失败 ${failed}`);

    return {
      total: accounts.length,
      success,
      failed,
      details,
    };
  }

  /**
   * 重新排序账号
   */
  reorderAccounts(accountIds: string[]): boolean {
    return this.repo.reorderAccounts(accountIds);
  }

  /**
   * 切换当前账号
   */
  switchAccount(id: string): boolean {
    return this.repo.updateAccount(id, {
      last_used: Date.now(),
    });
  }
}
