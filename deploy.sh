#!/bin/bash
# ==========================================
#   在谈项目管理系统 - 一键部署到 GitHub Pages
#   使用方法：在 frontend 目录下执行 ./deploy.sh
#   部署地址：https://marlboro2976.github.io/WHGG_xiangmuguanli/
# ==========================================
set -e

# 仓库地址和分支
REPO_URL="https://github.com/marlboro2976/WHGG_xiangmuguanli.git"
DEPLOY_BRANCH="gh-pages"

echo "==> 1/4  构建生产包..."
npm run build
echo "✅ 构建完成"

echo ""
echo "==> 2/4  准备部署文件..."
cd dist
# .nojekyll 防止 GitHub 用 Jekyll 处理导致静态资源丢失
touch .nojekyll

# 清理上次部署残留的 .git 目录
rm -rf .git

echo ""
echo "==> 3/4  提交到 ${DEPLOY_BRANCH} 分支..."
git init -q -b ${DEPLOY_BRANCH}
git -c user.name="marlboro2976" -c user.email="i************@*******" add -A
git -c user.name="marlboro2976" -c user.email="i************@*******" commit -q -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git remote add origin ${REPO_URL}

echo ""
echo "==> 4/4  推送到 GitHub..."
git push -f -q origin ${DEPLOY_BRANCH}
cd ..

echo ""
echo "🎉 部署完成！"
echo "🔗 访问地址：https://marlboro2976.github.io/WHGG_xiangmuguanli/"
echo "⏱️  GitHub Pages 通常需要 1-2 分钟生效，请稍等刷新。"
