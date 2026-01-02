import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types';
import { DatabaseConnection } from '../database/Database';

const router: Router = Router();

/**
 * GET /health
 * 健康检查
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    // 检查数据库连接
    const db = DatabaseConnection.getInstance();
    db.prepare('SELECT 1').get();

    res.json({
      status: 'healthy',
      timestamp: Date.now(),
      database: 'connected',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: Date.now(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

/**
 * GET /api/system/info
 * 系统信息
 */
router.get('/api/system/info', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      name: 'Antigravity Web Server',
      version: '1.0.0',
      description: '独立的账号管理和 API 反代服务',
    },
  };
  res.json(response);
});

export default router;
