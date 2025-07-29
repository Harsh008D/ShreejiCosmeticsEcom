# 🚀 Shreeji Cosmetics - Deployment Guide

## **📋 PRE-DEPLOYMENT CHECKLIST**

### **✅ Project Structure Verification**
- [ ] Backend is in `/backend` directory
- [ ] Frontend files are in root directory
- [ ] All sensitive files are in `.gitignore`
- [ ] No hardcoded URLs or credentials

### **✅ Environment Variables**
- [ ] `backend/config.env` exists for local development
- [ ] `backend/config.env.example` is updated
- [ ] `env.example` exists for frontend
- [ ] No sensitive data in Git

### **✅ Configuration Files**
- [ ] `railway.json` exists with proper start command
- [ ] `vercel.json` exists with proper build settings
- [ ] `backend/Procfile` exists as backup
- [ ] `package.json` scripts are correct

---

## **🔧 RAILWAY DEPLOYMENT (Backend)**

### **Step 1: Prepare Railway Project**
1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. **IMPORTANT**: Set Root Directory to `backend`

### **Step 2: Configure Environment Variables**
Add these variables in Railway dashboard:

```bash
# Required Variables
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/shreeji-cosmetics?retryWrites=true&w=majority
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=production

# Optional Variables (if using email/password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### **Step 3: Deploy**
1. Railway will automatically detect the backend
2. It will use `railway.json` configuration
3. Start command: `cd backend && npm install && npm start`

### **Step 4: Get Railway URL**
- Copy the Railway URL (e.g., `https://shreeji-cosmetics-production.up.railway.app`)
- Test the health endpoint: `https://your-railway-url/api/health`

---

## **🎨 VERCEL DEPLOYMENT (Frontend)**

### **Step 1: Prepare Vercel Project**
1. Go to [Vercel.com](https://vercel.com)
2. Create new project
3. Connect your GitHub repository
4. **IMPORTANT**: Set Root Directory to `/` (root)

### **Step 2: Configure Environment Variables**
Add these variables in Vercel dashboard:

```bash
# Required Variables
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_APP_NAME=Shreeji Cosmetics

# Optional Variables
VITE_APP_VERSION=1.0.0
```

### **Step 3: Configure Build Settings**
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### **Step 4: Deploy**
1. Vercel will use `vercel.json` configuration
2. It will build the frontend automatically
3. Deploy to production

---

## **🔍 TROUBLESHOOTING COMMON ISSUES**

### **Railway Issues:**

#### **1. "Cannot find module 'express'"**
**Solution**: Railway needs to install dependencies
- Check `railway.json` has correct start command
- Ensure `backend/package.json` exists

#### **2. "MongoDB connection failed"**
**Solution**: Check environment variables
- Verify `MONGODB_URI` is set correctly
- Add `0.0.0.0/0` to MongoDB Atlas IP whitelist

#### **3. "Rate limiter warnings"**
**Solution**: Already fixed in `server.js`
- `app.set('trust proxy', 1)` is added for production

#### **4. "Config File error"**
**Solution**: Clear Railway settings
- Remove any "Config File" setting in Railway
- Let Railway use `railway.json` automatically

### **Vercel Issues:**

#### **1. "White/blank page"**
**Solution**: Check environment variables
- Verify `VITE_API_URL` is correct
- Check browser console for errors

#### **2. "Build failed"**
**Solution**: Check TypeScript configuration
- Ensure `tsconfig.app.json` includes all files
- Check for missing components

#### **3. "CORS errors"**
**Solution**: Update CORS in backend
- Backend already configured for Vercel domains
- Check Railway URL is correct

---

## **✅ POST-DEPLOYMENT VERIFICATION**

### **Backend Health Check:**
```bash
curl https://your-railway-url/api/health
```

### **Frontend Test:**
1. Visit your Vercel URL
2. Check browser console for errors
3. Test login/registration
4. Test product browsing
5. Test cart functionality

### **Database Test:**
1. Login to admin panel
2. Add a test product
3. Upload an image
4. Verify data appears

---

## **🔄 UPDATING DEPLOYMENTS**

### **Backend Updates:**
1. Push changes to GitHub
2. Railway auto-deploys
3. Check Railway logs for errors

### **Frontend Updates:**
1. Push changes to GitHub
2. Vercel auto-deploys
3. Check Vercel logs for errors

---

## **🚨 CRITICAL REMINDERS**

1. **Never commit sensitive data** to Git
2. **Always test locally** before deploying
3. **Check environment variables** in both platforms
4. **Monitor logs** for errors
5. **Keep backup** of working configurations

---

## **📞 SUPPORT**

If deployment fails:
1. Check Railway/Vercel logs
2. Verify environment variables
3. Test endpoints manually
4. Check MongoDB Atlas settings
5. Verify CORS configuration