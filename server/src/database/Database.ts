import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { logger } from '../config/logger';

export class DatabaseConnection {
  private static instance: Database.Database;
  private static dbPath: string;

  static initialize(dbPath?: string): Database.Database {
    if (this.instance) {
      return this.instance;
    }

    this.dbPath = dbPath || config.databasePath;
    const dbDir = path.dirname(this.dbPath);

    // 确保数据目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    logger.info(`初始化数据库: ${this.dbPath}`);

    this.instance = new Database(this.dbPath);

    // 启用 WAL 模式以支持并发读取
    this.instance.pragma('journal_mode = WAL');
    this.instance.pragma('foreign_keys = ON');

    // 初始化表结构
    this.initSchema();

    return this.instance;
  }

  static getInstance(): Database.Database {
    if (!this.instance) {
      throw new Error('数据库未初始化，请先调用 initialize()');
    }
    return this.instance;
  }

  private static initSchema(): void {
    const db = this.getInstance();

    // 创建账号表
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        token_data TEXT NOT NULL,
        quota_data TEXT,
        disabled INTEGER DEFAULT 0,
        disabled_reason TEXT,
        disabled_at INTEGER,
        proxy_disabled INTEGER DEFAULT 0,
        proxy_disabled_reason TEXT,
        proxy_disabled_at INTEGER,
        created_at INTEGER NOT NULL,
        last_used INTEGER NOT NULL,
        sort_index INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
      CREATE INDEX IF NOT EXISTS idx_accounts_disabled ON accounts(disabled);
      CREATE INDEX IF NOT EXISTS idx_accounts_proxy_disabled ON accounts(proxy_disabled);
    `);

    // 创建代理配置表
    db.exec(`
      CREATE TABLE IF NOT EXISTS proxy_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT OR IGNORE INTO proxy_config (key, value) VALUES
        ('port', '8046'),
        ('scheduling_mode', 'cache-first'),
        ('allow_lan_access', '0'),
        ('model_mapping', '{}');
    `);

    // 创建请求日志表（可选）
    db.exec(`
      CREATE TABLE IF NOT EXISTS request_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        response_time INTEGER NOT NULL,
        account_id TEXT,
        model TEXT,
        tokens_used INTEGER,
        request_body TEXT,
        response_body TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp ON request_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_request_logs_account_id ON request_logs(account_id);
    `);

    logger.info('数据库表结构初始化完成');
  }

  static close(): void {
    if (this.instance) {
      this.instance.close();
      this.instance = null as any;
      logger.info('数据库连接已关闭');
    }
  }
}
