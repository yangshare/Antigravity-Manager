import { Router, Request, Response } from 'express';
import { ProxyService } from '../services/ProxyService';
import { ApiResponse } from '../types';

const router: Router = Router();
const proxyService = new ProxyService();

/**
 * POST /v1/chat/completions
 * OpenAI 聊天补全接口
 */
router.post('/chat/completions', async (req: Request, res: Response) => {
  try {
    const result = await proxyService.handleChatCompletion(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      error: {
        message: error.message || '请求处理失败',
        type: 'api_error',
        code: 'internal_error',
      },
    });
  }
});

/**
 * GET /api/proxy/status
 * 获取代理状态
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = proxyService.getStatus();
    const response: ApiResponse = {
      success: true,
      data: status,
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/proxy/start
 * 启动代理
 */
router.post('/start', (req: Request, res: Response) => {
  try {
    const { port } = req.body;
    const success = proxyService.start(port || 8046);

    if (!success) {
      return res.status(400).json({
        success: false,
        error: '代理服务已在运行',
        code: 'ALREADY_RUNNING',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: '代理服务已启动' },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/proxy/stop
 * 停止代理
 */
router.post('/stop', (req: Request, res: Response) => {
  try {
    const success = proxyService.stop();

    if (!success) {
      return res.status(400).json({
        success: false,
        error: '代理服务未运行',
        code: 'NOT_RUNNING',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: '代理服务已停止' },
    };
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
