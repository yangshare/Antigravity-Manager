# 设计文档：独立 Web 服务架构

## 上下文

当前 Antigravity Tools 是一个基于 Tauri 的桌面应用，使用 Rust 后端和 React 前端。账号管理和 API 反代功能与桌面应用紧密耦合，限制了部署场景和扩展性。

### 约束条件
- 必须保持与现有桌面应用完全独立运行
- 数据库结构需要与桌面应用兼容（使用相同的 SQLite schema）
- 需要支持 Docker 容器化部署
- 必须提供 Web UI 以独立使用

### 利益相关者
- 桌面应用用户：希望继续使用桌面应用，不受影响
- 服务器用户：希望在服务器/NAS 上部署服务，实现远程访问
- 开发者：希望降低技术门槛，便于贡献代码

## 目标 / 非目标

### 目标
1. 创建完全独立的 Node.js Web 服务，不依赖桌面应用
2. 实现与桌面应用功能对等的账号管理和 API 反代能力
3. 提供现代化的 Web UI，支持响应式设计
4. 支持 Docker 一键部署和配置
5. 保持与桌面应用数据库的兼容性

### 非目标
- 不替代桌面应用（两者并存，用户自主选择）
- 不改变现有桌面应用的代码结构
- 不引入复杂的微服务架构（保持单体服务简洁）

## 架构决策

### 决策 1：使用 Express.js 作为 Web 框架

**原因**：
- 成熟稳定，生态丰富，文档完善
- 轻量级，适合中小型服务
- 中间件机制灵活，易于扩展
- 社区活跃，问题容易解决

**考虑的替代方案**：
- **Fastify**：性能更高，但生态较小，学习曲线较陡
- **Koa.js**：更现代化，但中间件生态不如 Express
- **NestJS**：企业级架构，但对于单体服务过于重量级

### 决策 2：使用 SQLite 作为数据库

**原因**：
- 与桌面应用数据库完全兼容
- 轻量级，无需独立数据库服务
- 适合中小规模部署（单用户或小团队）
- Docker 部署简单，数据持久化方便

**考虑的替代方案**：
- **PostgreSQL**：功能强大，但需要独立部署，增加复杂度
- **支持多数据库**：通过 ORM 抽象支持多种数据库，但增加开发和维护成本

### 决策 3：复用桌面应用的前端组件

**原因**：
- 前端代码已成熟稳定，复用可节省开发时间
- 保持 UI 一致性，降低用户学习成本
- React + TypeScript 技术栈统一

**实现方式**：
- 将桌面应用前端代码通过 Vite 构建为静态资源
- Web 服务通过 Express 托管静态文件
- 通过 RESTful API 与后端通信

### 决策 4：独立进程运行，通过 HTTP 通信

**原因**：
- 完全解耦，桌面应用和 Web 服务互不影响
- 可部署在不同机器上
- 便于扩展和维护

**端口分配**：
- 桌面应用：8045（保持不变）
- Web 服务：8046（可在配置文件中修改）

### 决策 5：提供 Docker 部署支持

**原因**：
- 简化部署流程
- 环境一致性保证
- 便于在服务器、NAS 等环境运行

