#!/bin/bash

# Antigravity Web Server 启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Antigravity Web Server${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# 检查是否安装了 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}错误: 未安装 pnpm${NC}"
    echo "请先安装 pnpm: npm install -g pnpm"
    exit 1
fi

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}未找到 .env 文件，正在从 .env.example 复制...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env 文件已创建${NC}"
fi

# 安装依赖
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}正在安装依赖...${NC}"
    pnpm install
    echo -e "${GREEN}依赖安装完成${NC}"
fi

# 创建必要的目录
mkdir -p data logs

# 启动服务
echo -e "${GREEN}正在启动服务...${NC}"
echo ""
pnpm dev
