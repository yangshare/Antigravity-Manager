# 变更：提取独立 Web 服务

## 为什么

当前 Antigravity Tools 是一个 Tauri 桌面应用，所有功能（账号管理、API 反代）都与桌面应用紧密耦合，限制了部署场景和扩展性。通过将这些核心功能提取为独立的 Web 服务，可以实现：

1. **灵活部署**：支持 Docker 容器化部署，可在服务器、NAS 等环境中运行
2. **远程访问**：通过 Web UI 管理账号和配置反代，不局限于本地桌面
3. **服务解耦**：Web 服务与桌面应用独立运行，互不影响，降低维护复杂度
4. **技术栈统一**：使用 Node.js + Express 降低开发门槛，便于社区贡献

## 变更内容

### 新增功能
- 创建独立的 Node.js Web 服务（基于 Express.js）
- 实现 Web 界面用于账号管理和 API 反代配置
- 支持 Docker 一键部署
- 提供 RESTful API 供外部应用集成

### 功能范围
- **账号管理模块**
  - OAuth 授权登录（Google/Anthropic）
  - 账号列表管理（添加、删除、编辑）
  - Token 存储与刷新
  - 配额查询与监控
  - 账号状态管理（禁用/启用）

- **API 反代模块**
  - OpenAI 协议支持（`/v1/chat/completions`、`/v1/images/generations` 等）
  - Anthropic 协议支持（`/v1/messages`）
  - Gemini 协议支持
  - 模型路由与映射
  - 智能账号轮换与故障转移
  - 请求监控与日志

- **Web UI**
  - 响应式设计，支持移动端访问
  - 账号管理界面（列表/卡片视图）
  - API 反代配置界面
  - 实时监控仪表盘
  - 系统设置页面

### 技术选型
- **Web 框架**：Express.js
- **数据库**：SQLite（与桌面应用保持兼容）
- **前端框架**：React + TypeScript（复用现有前端组件）
- **部署方式**：Docker（提供 Dockerfile 和 docker-compose.yml）

## 影响

### 受影响规范
- `account-management`：新增 Web API 接口规范
- `api-proxy`：新增独立服务部署规范
- `web-service`：新增 Web 服务整体规范

### 受影响代码
- **新增代码**
  - `server/`：Node.js Web 服务代码
  - `server/src/routes/`：API 路由定义
  - `server/src/services/`：业务逻辑层
  - `server/src/database/`：数据库访问层
  - `server/web/`：Web UI 前端代码
  - `Dockerfile`：Docker 镜像构建配置
  - `docker-compose.yml`：容器编排配置

- **不受影响代码**
  - 原桌面应用代码（`src-tauri/`、`src/`）保持不变
  - 现有数据库结构保持兼容

### 部署影响
- 用户可选择继续使用桌面应用，或部署独立的 Web 服务
- Web 服务可部署在服务器、NAS 等环境中，实现集中管理
- 桌面应用和 Web 服务可同时运行，互不冲突（使用不同端口）
