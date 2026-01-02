# 快速开始指南

## 本地开发

### 1. 安装依赖

首先确保已安装 [Node.js](https://nodejs.org/) (v20+) 和 [pnpm](https://pnpm.io/):

```bash
npm install -g pnpm
```

然后安装项目依赖：

```bash
cd server
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 3. 启动服务

**方式一：使用脚本**

- Linux/macOS: `bash .scripts/start.sh`
- Windows: `.scripts\start.bat`

**方式二：直接运行**

```bash
pnpm dev
```

服务将在 http://localhost:8046 启动。

### 4. 验证服务

```bash
# 健康检查
curl http://localhost:8046/health

# 获取系统信息
curl http://localhost:8046/api/system/info
```

## Docker 部署

### 使用 Docker Compose

```bash
cd server
docker-compose up -d
```

查看日志：

```bash
docker-compose logs -f
```

停止服务：

```bash
docker-compose down
```

### 手动构建镜像

```bash
cd server
docker build -t antigravity-web .
docker run -d -p 8046:8046 -v $(pwd)/data:/app/data antigravity-web
```

## API 使用示例

### 添加账号

```bash
curl -X POST http://localhost:8046/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "refreshToken": "your_refresh_token_here"
  }'
```

### 获取账号列表

```bash
curl http://localhost:8046/api/accounts
```

### 刷新账号配额

```bash
curl -X POST http://localhost:8046/api/accounts/refresh
```

### OpenAI 聊天测试

```bash
curl -X POST http://localhost:8046/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.0-flash-exp",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'
```

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   ├── database/        # 数据库层
│   ├── middleware/      # 中间件
│   ├── routes/          # API 路由
│   ├── services/        # 业务逻辑
│   ├── types/           # 类型定义
│   └── server.ts        # 服务入口
├── data/                # 数据目录（运行时创建）
├── logs/                # 日志目录（运行时创建）
├── .scripts/            # 启动脚本
└── README.md            # 详细文档
```

## 常见问题

### Q: 端口冲突怎么办？

修改 `.env` 文件中的 `PORT` 变量为其他端口。

### Q: 数据库文件在哪里？

默认在 `server/data/antigravity.db`，可通过 `DATABASE_PATH` 环境变量修改。

### Q: 如何查看日志？

日志文件在 `server/logs/` 目录下：
- `combined.log`: 所有日志
- `error.log`: 仅错误日志

### Q: 与桌面应用的数据库兼容吗？

完全兼容！可以直接使用桌面应用创建的数据库文件。

## 下一步

- 查看 [README.md](./README.md) 了解更多功能
- 查看提案文档 [openspec/changes/extract-web-service/](../openspec/changes/extract-web-service/) 了解设计细节
