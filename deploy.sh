#!/bin/bash

# 工作记录管理后台一键部署脚本

echo "🚀 开始部署工作记录管理后台..."

# 检查参数
if [ $# -eq 0 ]; then
    echo "使用方法: ./deploy.sh [github|vercel|netlify|server]"
    echo ""
    echo "部署选项:"
    echo "  github  - 部署到GitHub Pages"
    echo "  vercel  - 部署到Vercel"
    echo "  netlify - 部署到Netlify"
    echo "  server  - 部署到服务器"
    exit 1
fi

DEPLOY_TYPE=$1

case $DEPLOY_TYPE in
    "github")
        echo "📦 准备GitHub Pages部署..."
        
        # 检查是否有git
        if ! command -v git &> /dev/null; then
            echo "❌ 请先安装Git"
            exit 1
        fi
        
        # 初始化git仓库
        if [ ! -d ".git" ]; then
            git init
            echo "✅ Git仓库初始化完成"
        fi
        
        # 添加文件
        git add .
        git commit -m "Deploy admin dashboard $(date)"
        
        echo "📤 请手动推送到GitHub并开启Pages功能"
        echo "   1. git remote add origin https://github.com/username/repo.git"
        echo "   2. git push -u origin main"
        echo "   3. 在GitHub仓库设置中开启Pages"
        ;;
        
    "vercel")
        echo "📦 准备Vercel部署..."
        
        # 检查是否有vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "📥 安装Vercel CLI..."
            npm i -g vercel
        fi
        
        # 部署
        vercel --prod
        echo "✅ Vercel部署完成"
        ;;
        
    "netlify")
        echo "📦 准备Netlify部署..."
        
        # 检查是否有netlify CLI
        if ! command -v netlify &> /dev/null; then
            echo "📥 安装Netlify CLI..."
            npm i -g netlify-cli
        fi
        
        # 部署
        netlify deploy --prod --dir .
        echo "✅ Netlify部署完成"
        ;;
        
    "server")
        echo "📦 准备服务器部署..."
        
        # 检查服务器配置
        read -p "请输入服务器地址: " SERVER_HOST
        read -p "请输入用户名: " SERVER_USER
        read -p "请输入部署路径 (默认: /var/www/admin): " DEPLOY_PATH
        DEPLOY_PATH=${DEPLOY_PATH:-/var/www/admin}
        
        # 上传文件
        echo "📤 上传文件到服务器..."
        rsync -avz --delete ./ $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/
        
        # 设置权限
        ssh $SERVER_USER@$SERVER_HOST "sudo chown -R www-data:www-data $DEPLOY_PATH && sudo chmod -R 644 $DEPLOY_PATH"
        
        echo "✅ 服务器部署完成"
        echo "🌐 访问地址: http://$SERVER_HOST/login.html"
        ;;
        
    *)
        echo "❌ 未知的部署类型: $DEPLOY_TYPE"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 后续步骤:"
echo "  1. 访问部署的网站"
echo "  2. 使用 admin/your-secure-password-here 登录"
echo "  3. 测试各项功能"
echo "  4. 配置HTTPS (生产环境)"
echo ""
echo "🔧 如需帮助，请查看 README.md 文档"
