# URL Shortener Troubleshooting Guide

This guide helps you resolve common issues when running the URL Shortener application.

## 🔍 Quick Diagnostics

### 1. Check if servers are running
```bash
# Check API server
curl http://localhost:3000/ping

# Check client (should return HTML)
curl http://localhost:5173
```

### 2. Check process status
```bash
# See what's running on port 3000 (API)
lsof -i :3000

# See what's running on port 5173 (Client)
lsof -i :5173
```

## ❌ Common Issues and Solutions

### Issue: "Network Error" when submitting URLs

**Symptoms:**
- Form submission fails with "Network error" message
- Browser console shows CORS errors
- API connection test fails

**Solutions:**

1. **Verify API server is running**
   ```bash
   cd server
   npm run dev
   ```
   Look for the startup message showing the server is running on port 3000.

2. **Check CORS configuration**
   - The API server should allow `http://localhost:5173` in development
   - Check `server/src/config/index.ts` for CORS settings
   - Restart the API server after any config changes

3. **Test API directly**
   ```bash
   # Test health endpoint
   curl -X GET http://localhost:3000/ping
   
   # Test URL creation
   curl -X POST http://localhost:3000/api/urls \
     -H "Content-Type: application/json" \
     -d '{"originalUrl": "https://example.com"}'
   ```

4. **Check browser console**
   - Open browser DevTools (F12)
   - Look for CORS or network errors in Console tab
   - Check Network tab for failed requests

### Issue: API server won't start

**Symptoms:**
- "Port already in use" error
- Database connection errors
- Server crashes on startup

**Solutions:**

1. **Kill existing processes**
   ```bash
   # Kill any process using port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or use pkill
   pkill -f "npm run dev"
   ```

2. **Check MongoDB connection**
   ```bash
   # The app uses in-memory MongoDB for tests, but you can check if MongoDB is running
   mongosh --eval "db.runCommand('ping')"
   ```

3. **Clear node_modules and reinstall**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check environment variables**
   ```bash
   # Server should use these defaults:
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/url-shortener
   ```

### Issue: Client won't start or build fails

**Symptoms:**
- Vite build errors
- TypeScript compilation errors
- Client server won't start on port 5173

**Solutions:**

1. **Clear and reinstall dependencies**
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check for TypeScript errors**
   ```bash
   cd client
   npm run build
   ```

3. **Kill existing Vite process**
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

4. **Update environment configuration**
   - Check `client/.env.local` for correct API URL
   - Default should be `VITE_API_URL=http://localhost:3000`

### Issue: CORS errors in browser

**Symptoms:**
- "Access to fetch blocked by CORS policy" in console
- OPTIONS requests failing
- Network requests from client to API fail

**Solutions:**

1. **Verify CORS configuration in API**
   Check `server/src/app.ts` CORS settings:
   ```typescript
   origin: serverConfig.nodeEnv === 'development'
     ? ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000']
     : serverConfig.corsOrigin,
   ```

2. **Restart API server after CORS changes**
   ```bash
   cd server
   npm run dev
   ```

3. **Check if preflight requests are working**
   ```bash
   curl -X OPTIONS http://localhost:3000/api/urls \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type"
   ```

### Issue: Database connection problems

**Symptoms:**
- "Database not connected" errors
- MongoDB connection timeouts
- Tests failing due to database issues

**Solutions:**

1. **The app uses in-memory MongoDB for tests**
   - No external MongoDB installation required
   - Database is created automatically for testing

2. **If using external MongoDB:**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Or with Homebrew on macOS
   brew services start mongodb-community
   ```

3. **Check database configuration**
   - Review `server/src/config/index.ts`
   - Default uses in-memory database for development

## 🛠 Development Tools

### API Testing Commands

```bash
# Health check
curl http://localhost:3000/ping

# Get API info
curl http://localhost:3000/info

# Create short URL
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.example.com/very-long-url",
    "customCode": "test123",
    "description": "Test URL"
  }'

# Get URL details
curl http://localhost:3000/api/urls/details/test123

# Test redirect
curl -I http://localhost:3000/test123
```

### Logging and Debugging

1. **Enable verbose logging**
   ```bash
   # Set log level
   export LOG_LEVEL=debug
   cd server && npm run dev
   ```

2. **Check browser console**
   - Open DevTools (F12)
   - Check Console and Network tabs
   - Look for detailed error messages

3. **API server logs**
   - Server logs requests and responses
   - Check terminal output for errors

### Network Analysis

1. **Check ports**
   ```bash
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5173
   ```

2. **Test connectivity**
   ```bash
   telnet localhost 3000
   telnet localhost 5173
   ```

## 🔧 Environment Setup

### Required versions
- Node.js: v16 or higher
- npm: v7 or higher

### Directory structure verification
```
url-shortener/
├── server/
│   ├── src/
│   ├── package.json
│   └── node_modules/
├── client/
│   ├── src/
│   ├── package.json
│   └── node_modules/
└── start-dev.sh
```

### Clean installation
```bash
# From project root
rm -rf server/node_modules client/node_modules
rm -rf server/package-lock.json client/package-lock.json

# Reinstall everything
cd server && npm install && cd ..
cd client && npm install && cd ..
```

## 📞 Getting Help

### Steps to get help

1. **Check this troubleshooting guide** ✅
2. **Try the quick diagnostics** from the top of this guide
3. **Check browser console** for specific error messages
4. **Test API endpoints** directly with curl
5. **Provide detailed information** when asking for help:
   - Operating system
   - Node.js version (`node --version`)
   - Exact error messages
   - Steps to reproduce the issue
   - Browser console output

### Useful commands for debugging

```bash
# System info
node --version
npm --version
curl --version

# Process info
ps aux | grep node
lsof -i :3000
lsof -i :5173

# Network connectivity
ping localhost
curl -I http://localhost:3000/ping
```

Remember: Most issues are resolved by ensuring both servers are running and CORS is properly configured! 🚀