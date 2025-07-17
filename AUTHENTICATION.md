# HTTP Secure Cookies Authentication Setup

## Overview
This project uses HTTP secure cookies instead of localStorage for authentication tokens. This approach provides better security by:

1. **HTTP-Only Cookies**: Prevents XSS attacks as cookies cannot be accessed via JavaScript
2. **Secure Flag**: Ensures cookies are only sent over HTTPS in production
3. **SameSite Protection**: Prevents CSRF attacks
4. **Automatic Handling**: Browser automatically includes cookies in requests

## Backend Requirements

Your backend API should be configured to:

### 1. Set Secure Cookies on Login/Register
```javascript
// Express.js example
app.post('/api/auth/login', async (req, res) => {
  // Validate credentials...
  const token = jwt.sign({ userId: user.id }, JWT_SECRET)
  
  res.cookie('authToken', token, {
    httpOnly: true,        // Prevents XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',    // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  })
  
  res.json({ user, success: true })
})
```

### 2. Verify Cookies on Protected Routes
```javascript
// Middleware to verify cookie
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### 3. Clear Cookies on Logout
```javascript
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })
  
  res.json({ success: true })
})
```

### 4. CORS Configuration
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## Frontend Configuration

### 1. Axios Configuration
The API client is configured with:
- `withCredentials: true` - Includes cookies in all requests
- No manual token handling needed
- Automatic cookie inclusion

### 2. Authentication Flow
1. **Login/Register**: Server sets HTTP-only cookie
2. **API Requests**: Browser automatically includes cookie
3. **Auth Check**: `getCurrentUser()` validates existing session
4. **Logout**: Server clears cookie

### 3. State Management
- No localStorage usage
- Tokens stored securely in HTTP-only cookies
- Redux state tracks user info and auth status
- `AuthProvider` checks auth on app initialization

## Security Benefits

1. **XSS Protection**: HTTP-only cookies can't be accessed by malicious scripts
2. **CSRF Protection**: SameSite flag prevents cross-site request forgery
3. **Secure Transport**: Secure flag ensures HTTPS-only transmission
4. **Automatic Expiry**: Cookies can have built-in expiration
5. **Domain Restriction**: Cookies are bound to specific domain

## Development vs Production

### Development (HTTP)
```javascript
// Cookie settings for development
{
  httpOnly: true,
  secure: false, // Allow HTTP in development
  sameSite: 'lax'
}
```

### Production (HTTPS)
```javascript
// Cookie settings for production
{
  httpOnly: true,
  secure: true, // Require HTTPS
  sameSite: 'strict'
}
```

## Migration from localStorage

### Changes Made:
1. ✅ Removed all `localStorage.getItem('token')` calls
2. ✅ Removed all `localStorage.setItem('token', ...)` calls  
3. ✅ Removed all `localStorage.removeItem('token')` calls
4. ✅ Added `withCredentials: true` to axios config
5. ✅ Updated auth state management
6. ✅ Added `AuthProvider` for initialization
7. ✅ Updated logout functionality

### Files Modified:
- `src/store/slices/authSlice.js`
- `src/services/api.js`
- `src/hooks/useAuth.js`
- `src/components/common/AuthProvider.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/App.jsx`

## Testing

To test the cookie-based authentication:

1. **Login**: Check browser dev tools → Application → Cookies
2. **API Calls**: Verify cookies are sent in request headers
3. **Logout**: Confirm cookies are cleared
4. **Refresh**: Auth state should persist across page reloads
5. **Expiry**: Test cookie expiration handling
