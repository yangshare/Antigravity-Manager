import { DatabaseConnection } from './Database';
import { Account, TokenData, QuotaData } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';

export class AccountRepository {
  private db = DatabaseConnection.getInstance();

  /**
   * 获取所有账号
   */
  getAllAccounts(): Account[] {
    const stmt = this.db.prepare(`
      SELECT * FROM accounts
      ORDER BY sort_index ASC, created_at DESC
    `);
    const rows = stmt.all() as any[];

    return rows.map(this.rowToAccount);
  }

  /**
   * 根据ID获取账号
   */
  getAccountById(id: string): Account | null {
    const stmt = this.db.prepare('SELECT * FROM accounts WHERE id = ?');
    const row = stmt.get(id) as any;

    return row ? this.rowToAccount(row) : null;
  }

  /**
   * 根据邮箱获取账号
   */
  getAccountByEmail(email: string): Account | null {
    const stmt = this.db.prepare('SELECT * FROM accounts WHERE email = ?');
    const row = stmt.get(email) as any;

    return row ? this.rowToAccount(row) : null;
  }

  /**
   * 创建账号
   */
  createAccount(account: Omit<Account, 'id' | 'created_at'>): Account {
    const id = uuidv4();
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO accounts (
        id, email, name, token_data, quota_data,
        disabled, disabled_reason, disabled_at,
        proxy_disabled, proxy_disabled_reason, proxy_disabled_at,
        created_at, last_used, sort_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      account.email,
      account.name || null,
      JSON.stringify(account.token),
      account.quota ? JSON.stringify(account.quota) : null,
      account.disabled ? 1 : 0,
      account.disabled_reason || null,
      account.disabled_at || null,
      account.proxy_disabled ? 1 : 0,
      account.proxy_disabled_reason || null,
      account.proxy_disabled_at || null,
      now,
      account.last_used || now,
      0
    );

    logger.info(`创建账号: ${account.email}`);

    return this.getAccountById(id)!;
  }

  /**
   * 更新账号
   */
  updateAccount(id: string, updates: Partial<Account>): boolean {
    const account = this.getAccountById(id);
    if (!account) return false;

    const merged = { ...account, ...updates };
    const stmt = this.db.prepare(`
      UPDATE accounts SET
        email = ?,
        name = ?,
        token_data = ?,
        quota_data = ?,
        disabled = ?,
        disabled_reason = ?,
        disabled_at = ?,
        proxy_disabled = ?,
        proxy_disabled_reason = ?,
        proxy_disabled_at = ?,
        last_used = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      merged.email,
      merged.name || null,
      JSON.stringify(merged.token),
      merged.quota ? JSON.stringify(merged.quota) : null,
      merged.disabled ? 1 : 0,
      merged.disabled_reason || null,
      merged.disabled_at || null,
      merged.proxy_disabled ? 1 : 0,
      merged.proxy_disabled_reason || null,
      merged.proxy_disabled_at || null,
      merged.last_used,
      id
    );

    logger.info(`更新账号: ${merged.email}`);

    return result.changes > 0;
  }

  /**
   * 删除账号
   */
  deleteAccount(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM accounts WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes > 0) {
      logger.info(`删除账号: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * 批量删除账号
   */
  deleteAccounts(ids: string[]): number {
    const stmt = this.db.prepare(
      `DELETE FROM accounts WHERE id IN (${ids.map(() => '?').join(',')})`
    );
    const result = stmt.run(...ids);

    logger.info(`批量删除 ${result.changes} 个账号`);

    return result.changes;
  }

  /**
   * 更新账号配额
   */
  updateAccountQuota(id: string, quota: QuotaData): boolean {
    const stmt = this.db.prepare('UPDATE accounts SET quota_data = ? WHERE id = ?');
    const result = stmt.run(JSON.stringify(quota), id);

    return result.changes > 0;
  }

  /**
   * 重新排序账号
   */
  reorderAccounts(accountIds: string[]): boolean {
    const updateMany = this.db.transaction((ids: string[]) => {
      const stmt = this.db.prepare('UPDATE accounts SET sort_index = ? WHERE id = ?');
      ids.forEach((id, index) => {
        stmt.run(index, id);
      });
    });

    try {
      updateMany(accountIds);
      logger.info('重新排序账号');
      return true;
    } catch (error) {
      logger.error('重新排序账号失败:', error);
      return false;
    }
  }

  /**
   * 将数据库行转换为 Account 对象
   */
  private rowToAccount(row: any): Account {
    return {
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      token: JSON.parse(row.token_data) as TokenData,
      quota: row.quota_data ? JSON.parse(row.quota_data) as QuotaData : undefined,
      disabled: row.disabled === 1,
      disabled_reason: row.disabled_reason || undefined,
      disabled_at: row.disabled_at || undefined,
      proxy_disabled: row.proxy_disabled === 1,
      proxy_disabled_reason: row.proxy_disabled_reason || undefined,
      proxy_disabled_at: row.proxy_disabled_at || undefined,
      created_at: row.created_at,
      last_used: row.last_used,
    };
  }
}
