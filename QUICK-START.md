# URL Shortener - Quick Start Guide

Get your URL shortener running in under 5 minutes! 🚀

## 🎯 What This Does

Transform long URLs like `https://example.com/very-long-url-with-many-parameters?id=123&category=tech` into short, shareable links like `http://localhost:3000/abc123`.

## 🛠 Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (to clone the repository)

## ⚡ Quick Start (Automated)

### Option 1: Use the startup script (Recommended)

```bash
# 1. Navigate to the project directory
cd url-shortener

# 2. Make the script executable
chmod +x start-dev.sh

# 3. Start both servers
./start-dev.sh
```

The script will:
- ✅ Check prerequisites
- 📦 Install dependencies automatically
- 🔧 Start the API server (port 3000)
- 🎨 Start the client app (port 5173)
- 🎉 Show you the URLs to access

### Option 2: Manual setup

```bash
# Terminal 1 - Start API Server
cd server
npm install
npm run dev

# Terminal 2 - Start Client App
cd client  
npm install
npm run dev
```

## 🌐 Access Your App

After startup, open your browser:

- **🎨 Main App**: http://localhost:5173
- **📡 API Server**: http://localhost:3000
- **📚 API Documentation**: http://localhost:3000/info
- **🔍 Health Check**: http://localhost:3000/ping

## 📝 How to Use

### Step 1: Enter a URL
```
https://www.example.com/very-long-url-with-parameters
```

### Step 2: Customize (Optional)
- **Custom Code**: `my-link` (creates `http://localhost:3000/my-link`)
- **Description**: "My favorite website"

### Step 3: Shorten & Copy
- Click "Shorten URL"
- Use the copy button to share your link
- Click the short URL to test it

## ✨ Features

- 🚀 **Instant shortening** - URLs shortened in milliseconds
- 🎯 **Custom codes** - Create memorable short links
- 📋 **One-click copy** - Copy to clipboard instantly
- 📱 **Mobile responsive** - Works on all devices
- 📊 **Click tracking** - See how many clicks your links get
- 🔗 **Direct testing** - Click shortened URLs to test them

## 🧪 Testing the API

### Quick Health Check
```bash
curl http://localhost:3000/ping
```

### Create a Short URL
```bash
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://example.com",
    "customCode": "test123",
    "description": "Test link"
  }'
```

### Test the Redirect
```bash
curl -I http://localhost:3000/test123
```

## 🚨 Troubleshooting

### "Network Error" when submitting URLs

1. **Check if servers are running**:
   ```bash
   curl http://localhost:3000/ping
   ```

2. **Look for this startup message**:
   ```
   🚀 URL Shortener API Server Started
   📡 Server: http://localhost:3000
   🎨 Client App: http://localhost:5173
   ```

3. **Test connection in the app**:
   - Click the "Test Connection" button in the UI
   - Green dot = Connected ✅
   - Red dot = Disconnected ❌

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5173
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
# Clean install
rm -rf server/node_modules client/node_modules
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## 📊 Project Structure

```
url-shortener/
├── 🔧 server/           # API backend (Node.js + TypeScript)
├── 🎨 client/           # React frontend (Vite + TypeScript)  
├── 🚀 start-dev.sh     # Startup script
├── 📋 QUICK-START.md   # This guide
└── 🔍 TROUBLESHOOTING.md # Detailed troubleshooting
```

## 🎛 Configuration

### Environment Variables

**Server** (`server/.env`):
```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
BASE_URL=http://localhost:3000
```

**Client** (`client/.env.local`):
```bash
VITE_API_URL=http://localhost:3000
```

## 🧪 Running Tests

```bash
# API Tests (includes integration tests)
cd server
npm test

# Client Tests  
cd client
npm test
```

## 🚀 Production Build

```bash
# Build client for production
cd client
npm run build

# Build server for production
cd server  
npm run build
```

## 📞 Need Help?

1. **Check the connection status** indicator in the UI
2. **Look at browser console** (F12) for detailed errors
3. **Review TROUBLESHOOTING.md** for detailed solutions
4. **Test API endpoints** directly with curl commands above

## 🎉 You're All Set!

Your URL shortener is now running! Try shortening a URL and sharing it. The app includes:

- Real-time connection monitoring
- Detailed error messages
- Copy-to-clipboard functionality
- Mobile-responsive design
- Click tracking and analytics

**Happy shortening!** 🔗✨