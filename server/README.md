# Antigravity Web Server

独立的账号管理和 API 反代服务，支持 Docker 部署，包含完整的 Web UI。

## 功能特性

- 📱 **账号管理**：支持 OAuth 授权、Token 管理、配额查询
- 🔄 **API 反代**：支持 OpenAI、Anthropic、Gemini 协议
- 🚀 **智能路由**：自动账号轮换和故障转移
- 🐳 **Docker 部署**：一键容器化部署
- 📊 **Web UI**：现代化的 Web 管理界面
- ⚡ **实时监控**：实时监控 API 请求和日志

## 快速开始

### 本地开发（完整功能）

```bash
# 1. 安装后端依赖
pnpm install

# 2. 安装前端依赖
cd web && pnpm install && cd ..

# 3. 复制环境变量配置
cp .env.example .env

# 4. 构建后端
pnpm build

# 5. 构建 Web UI
pnpm build:web

# 6. 启动服务（包含 Web UI）
pnpm start

# 7. 访问 Web UI
open http://localhost:8046
```

### 仅后端开发

```bash
# 安装依赖
pnpm install

# 复制环境变量配置
cp .env.example .env

# 启动开发服务器
pnpm dev

# 测试 API
curl http://localhost:8046/health
```

### 前端开发

```bash
cd web

# 安装依赖
pnpm install

# 启动前端开发服务器（端口 5173）
pnpm dev
```

### 同时开发前后端

```bash
# 在 server/ 目录下运行
pnpm dev:all

# 这会同时启动：
# - 后端 API 服务器（端口 8046）
# - 前端开发服务器（端口 5173）
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

## Web UI 功能

- **仪表盘**：系统概览、账号统计、配额概览
- **账号管理**：添加/删除账号、启用/禁用、配额刷新
- **API 代理**：查看代理状态、启动/停止服务
- **设置**：系统配置（开发中）

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | 服务端口 | 8046 |
| NODE_ENV | 运行环境 | development |
| DATABASE_PATH | 数据库路径 | ./data/antigravity.db |
| ALLOW_LAN_ACCESS | 允许局域网访问 | false |
| LOG_LEVEL | 日志级别 | info |

前端环境变量（web/.env）：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| VITE_API_URL | 后端 API 地址 | http://localhost:8046 |

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
├── web/                 # Web UI
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API 服务
│   │   ├── stores/      # 状态管理
│   │   └── types/       # 类型定义
│   ├── index.html       # HTML 模板
│   └── vite.config.ts   # Vite 配置
├── dist/
│   └── web/             # Web UI 构建产物
├── Dockerfile           # Docker 镜像
├── docker-compose.yml   # Docker Compose
└── package.json         # 依赖配置
```

## 开发指南

### 构建项目

```bash
# 仅构建后端
pnpm build

# 仅构建前端
pnpm build:web

# 同时构建前后端
pnpm build:all
```

### 启动生产服务

```bash
# 启动后端服务（包含 Web UI）
pnpm start
```

### 代码规范

```bash
# 检查代码
pnpm lint

# 格式化代码
pnpm format
```

## 技术栈

### 后端

- **运行时**: Node.js 20+
- **框架**: Express.js
- **数据库**: SQLite (better-sqlite3)
- **语言**: TypeScript

### 前端

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: TailwindCSS 4 + DaisyUI
- **路由**: React Router DOM 7
- **状态管理**: Zustand 5
- **HTTP 客户端**: Axios

## 与桌面应用的关系

- **完全独立**：Web 服务与桌面应用互不依赖
- **数据库兼容**：使用相同的 SQLite 数据库格式
- **端口分离**：桌面应用 8045，Web 服务 8046
- **功能对等**：提供与桌面应用相同的核心功能

## 许可证

CC-BY-NC-SA-4.0
