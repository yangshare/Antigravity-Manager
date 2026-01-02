@echo off
REM Antigravity Web Server 启动脚本 (Windows)

setlocal enabledelayedexpansion

echo ======================================
echo   Antigravity Web Server
echo ======================================
echo.

REM 检查 pnpm
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未安装 pnpm
    echo 请先安装 pnpm: npm install -g pnpm
    exit /b 1
)

REM 检查 .env 文件
if not exist .env (
    echo [提示] 未找到 .env 文件，正在从 .env.example 复制...
    copy .env.example .env >nul
    echo [成功] .env 文件已创建
)

REM 安装依赖
if not exist node_modules (
    echo [提示] 正在安装依赖...
    call pnpm install
    echo [成功] 依赖安装完成
)

REM 创建必要的目录
if not exist data mkdir data
if not exist logs mkdir logs

REM 启动服务
echo [提示] 正在启动服务...
echo.
call pnpm dev
