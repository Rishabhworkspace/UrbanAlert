# UrbanAlert Post-Deployment Guide

Congratulations! The UrbanAlert platform is fully functional locally. Your backend successfully handles civic issue reports, photo uploads, AI analysis, and government logins, while the frontend accurately displays the data.

To make this site live and accessible to anyone on the internet, you will need to deploy your code to cloud hosting providers. We will use **Render** (for the backend) and **Vercel** (for the frontend)—both offer generous free tiers perfect for this project.

Here is your step-by-step guide to making UrbanAlert live.

## Prerequisites
1. **GitHub Account:** Your code needs to be pushed to a GitHub repository.
2. Ensure you have committed all recent changes to your Git repository.

---

## Part 1: Deploying the Backend (Node.js) on Render

Render is excellent for hosting Node.js servers, and it supports configuring a specific "root directory" in a monorepo setup like yours. This provides a continuous background server, which is better suited for handling file uploads and long-running AI requests.

### Step 1: Push your code to GitHub
Make sure your entire `UrbanAlert` folder is pushed to a Github repository.

### Step 2: Create a Render Web Service
1. Go to [Render](https://render.com/) and create an account using GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `UrbanAlert` repository.
4. Fill out the configuration:
   - **Name:** `urbanalert-api` (or any name you like)
   - **Region:** Choose the region closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend` (This is crucial, as your server code is inside the backend folder)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`

### Step 3: Configure Environment Variables
Scroll down to the **Environment Variables** section and add all items from your `backend/.env` file. You need to add these exactly as they appear locally:
- `MONGODB_URI`: [Your MongoDB URI]
- `JWT_SECRET`: [A secure random string]
- `JWT_EXPIRES_IN`: 7d
- `PORT`: 5000
- `CLOUDINARY_CLOUD_NAME`: [Your Cloudinary Name]
- `CLOUDINARY_API_KEY`: [Your Cloudinary API Key]
- `CLOUDINARY_API_SECRET`: [Your Cloudinary API Secret]
- `GOV_SEED_SECRET`: [Your Gov Seed Secret]
- `GROQ_API_KEY`: [Your Groq API Key]
- `CLIENT_URL`: *(Leave this blank for now, we will update it in Part 3 once the frontend is deployed)*

### Step 4: Deploy
Click **Create Web Service**. Render will now install your dependencies and start the server. 
Once deployed, Render will give you an API URL (e.g., `https://urbanalert-api.onrender.com`). **Save this URL.**

---

## Part 2: Deploying the Frontend (React + Vite) on Vercel

Vercel is optimized for building and serving Vite/React applications quickly.

### Step 1: Create a Vercel Project
1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
2. Click **Add New** > **Project**.
3. Import your `UrbanAlert` GitHub repository.

### Step 2: Configure the Build
1. **Framework Preset:** Vite
2. **Root Directory:** Click "Edit" and select `client` (This tells Vercel your frontend code is inside the client folder).
3. Expand **Environment Variables** and add:
   - **Name:** `VITE_BACKEND_URL`
   - **Value:** `[Your Render Backend URL from Part 1]` *(e.g., `https://urbanalert-api.onrender.com`)*. **Make sure not to include a trailing slash.**

### Step 3: Deploy
Click **Deploy**. Vercel will build your React application and give you a live frontend URL (e.g., `https://urbanalert.vercel.app`). **Save this URL.**

---

## Part 3: Finalizing the Connection

Your frontend is now talking to your backend, but for security (CORS), the backend needs to know it's allowed to accept requests from your new frontend URL.

1. Go back to your **Render dashboard** for your backend web service.
2. Go to **Environment Variables**.
3. Find the `CLIENT_URL` variable.
4. Set its value to your new Vercel frontend URL (e.g., `https://urbanalert.vercel.app`).
5. **Save** the changes (Render will automatically redeploy the backend).

🎉 **You're Done!**
Navigate to your Vercel URL in your browser. The site is now completely live! Citizens and Government Officials globally can now report and manage issues.
