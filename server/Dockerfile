# 多阶段构建
# 阶段 1: 构建服务
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY src ./src
COPY tsconfig.json ./

# 构建 TypeScript
RUN pnpm run build

# 阶段 2: 运行服务
FROM node:20-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY package.json pnpm-lock.yaml* ./

# 仅安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制编译后的代码
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 创建数据目录
RUN mkdir -p /app/data

# 创建日志目录
RUN mkdir -p /app/logs

# 暴露端口
EXPOSE 8046

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8046
ENV DATABASE_PATH=/app/data/antigravity.db

# 启动服务
CMD ["node", "dist/server.js"]
