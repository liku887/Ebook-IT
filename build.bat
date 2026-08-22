@echo off
chcp 65001 >nul
title 信息科技数字教材 - 构建发布
echo ============================================
echo   信息科技数字教材 - 构建发布版本
echo ============================================
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

echo 正在构建...
call npm run build
if errorlevel 1 (
    echo.
    echo [错误] 构建失败，请检查内容文件是否有误。
    pause
    exit /b 1
)

echo.
echo ============================================
echo   构建完成！
echo   发布文件位于 dist 文件夹中。
echo   将 dist 文件夹整个拷贝到教室电脑，
echo   双击里面的 index.html 即可使用。
echo ============================================
echo.
pause
