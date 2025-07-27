#!/bin/bash

echo "🚀 Shreeji Cosmetics - Full-Stack Migration Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use MongoDB Atlas."
    echo "   You can download MongoDB from: https://www.mongodb.com/try/download/community"
fi

echo "✅ Prerequisites check completed"

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "Creating config.env file..."
    cat > config.env << EOF
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
EOF
    echo "✅ Created config.env file"
else
    echo "✅ config.env already exists"
fi

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd ..

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

echo ""
echo "🎯 Setup Instructions:"
echo "======================"
echo ""
echo "1. Start MongoDB (if using local installation):"
echo "   mongod"
echo ""
echo "2. Seed the database:"
echo "   cd backend && npm run seed"
echo ""
echo "3. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Start the frontend server (in a new terminal):"
echo "   npm run dev"
echo ""
echo "5. Open your browser and navigate to:"
echo "   http://localhost:5173"
echo ""
echo "📋 Default Login Credentials:"
echo "   Admin: admin@shreejicosmetics.com / admin123"
echo "   User: john@example.com / admin123"
echo ""
echo "🔧 API Endpoints:"
echo "   Backend: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "📚 For detailed instructions, see: MIGRATION_GUIDE.md"
echo ""
echo "🎉 Setup completed! Follow the instructions above to start the application." 