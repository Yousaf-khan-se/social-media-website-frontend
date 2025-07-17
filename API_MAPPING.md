# API Routes Mapping

## Frontend to Backend API Mapping

### Base URL Configuration
- **Frontend**: `https://social-media-website-lovat-gamma.vercel.app/api`
- **Backend**: `https://social-media-website-lovat-gamma.vercel.app`

## ✅ **Base Routes** (2/2 implemented)
| Backend Route | Frontend Service | Function |
|---------------|------------------|----------|
| `GET /` | `healthService.js` | `getApiStatus()` |
| `GET /api/health` | `healthService.js` | `getHealthCheck()` |

## ✅ **Authentication Routes** (8/8 implemented)
| Backend Route | Frontend Service | Function |
|---------------|------------------|----------|
| `POST /api/auth/register` | `authService.js` | `register()` |
| `POST /api/auth/login` | `authService.js` | `login()` |
| `POST /api/auth/refresh` | `authService.js` | `refreshToken()` |
| `POST /api/auth/forgot-password` | `authService.js` | `forgotPassword()` |
| `POST /api/auth/reset-password` | `authService.js` | `resetPassword()` |
| `GET /api/auth/me` | `authService.js` | `getCurrentUser()` |
| `POST /api/auth/logout` | `authService.js` | `logout()` |
| `POST /api/auth/change-password` | `authService.js` | `changePassword()` |

## ✅ **Posts Routes** (10/10 implemented)
| Backend Route | Frontend Service | Function |
|---------------|------------------|----------|
| `POST /api/posts` | `postsService.js` | `createPost()` |
| `GET /api/posts/my-posts` | `postsService.js` | `getMyPosts()` |
| `GET /api/posts/feed` | `postsService.js` | `getFeed()` |
| `GET /api/posts/explore` | `postsService.js` | `getExplorePosts()` |
| `GET /api/posts/search` | `postsService.js` | `searchPosts()` |
| `GET /api/posts/user/:userId` | `postsService.js` | `getUserPosts()` |
| `GET /api/posts/:postId` | `postsService.js` | `getPost()` |
| `PUT /api/posts/:postId` | `postsService.js` | `updatePost()` |
| `DELETE /api/posts/:postId` | `postsService.js` | `deletePost()` |
| `POST /api/posts/:postId/like` | `postsService.js` | `likePost()` / `unlikePost()` |
| `POST /api/posts/:postId/comments` | `postsService.js` | `addComment()` |
| `DELETE /api/posts/:postId/comments/:commentId` | `postsService.js` | `deleteComment()` |

## 📋 **Implementation Summary**
- ✅ **Total Base Routes**: 2/2 (100%)
- ✅ **Authentication Routes**: 8/8 (100%)
- ✅ **Posts Routes**: 10/10 (100%)
- ✅ **Total Active Routes**: 20/20 (100%)

## 🔧 **Configuration**
- **Environment File**: `.env`
- **API Base URL**: `VITE_API_URL=https://social-media-website-lovat-gamma.vercel.app/api`
- **HTTP-only Cookies**: Configured with `withCredentials: true`
- **Authentication**: JWT tokens handled via secure HTTP-only cookies

## 🚀 **Service Files**
- `src/services/api.js` - Axios configuration with interceptors
- `src/services/authService.js` - Authentication endpoints
- `src/services/postsService.js` - Posts and comments endpoints
- `src/services/healthService.js` - Health check endpoints
- `src/services/profileService.js` - Profile management (if needed)
- `src/services/notificationService.js` - Notifications (if needed)
- `src/services/index.js` - Centralized exports

All backend REST API routes are now fully implemented and mapped in your frontend!
