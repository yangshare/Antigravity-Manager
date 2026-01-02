import { Router, Request, Response } from 'express';
import { AccountService } from '../services/AccountService';
import { ApiResponse } from '../types';

const router: Router = Router();
const accountService = new AccountService();

/**
 * GET /api/accounts
 * 获取所有账号
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const accounts = accountService.listAccounts();
    const response: ApiResponse = {
      success: true,
      data: accounts,
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
 * GET /api/accounts/:id
 * 获取单个账号
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const account = accountService.getAccount(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: '账号不存在',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: account,
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
 * POST /api/accounts
 * 添加账号
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { email, refreshToken } = req.body;

    if (!email || !refreshToken) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: email 和 refreshToken',
        code: 'MISSING_PARAMS',
      });
    }

    const account = accountService.addAccount(email, refreshToken);
    const response: ApiResponse = {
      success: true,
      data: account,
    };
    res.status(201).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/accounts/:id
 * 删除账号
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = accountService.deleteAccount(req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        error: '账号不存在',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/accounts/refresh
 * 刷新所有账号配额
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const stats = await accountService.refreshAllQuotas();
    const response: ApiResponse = {
      success: true,
      data: stats,
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
 * POST /api/accounts/:id/disable
 * 禁用账号
 */
router.post('/:id/disable', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const success = accountService.setAccountDisabled(req.params.id, true, reason);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '账号不存在',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: '账号已禁用' },
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
 * POST /api/accounts/:id/enable
 * 启用账号
 */
router.post('/:id/enable', (req: Request, res: Response) => {
  try {
    const success = accountService.setAccountDisabled(req.params.id, false);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: '账号不存在',
        code: 'ACCOUNT_NOT_FOUND',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { message: '账号已启用' },
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
