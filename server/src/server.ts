import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config';
import { logger } from './config/logger';
import { DatabaseConnection } from './database/Database';
import { errorHandler, notFoundHandler } from './middleware/error';
import { requestLogger } from './middleware/logger';
import accountRoutes from './routes/accounts';
import proxyRoutes from './routes/proxy';
import systemRoutes from './routes/system';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private initializeDatabase(): void {
    try {
      DatabaseConnection.initialize();
      logger.info('数据库初始化成功');
    } catch (error) {
      logger.error('数据库初始化失败:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: config.allowLanAccess ? '*' : ['http://localhost:8046', 'http://127.0.0.1:8046'],
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Body parser
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '100mb' }));

    // Request logger
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // API routes first
    this.app.use(systemRoutes);
    this.app.use('/api/accounts', accountRoutes);
    this.app.use('/v1', proxyRoutes);
    this.app.use('/api/proxy', proxyRoutes);

    // Serve static files from web build (production)
    const webDistPath = path.join(__dirname, '../dist/web');
    this.app.use(express.static(webDistPath));

    // Root redirect to web UI
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Antigravity Web Server',
        version: '1.0.0',
        status: 'running',
        webUI: '/index.html',
      });
    });

    // SPA fallback - all other routes serve index.html
    this.app.get('*', (req, res) => {
      // Don't redirect API routes
      if (req.path.startsWith('/api') || req.path.startsWith('/v1') || req.path === '/health') {
        return notFoundHandler(req, res, () => {});
      }
      res.sendFile(path.join(webDistPath, 'index.html'));
    });

    // 404 handler
    this.app.use(notFoundHandler);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(config.port, () => {
      logger.info(`🚀 服务器启动成功`);
      logger.info(`📍 端口: ${config.port}`);
      logger.info(`🌐 环境: ${config.nodeEnv}`);
      logger.info(`🔗 Web UI: http://localhost:${config.port}`);
      logger.info(`📦 API Base: http://localhost:${config.port}/api`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

// 启动服务器
if (require.main === module) {
  const server = new Server();
  server.start();

  // 优雅关闭
  process.on('SIGINT', () => {
    logger.info('收到 SIGINT 信号，正在关闭服务器...');
    DatabaseConnection.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('收到 SIGTERM 信号，正在关闭服务器...');
    DatabaseConnection.close();
    process.exit(0);
  });
}

export { Server };
