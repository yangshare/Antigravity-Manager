# Antigravity Manager - Web UI

基于 React + TypeScript + Vite 构建的现代化 Web 管理界面。

## 功能特性

- 🎯 **账号管理** - 添加、删除、启用/禁用账号，查看配额使用情况
- 📊 **仪表盘** - 实时查看系统状态、账号统计、配额概览
- ⚙️ **API 代理** - 启动/停止代理服务，配置监听端口
- 🎨 **现代化 UI** - 使用 TailwindCSS + DaisyUI 构建，支持深色/浅色主题
- 🚀 **快速响应** - 基于 React 19 和 Vite，提供流畅的用户体验

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: TailwindCSS 4 + DaisyUI
- **路由**: React Router DOM 7
- **状态管理**: Zustand 5
- **HTTP 客户端**: Axios
- **图标**: Lucide React

## 开发

### 安装依赖

```bash
cd server/web
pnpm install
```

### 开发模式

启动前端开发服务器（端口 5173）：

```bash
pnpm dev
```

开发模式下，前端会代理 API 请求到后端服务器（localhost:8046）。

### 构建生产版本

```bash
pnpm build
```

构建产物会输出到 `server/dist/web/` 目录。

## 集成到后端服务

Web UI 的静态文件由 Express 服务提供：

1. 构建前端：`cd server && pnpm build:web`
2. 启动后端：`pnpm start`
3. 访问 Web UI：http://localhost:8046

## 同时开发前后端

在 `server/` 目录下运行：

```bash
pnpm dev:all
```

这会同时启动：
- 后端 API 服务器（端口 8046）
- 前端开发服务器（端口 5173）

## 环境变量

创建 `.env` 文件配置环境变量：

```bash
VITE_API_URL=http://localhost:8046
```

## 项目结构

```
web/
├── src/
│   ├── components/       # React 组件
│   │   ├── accounts/     # 账号相关组件
│   │   ├── common/       # 通用组件
│   │   └── layout/       # 布局组件
│   ├── pages/            # 页面组件
│   ├── services/         # API 服务层
│   ├── stores/           # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 应用根组件
│   └── main.tsx          # 应用入口
├── public/               # 静态资源
├── index.html            # HTML 模板
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # TailwindCSS 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目配置
```

## 页面说明

### 仪表盘 (`/`)

- 显示系统概览信息
- 账号统计数据
- 代理服务状态
- 最近账号列表
- 配额使用概览

### 账号管理 (`/accounts`)

- 账号列表（卡片视图）
- 添加新账号
- 删除账号
- 启用/禁用账号
- 刷新所有账号配额

### API 代理 (`/proxy`)

- 查看代理状态
- 启动/停止代理服务
- 配置监听端口
- API 使用示例

### 设置 (`/settings`)

- 系统设置
- 主题切换（开发中）

## API 集成

前端通过 `src/services/` 目录下的服务模块与后端通信：

- `accountService.ts` - 账号管理 API
- `systemService.ts` - 系统信息 API
- `api.ts` - Axios 实例配置

## 样式定制

### 主题颜色

编辑 `tailwind.config.js` 修改主题颜色：

```javascript
daisyui: {
  themes: [
    {
      light: {
        "primary": "#3b82f6",
        // ... 其他颜色
      },
    },
  ],
}
```

### 组件样式

使用 TailwindCSS 类名和 DaisyUI 组件类：

```tsx
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">标题</h2>
  </div>
</div>
```

## 贡献指南

1. 遵循现有代码风格
2. 使用 TypeScript 类型注解
3. 组件使用函数式组件 + Hooks
4. 状态管理使用 Zustand
5. API 调用统一通过 services 层

## 许可证

CC-BY-NC-SA-4.0
