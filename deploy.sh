#!/bin/bash

echo "🚀 Shreeji Cosmetics - Deployment Script"
echo "========================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking required files..."

required_files=(
    "package.json"
    "backend/package.json"
    "vercel.json"
    "backend/railway.json"
    "DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

echo ""
echo "✅ All required files found!"
echo ""

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🎉 Project is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push"
echo ""
echo "2. Follow the DEPLOYMENT.md guide:"
echo "   - Set up MongoDB Atlas"
echo "   - Deploy backend to Railway"
echo "   - Deploy frontend to Vercel"
echo "   - Configure environment variables"
echo ""
echo "3. Test your deployment"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md" 