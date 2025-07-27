# 🚀 Shreeji Cosmetics - Free Deployment Guide

This guide will help you deploy your Shreeji Cosmetics website for free using Vercel (frontend) and Railway (backend).

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Railway account (free)
- MongoDB Atlas account (free)

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier)
4. Set up database access (username/password)
5. Set up network access (allow all IPs: 0.0.0.0/0)

### 1.2 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Save this for later use

**Example:**
```
mongodb+srv://username:password@cluster.mongodb.net/shreeji-cosmetics?retryWrites=true&w=majority
```

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Prepare Backend for Railway
1. Make sure your backend folder is ready
2. Ensure `railway.json` exists in the backend folder
3. Verify `package.json` has correct start script

### 2.2 Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Set the root directory to `/backend`
7. Click "Deploy"

### 2.3 Configure Environment Variables
In Railway dashboard, add these environment variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Session
SESSION_SECRET=your_session_secret_key

# Email (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail@gmail.com

# Frontend URL (for CORS)
FRONTEND_URL=https://your-vercel-domain.vercel.app

# Node Environment
NODE_ENV=production
```

### 2.4 Get Railway URL
1. After deployment, Railway will provide a URL
2. Copy this URL (e.g., `https://your-app.railway.app`)
3. Save this for the frontend configuration

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend for Vercel
1. Make sure `vercel.json` exists in the root folder
2. Ensure `package.json` has correct build script
3. Verify environment variables are configured

### 3.2 Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings:
   - Framework Preset: Vite
   - Root Directory: `./` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### 3.3 Configure Environment Variables
In Vercel dashboard, add this environment variable:

```env
VITE_API_URL=https://your-railway-backend-url.railway.app
```

### 3.4 Get Vercel URL
1. After deployment, Vercel will provide a URL
2. Copy this URL (e.g., `https://your-app.vercel.app`)
3. Update Railway environment variables with this URL

## 🔧 Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
In `backend/server.js`, update the CORS configuration:

```javascript
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? [
        'https://your-vercel-domain.vercel.app', // Your Vercel URL
        process.env.FRONTEND_URL // Environment variable
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 4.2 Redeploy Backend
1. Commit and push your changes to GitHub
2. Railway will automatically redeploy

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Frontend
1. Visit your Vercel URL
2. Test user registration/login
3. Test product browsing
4. Test cart functionality
5. Test wishlist functionality

### 5.2 Test Backend
1. Test API endpoints
2. Verify database connections
3. Test email functionality
4. Check CORS issues

## 🔍 Step 6: Troubleshooting

### Common Issues:

#### CORS Errors
- Verify CORS configuration in backend
- Check environment variables
- Ensure URLs are correct

#### Database Connection Issues
- Verify MongoDB connection string
- Check network access settings
- Ensure database user has correct permissions

#### Email Not Working
- Verify Gmail app password
- Check email environment variables
- Test email service configuration

#### Build Errors
- Check package.json scripts
- Verify all dependencies are installed
- Check for TypeScript errors

## 📊 Step 7: Monitor Your Application

### 7.1 Railway Monitoring
- Check deployment logs
- Monitor resource usage
- Set up alerts

### 7.2 Vercel Monitoring
- Check build logs
- Monitor performance
- Set up analytics

## 🔄 Step 8: Continuous Deployment

### 8.1 Automatic Deployments
- Both Vercel and Railway will auto-deploy on git push
- Ensure your main branch is always stable

### 8.2 Environment Management
- Use different environment variables for development/production
- Never commit sensitive data to git

## 🎉 Success!

Your Shreeji Cosmetics website is now live and free! 

### Your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Database**: MongoDB Atlas (managed)

### Next Steps:
1. Set up a custom domain (optional)
2. Configure Google Analytics
3. Set up monitoring and alerts
4. Plan for scaling when needed

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | $0/month |
| Railway | Free | $0/month |
| MongoDB Atlas | M0 Free | $0/month |
| Gmail SMTP | Free | $0/month |
| **Total** | | **$0/month** |

## 🚀 Scaling Options

When you need to scale:
- **Vercel Pro**: $20/month (better performance)
- **Railway Pro**: $5/month (more resources)
- **MongoDB Atlas**: $9/month (M2 cluster)
- **Custom Domain**: $15/year

**Total scaling cost**: ~$35/month 