import axios, { AxiosError } from 'axios';
import { AccountRepository } from '../database/AccountRepository';
import { logger } from '../config/logger';

interface ProxyRequestOptions {
  model: string;
  messages: any[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  [key: string]: any;
}

interface AccountPool {
  available: string[];
  disabled: Set<string>;
  lastUsed: Map<string, number>;
}

export class ProxyService {
  private get repo() {
    return new AccountRepository();
  }
  private accountPool: AccountPool = {
    available: [],
    disabled: new Set(),
    lastUsed: new Map(),
  };

  private isRunning = false;
  private port = 0;
  private poolInitialized = false;

  private ensurePoolInitialized() {
    // 每次都重新刷新账号池，确保获取最新数据
    this.refreshAccountPool();
  }

  /**
   * 刷新账号池
   */
  private refreshAccountPool(): void {
    const accounts = this.repo.getAllAccounts();

    // 过滤可用账号（未禁用且未在反代中禁用）
    this.accountPool.available = accounts
      .filter(a => !a.disabled && !a.proxy_disabled)
      .map(a => a.id);

    logger.info(`刷新账号池: 可用账号 ${this.accountPool.available.length} 个`);
  }

  /**
   * 选择账号（轮询策略）
   */
  private selectAccount(): string | null {
    // 确保账号池已初始化
    this.ensurePoolInitialized();

    if (this.accountPool.available.length === 0) {
      logger.error('没有可用账号');
      return null;
    }

    // 选择最久未使用的账号
    const now = Date.now();
    let selectedId = this.accountPool.available[0];
    let oldestTime = now;

    for (const id of this.accountPool.available) {
      const lastUsed = this.accountPool.lastUsed.get(id) || 0;
      if (lastUsed < oldestTime) {
        oldestTime = lastUsed;
        selectedId = id;
      }
    }

    // 更新使用时间
    this.accountPool.lastUsed.set(selectedId, now);

    const account = this.repo.getAccountById(selectedId);
    logger.info(`选择账号: ${account?.email}`);

    return selectedId;
  }

  /**
   * 处理 OpenAI 聊天请求
   */
  async handleChatCompletion(options: ProxyRequestOptions): Promise<any> {
    const accountId = this.selectAccount();
    if (!accountId) {
      throw new Error('没有可用账号');
    }

    const account = this.repo.getAccountById(accountId);
    if (!account) {
      throw new Error('账号不存在');
    }

    try {
      // 将 OpenAI 格式转换为 Gemini 格式
      const geminiRequest = this.convertToGeminiFormat(options);

      // 调用 Gemini API
      const response = await this.callGeminiAPI(account.token.access_token, geminiRequest);

      // 将 Gemini 响应转换回 OpenAI 格式
      return this.convertToOpenAIFormat(response, options.model);

    } catch (error: any) {
      logger.error('请求失败:', error.message);

      // 检查是否需要切换账号
      if (this.shouldRetry(error)) {
        logger.info('尝试切换账号重试');
        return this.handleChatCompletion(options);
      }

      throw error;
    }
  }

  /**
   * 转换为 Gemini 格式
   */
  private convertToGeminiFormat(options: ProxyRequestOptions): any {
    const contents = options.messages.map((msg: any) => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role,
        parts: [{ text: msg.content }],
      };
    });

    return {
      contents,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 8192,
      },
    };
  }

  /**
   * 调用 Gemini API
   */
  private async callGeminiAPI(accessToken: string, requestBody: any): Promise<any> {
    const model = 'gemini-2.0-flash-exp'; // 默认模型
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${accessToken}`;

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    return response.data;
  }

  /**
   * 转换为 OpenAI 格式
   */
  private convertToOpenAIFormat(geminiResponse: any, model: string): any {
    const choices = geminiResponse.candidates?.map((candidate: any) => ({
      index: candidate.index || 0,
      message: {
        role: 'assistant',
        content: candidate.content?.parts?.[0]?.text || '',
      },
      finish_reason: candidate.finishReason || 'stop',
    })) || [];

    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model,
      choices,
      usage: {
        prompt_tokens: geminiResponse.usageMetadata?.promptTokenCount || 0,
        completion_tokens: geminiResponse.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: geminiResponse.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  /**
   * 判断是否需要重试
   */
  private shouldRetry(error: any): boolean {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      // 429 限流、401 认证失败、5xx 服务器错误
      return status === 429 || status === 401 || (status !== undefined && status >= 500);
    }
    return false;
  }

  /**
   * 启动代理服务
   */
  start(port: number): boolean {
    if (this.isRunning) {
      logger.warn('代理服务已在运行');
      return false;
    }

    this.isRunning = true;
    this.port = port;
    logger.info(`代理服务已启动，端口: ${port}`);
    return true;
  }

  /**
   * 停止代理服务
   */
  stop(): boolean {
    if (!this.isRunning) {
      logger.warn('代理服务未运行');
      return false;
    }

    this.isRunning = false;
    logger.info('代理服务已停止');
    return true;
  }

  /**
   * 获取代理状态
   */
  getStatus(): { running: boolean; port: number; availableAccounts: number } {
    this.ensurePoolInitialized();
    return {
      running: this.isRunning,
      port: this.port,
      availableAccounts: this.accountPool.available.length,
    };
  }
}
