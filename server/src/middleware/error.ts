import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || '服务器内部错误';

  logger.error(`[${statusCode}] ${req.method} ${req.path}: ${message}`, {
    error: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `路径不存在: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
  });
}
