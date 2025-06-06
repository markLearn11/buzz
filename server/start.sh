#!/bin/bash

# 确保uploads目录及其子目录存在
mkdir -p uploads/videos uploads/covers uploads/avatars

# 编译TypeScript
echo "编译TypeScript..."
npx tsc

# 启动服务器
echo "启动服务器..."
node dist/index.js 