import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // 记录请求
  logger.info(`${req.method} ${req.path}`);

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel](`${req.method} ${req.path} ${statusCode} (${duration}ms)`);
  });

  next();
}
