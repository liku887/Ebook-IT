@echo off
chcp 65001 >nul
title 信息科技数字教材 - 开发预览
echo ============================================
echo   信息科技数字教材 - 开发预览模式
echo ============================================
echo.
echo 正在启动本地预览服务器...
echo 启动后浏览器将自动打开，修改内容可实时刷新。
echo 按 Ctrl+C 可停止服务器。
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js（建议 18 以上版本）。
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 首次运行，正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络连接。
        pause
        exit /b 1
    )
)

call npm run dev
pause