**实现方式**：
- 提供 Dockerfile（多阶段构建，优化镜像大小）
- 提供 docker-compose.yml（包含数据库卷挂载配置）
- 提供环境变量配置文件

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      浏览器 / 客户端                          │
│                    (Web UI / REST API)                       │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   Node.js Web 服务                           │
│                    (Express.js)                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  路由层     │  │  中间件层   │  │  静态资源   │         │
│  │ (Routes)    │  │ (Middleware)│  │  (Web UI)   │         │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘         │
│         │                │                                    │
│  ┌──────▼────────────────▼──────────┐                       │
│  │         业务逻辑层 (Services)      │                       │
│  │  ┌──────────┐  ┌──────────────┐  │                       │
│  │  │ 账号管理  │  │  API 反代     │  │                       │
│  │  │ Service  │  │   Service    │  │                       │
│  │  └────┬─────┘  └──────┬───────┘  │                       │
│  └───────┼───────────────┼──────────┘                       │
│          │               │                                  │
│  ┌───────▼───────────────▼──────────┐                       │
│  │       数据访问层 (Database)       │                       │
│  │     ┌─────────────────────┐      │                       │
│  │     │   SQLite Database   │      │                       │
│  │     │  (better-sqlite3)   │      │                       │
│  │     └─────────────────────┘      │                       │
│  └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP / HTTPS
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                   上游 API 服务                               │
│         (Google Gemini API / Anthropic API)                  │
└─────────────────────────────────────────────────────────────┘
```

## 目录结构

```
server/
├── src/
│   ├── routes/              # API 路由
│   │   ├── accounts.ts      # 账号管理路由
│   │   ├── proxy.ts         # API 反代路由
│   │   └── system.ts        # 系统配置路由
│   ├── services/            # 业务逻辑
│   │   ├── AccountService.ts
│   │   ├── ProxyService.ts
│   │   └── OAuthService.ts
│   ├── database/            # 数据访问层
│   │   ├── Database.ts
│   │   ├── AccountRepository.ts
│   │   └── Schema.ts
│   ├── middleware/          # 中间件
│   │   ├── auth.ts
│   │   ├── error.ts
│   │   └── cors.ts
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── config/              # 配置文件
│   │   └── index.ts
│   └── server.ts            # 服务入口
├── web/                     # Web UI 前端
│   ├── (复用桌面应用前端代码)
│   └── vite.config.ts
├── Dockerfile               # Docker 镜像配置
├── docker-compose.yml       # Docker Compose 配置
├── package.json
└── tsconfig.json
```

## API 设计

### 账号管理 API

```
GET    /api/accounts              # 获取账号列表
GET    /api/accounts/:id          # 获取单个账号
POST   /api/accounts              # 添加账号
PUT    /api/accounts/:id          # 更新账号
DELETE /api/accounts/:id          # 删除账号
POST   /api/accounts/oauth/start  # 开始 OAuth 授权
POST   /api/accounts/oauth/complete # 完成 OAuth 授权
GET    /api/accounts/:id/quota    # 获取账号配额
POST   /api/accounts/refresh      # 刷新所有账号配额
POST   /api/accounts/:id/switch   # 切换当前账号
```

### API 反代 API

```
POST   /v1/chat/completions       # OpenAI 协议
POST   /v1/messages               # Anthropic 协议
POST   /v1/models                 # 获取模型列表
GET    /api/proxy/status          # 获取代理状态
POST   /api/proxy/start           # 启动代理
POST   /api/proxy/stop            # 停止代理
GET    /api/proxy/config          # 获取代理配置
PUT    /api/proxy/config          # 更新代理配置
```

## 数据库设计

复用桌面应用的数据库结构，主要表包括：

- `accounts`: 账号信息（email, token, quota, disabled 等）
- `proxy_config`: 代理配置（端口、模型映射等）
- `request_logs`: 请求日志（可选）

**兼容性保证**：
- 使用相同的表结构和字段名
- 使用相同的数据格式（JSON）
- 支持直接读取桌面应用的数据库文件

## 部署方案

### Docker 部署

**Dockerfile**：
```dockerfile
# 多阶段构建
# 阶段 1: 构建 Web UI
FROM node:20-alpine AS web-builder
WORKDIR /app/web
COPY package*.json ./
RUN pnpm $1
COPY . .
RUN pnpm $1 build

# 阶段 2: 运行服务
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm $1 --production
COPY --from=web-builder /app/web/dist ./web/dist
COPY src ./src
EXPOSE 8080
CMD ["npm", "start"]
```

**docker-compose.yml**：
```yaml
version: '3.8'
services:
  antigravity-web:
    build: .
    ports:
      - "8046:8046"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/antigravity.db
    restart: unless-stopped
```

### 配置管理

通过环境变量和配置文件管理：

```env
# 服务配置
PORT=8080
NODE_ENV=production

# 数据库配置
DATABASE_PATH=/app/data/antigravity.db

# 安全配置
API_KEY=your-api-key-here
ALLOW_LAN_ACCESS=false
```

## 风险 / 权衡

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 数据库并发访问冲突 | 数据损坏 | 使用 SQLite WAL 模式，添加文件锁 |
| 性能不如 Rust 实现 | 响应慢 | 优化数据库查询，使用连接池 |
| OAuth 回调处理复杂 | 授权失败 | 提供清晰的错误提示和重试机制 |
| Docker 部署学习成本 | 部署困难 | 提供详细的文档和一键部署脚本 |

## 迁移计划

### 阶段 1：基础框架搭建
- 创建 Node.js 项目结构
- 实现基础 API 路由和中间件
- 配置数据库连接

### 阶段 2：账号管理功能
- 实现账号 CRUD API
- 实现 OAuth 授权流程
- 实现配额查询功能

### 阶段 3：API 反代功能
- 实现协议转换逻辑
- 实现模型路由和账号轮换
- 实现请求监控和日志

### 阶段 4：Web UI 开发
- 复用桌面应用前端代码
- 适配为 Web 应用
- 实现响应式设计

### 阶段 5：部署和测试
- 编写 Dockerfile 和 docker-compose.yml
- 进行端到端测试
- 编写部署文档

### 回滚计划
- 如果 Web 服务出现严重问题，用户可继续使用桌面应用
- 数据库保持兼容，可随时切换回桌面应用
- Docker 容器可随时停止和删除

## 待决问题

1. **认证方式**：Web UI 是否需要登录认证？还是仅依靠网络访问控制？
2. **数据同步**：如果用户同时使用桌面应用和 Web 服务，如何保证数据一致性？
3. **端口冲突**：如果同一机器同时运行桌面应用和 Web 服务，如何避免端口冲突？
4. **性能优化**：是否需要实现 Redis 缓存来提升性能？
