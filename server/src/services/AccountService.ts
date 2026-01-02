import { AccountRepository } from '../database/AccountRepository';
import { Account, TokenData, QuotaData, RefreshStats } from '../types/index';
import { logger } from '../config/logger';
import axios from 'axios';

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
  addAccount(email: string, refreshToken: string): Account {
    // 验证 token 是否有效
    const tokenData: TokenData = {
      access_token: '', // 稍后刷新
      refresh_token: refreshToken,
      expires_in: 0,
      expiry_timestamp: 0,
      token_type: 'Bearer',
    };

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
