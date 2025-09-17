#!/bin/bash

# GitHub Setup Script for SEV-1 Dashboard
# Run this script to initialize Git repository and push to GitHub

echo "🚀 Setting up SEV-1 Dashboard for GitHub..."
echo

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
__pycache__/
*.pyc
.DS_Store
*.log
.vscode/
.idea/
EOF
    echo "✅ .gitignore created"
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "SEV-1 Dashboard: Complete Grafana-style incident management mockup

Features:
- 21 interactive panels with real synthetic data
- Complete incident timeline simulation
- Cross-domain correlation analysis
- Production-ready Ubuntu deployment
- Realistic SEV-1 war room experience"
    echo "✅ Changes committed"
fi

# Instructions for GitHub
echo
echo "🌐 Next steps for GitHub:"
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo
echo "2. Repository name suggestions:"
echo "   - grafana-sev1-dashboard"
echo "   - sev1-warroom-dashboard"
echo "   - nvidia-superpod-dashboard"
echo
echo "3. Run these commands (replace YOUR_USERNAME and REPO_NAME):"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "   git push -u origin main"
echo
echo "🎯 Ubuntu deployment:"
echo "   git clone https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "   cd REPO_NAME"
echo "   python3 server.py"
echo
echo "📊 Dashboard will be available at: http://YOUR_UBUNTU_IP:7777/sev1-warroom-dashboard.html"
echo
echo "✨ Setup complete! Ready for GitHub and Ubuntu deployment."
