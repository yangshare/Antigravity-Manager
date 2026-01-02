# Antigravity Web Server

独立的账号管理和 API 反代服务，支持 Docker 部署。

## 功能特性

- 📱 **账号管理**：支持 OAuth 授权、Token 管理、配额查询
- 🔄 **API 反代**：支持 OpenAI、Anthropic、Gemini 协议
- 🚀 **智能路由**：自动账号轮换和故障转移
- 🐳 **Docker 部署**：一键容器化部署
- 📊 **请求监控**：实时监控 API 请求和日志

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 复制环境变量配置
cp .env.example .env

# 3. 启动开发服务器
pnpm dev

# 4. 访问服务
curl http://localhost:8046/health
```

### Docker 部署

```bash
# 使用 Docker Compose
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## API 接口

### 账号管理

```
GET    /api/accounts              # 获取账号列表
GET    /api/accounts/:id          # 获取单个账号
POST   /api/accounts              # 添加账号
DELETE /api/accounts/:id          # 删除账号
POST   /api/accounts/refresh      # 刷新所有配额
POST   /api/accounts/:id/disable  # 禁用账号
POST   /api/accounts/:id/enable   # 启用账号
```

### API 反代

```
POST /v1/chat/completions         # OpenAI 聊天接口
GET  /api/proxy/status            # 代理状态
POST /api/proxy/start             # 启动代理
POST /api/proxy/stop              # 停止代理
```

### 系统接口

```
GET /health                       # 健康检查
GET /api/system/info              # 系统信息
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 8046 |
| NODE_ENV | 运行环境 | development |
| DATABASE_PATH | 数据库路径 | ./data/antigravity.db |
| ALLOW_LAN_ACCESS | 允许局域网访问 | false |
| LOG_LEVEL | 日志级别 | info |

## 目录结构

```
server/
├── src/
│   ├── routes/          # API 路由
│   ├── services/        # 业务逻辑
│   ├── database/        # 数据访问层
│   ├── middleware/      # 中间件
│   ├── types/           # 类型定义
│   ├── config/          # 配置文件
│   └── server.ts        # 服务入口
├── web/                 # Web UI (待实现)
├── Dockerfile           # Docker 镜像
├── docker-compose.yml   # Docker Compose
└── package.json         # 依赖配置
```

## 开发指南

### 构建项目

```bash
pnpm build
```

### 启动生产服务

```bash
pnpm start
```

### 代码规范

```bash
# 检查代码
pnpm lint

# 格式化代码
pnpm format
```

## 与桌面应用的关系

- **完全独立**：Web 服务与桌面应用互不依赖
- **数据库兼容**：使用相同的 SQLite 数据库格式
- **端口分离**：桌面应用 8045，Web 服务 8046

## 许可证

CC-BY-NC-SA-4.0
