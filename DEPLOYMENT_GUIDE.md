# Matrix Library Management System - Deployment Guide

## Current Status ✅
- ✅ Backend: Running on port 5000 (local)
- ✅ Database: Connected to MongoDB (matrix-lms)
- ⚠️ Email: SMTP authentication error (needs App Password)
- ⚠️ Frontend: Needs to connect to port 5000

## Render Deployment Issues Fixed:
1. **Port Configuration**: Updated to use port 10000 on Render
2. **Root Directory**: Set to `MatrixBackendAlphaVersion`
3. **Environment Variables**: Proper configuration

## Deployment Steps

### 1. Backend Deployment (OnRender)

#### Step 1: Deploy Backend
1. Go to OnRender dashboard
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Root Directory**: `MatrixBackendAlphaVersion`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

#### Step 2: Environment Variables (CRITICAL)
Set these environment variables in OnRender:
```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
```

#### Step 3: Email Configuration (Optional)
If you want email functionality:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Add these environment variables:
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### 2. Frontend Deployment (OnRender)

#### Step 1: Deploy Frontend
1. Create another **Web Service** or **Static Site**
2. Set the following:
   - **Root Directory**: `MatrixFrontEndAlphaVersion`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (for web service) or serve the build folder

#### Step 2: Environment Variables
Set these environment variables:
```
REACT_APP_API_URL=https://your-backend-service-name.onrender.com/api
NODE_ENV=production
```

### 3. Alternative: Vercel/Netlify for Frontend

You can also deploy the frontend to Vercel or Netlify:

#### Vercel Deployment:
1. Connect your GitHub repository
2. Set root directory to `MatrixFrontEndAlphaVersion`
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variable: `REACT_APP_API_URL=https://your-backend-url/api`

#### Netlify Deployment:
1. Connect your GitHub repository
2. Set build command: `cd MatrixFrontEndAlphaVersion && npm install && npm run build`
3. Set publish directory: `MatrixFrontEndAlphaVersion/build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url/api`

## Troubleshooting

### Current Issues:

1. **SMTP Authentication Error**: 
   - ✅ Fixed: Email failures won't crash the app
   - To enable email: Use Gmail App Password instead of regular password

2. **Port Mismatch**: 
   - ✅ Fixed: Frontend now connects to port 5000 (local) / 10000 (Render)

3. **Render Deployment Issues**:
   - ✅ Fixed: Added render.yaml configuration
   - ✅ Fixed: Correct root directory and environment variables

4. **CORS Errors**: Ensure backend has proper CORS configuration
5. **API Connection**: Verify `REACT_APP_API_URL` is correct
6. **Database Connection**: Check `MONGO_URI` is valid

### Testing Locally:

1. **Backend**: 
   ```bash
   cd MatrixBackendAlphaVersion
   npm install
   npm start
   ```

2. **Frontend**:
   ```bash
   cd MatrixFrontEndAlphaVersion
   npm install
   npm start
   ```

## Environment Variables Reference

### Required for Render:
- `NODE_ENV`: production
- `PORT`: 10000 (for Render)
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT tokens

### Optional:
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASSWORD`: Gmail App Password (not regular password)
- `REACT_APP_GEMINI_API_KEY`: For chatbot functionality

## Next Steps
1. ✅ Backend is running and connected to database
2. ✅ Frontend configuration updated for correct port
3. ⚠️ Fix email configuration (use App Password)
4. Deploy frontend with correct backend URL
5. Test all functionality

## Gmail App Password Setup
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-factor authentication if not already enabled
3. Generate an App Password for "Mail"
4. Use this App Password in your EMAIL_PASSWORD environment variable

## Render Deployment Checklist
- [ ] Set Root Directory to `MatrixBackendAlphaVersion`
- [ ] Set Build Command to `npm install`
- [ ] Set Start Command to `npm start`
- [ ] Add environment variables (MONGO_URI, JWT_SECRET, etc.)
- [ ] Deploy and test the backend
- [ ] Update frontend API URL to point to deployed backend
- [ ] Deploy frontend
