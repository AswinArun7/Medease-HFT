# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (it's free!)
3. Verify your email address

## Step 2: Create a Free Cluster
1. After logging in, click "Build a Database"
2. Choose the **FREE** (M0) tier
3. Select a cloud provider (AWS is fine)
4. Choose a region closest to you
5. Give your cluster a name (e.g., "medece-cluster")
6. Click "Create"

## Step 3: Create Database User
1. Go to "Database Access" in the left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., "medeceuser")
5. Enter a strong password (SAVE THIS PASSWORD!)
6. Under "Database User Privileges", select "Atlas admin"
7. Click "Add User"

## Step 4: Whitelist Your IP Address
1. Go to "Network Access" in the left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - OR click "Add Current IP Address" (more secure)
4. Click "Confirm"

## Step 5: Get Your Connection String
1. Go to "Database" in the left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "5.5 or later"
5. Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

## Step 6: Update Your Connection String
Replace `<password>` in the connection string with your actual password.

Example:
```
mongodb+srv://medeceuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/medeasedb?retryWrites=true&w=majority
```

Then update `app.js` line 19 with your new connection string.

