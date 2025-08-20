# 🔗 Deployment Links

- **Current Live URL**: https://hash-by-m-yousaf.vercel.app/
- **Original URL**: https://social-media-website-frontend-pied.vercel.app/ (redirects to current)

# Hash - Social Media Platform Frontend

A comprehensive, feature-rich social media platform built with modern web technologies. This platform provides users with a complete social networking experience including posts, messaging, notifications, rich text editing, and real-time communication.

## ✨ Key Features Overview

### 🎨 **Rich Content Creation**
- **Advanced Text Editor**: TipTap-powered rich text editor with 15+ formatting options
- **Media Support**: Image and video uploads with drag-and-drop functionality
- **Emoji Integration**: Comprehensive emoji picker with 500+ emojis
- **Link Management**: Smart link detection and embedding
- **Content Security**: HTML sanitization and XSS protection

### 💬 **Real-time Messaging System**
- **Live Chat**: Socket.io-powered real-time messaging
- **Group Chats**: Create and manage group conversations
- **Chat Permissions**: Request-based chat system for privacy
- **Online Status**: Real-time user presence indicators
- **Typing Indicators**: Live typing notifications
- **Message Management**: Edit, delete, and mark messages as seen
- **Media Sharing**: Send images and files in chats

### 🔔 **Advanced Notification System**
- **Push Notifications**: Firebase-powered web push notifications
- **In-app Alerts**: Real-time notification management
- **Notification Settings**: Granular notification preferences
- **Background Support**: Service worker for offline notifications
- **Smart Routing**: Click-to-navigate notification actions

### 👤 **Complete User Management**
- **Authentication**: Secure JWT-based auth with password reset
- **Profile Management**: Comprehensive user profiles with media
- **Follow System**: Follow/unfollow users with privacy controls
- **Security Settings**: Two-factor authentication and login alerts

### 📱 **Social Interaction Features**
- **Posts & Feeds**: Create, edit, and delete posts with rich media
- **Engagement**: Like, comment, and share functionality
- **Explore Page**: Discover trending content and users
- **User Profiles**: View and follow other users
- **Comments System**: Nested comments with replies

## 🛠️ Technology Stack

### **Frontend Framework**
- **React 18** - Modern UI library with hooks and suspense
- **Vite** - Lightning-fast build tool and dev server
- **JavaScript** - ES6+ modern JavaScript features

### **State Management & Routing**
- **Redux Toolkit** - Predictable state management
- **React Router v6** - Declarative routing with lazy loading
- **Redux Thunk** - Async action handling

### **UI & Styling**
- **ShadCN UI** - Modern, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Radix UI** - Unstyled, accessible UI primitives

### **Real-time & Communication**
- **Socket.io Client** - WebSocket-based real-time communication
- **Firebase** - Push notifications and cloud messaging
- **Axios** - HTTP client for API communication

### **Rich Text & Media**
- **TipTap** - Extensible rich text editor
- **DOMPurify** - HTML sanitization for security
- **Embla Carousel** - Touch-friendly carousels for media

### **Forms & Validation**
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Form Components** - Reusable form field components

### **Development & Testing**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefixing

## 🏗️ Project Architecture

### **Core Structure**
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # ShadCN UI components (buttons, cards, inputs)
│   ├── layout/          # Layout components (sidebar, navigation)
│   ├── common/          # Shared components (auth, error boundaries)
│   ├── features/        # Feature-specific components
│   └── editor/          # Rich text editor components
├── pages/               # Route-based page components
├── store/               # Redux store and slices
├── services/            # API and external service integrations
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and constants
├── styles/              # Global styles and CSS modules
└── assets/              # Static assets and media
```

### **Component Architecture**

#### **UI Components (ShadCN)**
- **Interactive**: Button, Input, Switch, Slider, Dropdown Menu
- **Layout**: Card, Separator, ScrollArea, Avatar
- **Feedback**: Toast, Alert Dialog, Badge
- **Navigation**: Context Menu, Navigation Menu

#### **Layout Components**
- **Layout**: Main application shell with responsive design
- **Sidebar**: Collapsible navigation with active state management
- **BottomNav**: Mobile-optimized navigation bar
- **ProtectedRoute**: Authentication-based route protection

#### **Feature Components**

**Posts System**
- **CreatePostCard**: Rich post creation with media upload
- **PostCard**: Interactive post display with engagement features
- **CommentCard**: Comment display with nested reply support
- **CommentReplyCard**: Reply management and threading

**Messaging System**
- **ChatWindow**: Real-time chat interface with typing indicators
- **ChatList**: Chat overview with unread counts and search
- **MessageBubble**: Individual message display with media support
- **MessageInput**: Message composition with file attachment
- **NewChatDialog**: User selection and group chat creation

**Settings & Preferences**
- **NotificationSettings**: Granular notification control
- **SecuritySettings**: Password and 2FA management
- **ProfileSettings**: User information and privacy controls

### **State Management Structure**

#### **Redux Slices**
- **authSlice**: User authentication, registration, and profile management
- **postsSlice**: Post CRUD operations, likes, comments, and media uploads
- **chatSlice**: Real-time messaging, chat management, and user presence
- **notificationsSlice**: Push notifications, in-app alerts, and preferences
- **profileSlice**: User profiles, following system, and user discovery
- **settingsSlice**: Application settings and user preferences

#### **Selectors**
- **profileListSelectors**: Optimized user list queries for chat and mentions

## 🔐 Authentication & Security

### **Authentication Flow**
- **Registration**: Multi-step user registration with validation
- **Login**: Email/username login with remember me functionality
- **Password Reset**: OTP-based password recovery system
- **Protected Routes**: Automatic redirection for unauthorized access
- **Session Management**: JWT token handling with automatic refresh

### **Security Features**
- **Input Sanitization**: DOMPurify integration for XSS prevention
- **Content Validation**: Comprehensive input validation and length limits
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Headers**: Content security policy and secure communication

## 💬 Real-time Communication

### **WebSocket Integration**
- **Socket.io Client**: Real-time bidirectional communication
- **Connection Management**: Automatic reconnection and error handling
- **Room Management**: Chat room joining and leaving
- **Event Handling**: Message, typing, and presence events

### **Messaging Features**
- **Direct Messages**: One-on-one private conversations
- **Group Chats**: Multi-user chat rooms with member management
- **Chat Permissions**: Request-based chat initiation for privacy
- **Media Sharing**: Image and file sharing in conversations
- **Message Status**: Delivery and read receipt tracking
- **Typing Indicators**: Real-time typing status for active users

### **Online Presence**
- **User Status**: Online/offline status tracking
- **Last Seen**: User activity timestamps
- **Presence Broadcasting**: Real-time presence updates across the platform

## 🔔 Notification System

### **Push Notifications**
- **Firebase Integration**: Web push notification support
- **Service Worker**: Background notification handling
- **Notification Actions**: Interactive notification buttons
- **Smart Routing**: Click-to-navigate functionality

### **In-app Notifications**
- **Real-time Alerts**: Socket.io-powered live notifications
- **Notification Types**: Posts, messages, follows, and system alerts
- **Notification Center**: Centralized notification management
- **Read Status**: Mark as read/unread functionality

### **Notification Settings**
- **Granular Controls**: Per-type notification preferences
- **Delivery Methods**: Push, in-app, and email notification options
- **Quiet Hours**: Time-based notification scheduling
- **Device Management**: Per-device notification settings

## 📝 Rich Text Editor

### **TipTap Integration**
- **WYSIWYG Editing**: Rich text editing with live preview
- **Toolbar Features**: Bold, italic, underline, strikethrough, colors
- **Content Structure**: Headings, lists, blockquotes, text alignment
- **Media Embedding**: Images, videos, and YouTube integration
- **Link Management**: URL detection and custom link creation

### **Advanced Features**
- **Emoji Picker**: 500+ emojis organized by categories
- **@Mentions**: User tagging with autocomplete
- **Content Validation**: Length limits and content safety checks
- **Auto-save**: Draft saving and recovery
- **Keyboard Shortcuts**: Standard formatting shortcuts

### **Security & Performance**
- **HTML Sanitization**: Safe content rendering
- **Content Optimization**: Automatic media resizing
- **Lazy Loading**: Performance-optimized content loading

## 📱 Responsive Design

### **Mobile-First Approach**
- **Breakpoint System**: Tailwind CSS responsive utilities
- **Touch Interactions**: Optimized for mobile touch interfaces
- **Performance**: Optimized for mobile networks and devices

### **Cross-Platform Support**
- **Progressive Web App**: PWA features for app-like experience
- **Service Worker**: Offline support and caching strategies
- **Responsive Images**: Adaptive image loading based on screen size

## 🔧 API Integration

### **Service Layer Architecture**
- **api.js**: Centralized HTTP client with interceptors
- **Authentication Service**: Login, registration, and token management
- **Posts Service**: Post CRUD operations and media uploads
- **Messaging Service**: Chat and message management
- **Notification Service**: Push notification registration and management

### **Error Handling**
- **Global Error Boundary**: React error boundary for crash prevention
- **API Error Handling**: Standardized error response processing
- **User Feedback**: Toast notifications for user actions
- **Retry Logic**: Automatic retry for failed requests

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ and npm/yarn
- Modern web browser with WebSocket support
- Internet connection for Firebase services

### **Installation**

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file in the root directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   
   # App Configuration
   VITE_APP_NAME=Hash
   VITE_APP_VERSION=1.0.0
   VITE_WEBSITE_DOMAIN=http://localhost:5173
   
   # Firebase Configuration (for push notifications)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   npm run preview  # Preview production build locally
   ```

### **Available Scripts**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 📱 Core Application Features

### **Home Feed**
- **Personalized Timeline**: Algorithm-based post feed from followed users
- **Infinite Scroll**: Smooth, performant content loading
- **Create Post**: Rich text editor with media upload support
- **Post Interactions**: Like, comment, share, and bookmark functionality
- **Real-time Updates**: Live post updates and engagement counters

### **Explore Page**
- **Trending Posts**: Popular content discovery
- **User Discovery**: Find and follow new users
- **Search Functionality**: Search users, posts, and content
- **Trending Topics**: Hashtag and topic exploration

### **Profile Management**
- **Personal Profile**: Edit bio, profile picture, and personal information
- **User Profiles**: View other users' profiles and posts
- **Follow System**: Follow/unfollow users with privacy controls
- **Activity Feed**: Track your likes, comments, and interactions

### **Messaging System**
- **Chat Interface**: Clean, WhatsApp-like messaging experience
- **Group Chats**: Create and manage group conversations
- **Media Sharing**: Send images, videos, and files
- **Chat Permissions**: Request-based messaging for privacy
- **Online Status**: See when users are online or last active

### **Notifications Center**
- **Activity Notifications**: Likes, comments, follows, and mentions
- **Message Notifications**: New chat messages and group updates
- **System Notifications**: Account and security alerts
- **Push Notifications**: Browser notifications when app is closed

### **Settings & Preferences**
- **Account Settings**: Password, email, and profile management
- **Privacy Controls**: Manage who can message and follow you
- **Notification Settings**: Customize notification preferences
- **Security Settings**: Two-factor authentication and login alerts

## 🎨 User Interface & Design

### **Design System**
- **Modern Aesthetic**: Clean, minimalist design with intuitive navigation
- **Consistent Components**: ShadCN UI library for unified look and feel
- **Color Scheme**: Carefully chosen color palette with proper contrast
- **Typography**: Readable fonts with proper hierarchy
- **Spacing**: Consistent spacing system using Tailwind CSS

### **Responsive Design**
- **Mobile-First**: Optimized for mobile devices with touch-friendly interfaces
- **Tablet Support**: Adapted layouts for medium-sized screens
- **Desktop Experience**: Full-featured desktop interface with sidebar navigation
- **Progressive Enhancement**: Core functionality works across all devices

### **Accessibility Features**
- **ARIA Labels**: Screen reader support for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility for power users
- **Color Contrast**: WCAG-compliant color combinations
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: Proper alt text for images and media

### **Performance Optimization**
- **Code Splitting**: Lazy loading for improved initial load times
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Optimization**: Tree shaking and dependency optimization
- **Caching Strategy**: Intelligent caching for static assets

## 🔧 Advanced Features

### **Rich Text Editor Capabilities**
- **Formatting Options**: Bold, italic, underline, strikethrough, colors
- **Content Structure**: Headings, lists, blockquotes, text alignment
- **Media Integration**: Drag-and-drop image and video uploads
- **Link Management**: Smart link detection and custom URL insertion
- **Emoji Support**: Comprehensive emoji picker with search
- **Content Safety**: HTML sanitization and XSS protection

### **Real-time Communication**
- **WebSocket Connection**: Persistent connection for instant updates
- **Typing Indicators**: See when others are typing in real-time
- **Message Status**: Delivery and read receipts for messages
- **Presence System**: Online/offline status with last seen timestamps
- **Connection Recovery**: Automatic reconnection on network issues

### **Push Notification System**
- **Firebase Integration**: Reliable push notification delivery
- **Service Worker**: Background notification handling
- **Notification Categories**: Different types for posts, messages, follows
- **Interactive Actions**: Reply, like, or view directly from notifications
- **Permission Management**: Granular notification preferences

### **Media Management**
- **File Upload**: Support for images, videos, and documents
- **Image Processing**: Automatic resizing and optimization
- **Media Carousel**: Swipeable media galleries in posts
- **Thumbnail Generation**: Preview images for videos and files
- **Storage Integration**: Efficient media storage and retrieval

## 🛡️ Security & Performance

### **Security Measures**
- **Authentication**: JWT-based authentication with secure token handling
- **Input Validation**: Comprehensive validation on all user inputs
- **XSS Prevention**: Content sanitization using DOMPurify
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Communication**: HTTPS enforcement and secure headers

### **Performance Features**
- **Lazy Loading**: Components and images load only when needed
- **Virtualization**: Efficient rendering of large lists and feeds
- **Memoization**: React.memo and useMemo for expensive computations
- **Bundle Splitting**: Separate chunks for faster loading
- **Service Worker**: Caching and offline functionality

### **Error Handling**
- **Error Boundaries**: React error boundaries to prevent crashes
- **Global Error Handler**: Centralized error logging and reporting
- **User Feedback**: Informative error messages and recovery suggestions
- **Retry Logic**: Automatic retry for failed network requests
- **Fallback UI**: Graceful degradation when features are unavailable

## 🔍 Testing & Quality Assurance

### **Code Quality**
- **ESLint Configuration**: Comprehensive linting rules for code consistency
- **Prettier Integration**: Automatic code formatting
- **Type Safety**: PropTypes for runtime type checking
- **Component Structure**: Consistent component patterns and naming

### **Browser Compatibility**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge support
- **Progressive Enhancement**: Core functionality for older browsers
- **Polyfills**: Necessary polyfills for missing features
- **Mobile Browsers**: Optimized for mobile web browsers

## 📊 Analytics & Monitoring

### **User Experience Monitoring**
- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Real-time error monitoring and alerting
- **User Behavior**: Interaction tracking for UX improvements
- **Load Times**: Page load and component render times

### **Application Health**
- **API Response Times**: Monitor backend communication
- **WebSocket Connection**: Real-time connection health monitoring
- **Notification Delivery**: Push notification success rates
- **Feature Usage**: Track feature adoption and usage patterns

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```
Creates optimized production build in the `dist` directory.

### **Vercel Deployment**
The application is deployed on Vercel with automatic deployments from the main branch.

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: 18.x

### **Environment Variables for Production**
Configure the following environment variables in your deployment platform:
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL
- Firebase configuration variables
- `VITE_WEBSITE_DOMAIN` - Production domain

## 🔧 Development Guidelines

### **Code Structure Best Practices**
- **Component Organization**: Single responsibility principle for all components
- **State Management**: Use Redux for global state, local state for component-specific data
- **API Integration**: All API calls through dedicated service files
- **Styling**: Consistent use of Tailwind CSS and ShadCN components
- **Error Handling**: Comprehensive error handling with user feedback

### **Component Development**
```jsx
// Example component structure
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const ExampleComponent = ({ prop1, prop2 }) => {
  const dispatch = useDispatch()
  const { data, loading, error } = useSelector(state => state.example)
  const { toast } = useToast()

  // Component logic here

  return (
    <div className="p-4">
      {/* Component JSX */}
    </div>
  )
}

export default ExampleComponent
```

### **State Management Patterns**
```js
// Redux slice example
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

export const fetchData = createAsyncThunk(
  'example/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/endpoint', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: error.message })
    }
  }
)

const exampleSlice = createSlice({
  name: 'example',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = exampleSlice.actions
export default exampleSlice.reducer
```

### **API Service Pattern**
```js
// Service file example
import api from './api'

class ExampleService {
  async getData(params) {
    const response = await api.get('/endpoint', { params })
    return response.data
  }

  async createData(data) {
    const response = await api.post('/endpoint', data)
    return response.data
  }

  async updateData(id, data) {
    const response = await api.put(`/endpoint/${id}`, data)
    return response.data
  }

  async deleteData(id) {
    const response = await api.delete(`/endpoint/${id}`)
    return response.data
  }
}

export default new ExampleService()
```

## 🤝 Contributing

### **Development Workflow**
1. **Fork & Clone**: Fork the repository and clone your fork
2. **Branch**: Create a feature branch from main
3. **Develop**: Make your changes following the coding standards
4. **Test**: Ensure all features work correctly
5. **Commit**: Use conventional commit messages
6. **Pull Request**: Submit PR with detailed description

### **Coding Standards**
- **ESLint Rules**: Follow the configured ESLint rules
- **Component Names**: Use PascalCase for component names
- **File Organization**: Group related files in appropriate directories
- **Import Order**: Third-party imports, then local imports
- **Props Validation**: Use PropTypes for component props

### **Commit Message Format**
```
type(scope): description

feat(auth): add password reset functionality
fix(chat): resolve message duplication issue
docs(readme): update installation instructions
style(ui): improve button hover states
```

## 🐛 Troubleshooting

### **Common Issues**

**Development Server Won't Start**
- Check Node.js version (16+ required)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Build Failures**
- Check for TypeScript/ESLint errors
- Verify all environment variables are set
- Ensure all dependencies are installed

**WebSocket Connection Issues**
- Verify backend server is running
- Check CORS configuration
- Confirm WebSocket URL in environment variables

**Push Notifications Not Working**
- Verify Firebase configuration
- Check service worker registration
- Ensure HTTPS for production (required for push notifications)

**Styling Issues**
- Clear browser cache
- Check Tailwind CSS compilation
- Verify CSS variable definitions

### **Performance Issues**
- Use React DevTools Profiler to identify bottlenecks
- Check for memory leaks with useEffect cleanup
- Optimize large lists with virtualization
- Review bundle size with build analyzer

## 📋 Future Enhancements

### **Planned Features**
- **Dark Mode**: Complete dark theme implementation
- **Voice Messages**: Audio message support in chat
- **Video Calls**: WebRTC-based video calling
- **Story Feature**: Instagram-like story functionality
- **Advanced Search**: Full-text search with filters
- **Content Moderation**: AI-powered content filtering
- **Analytics Dashboard**: User engagement analytics
- **Mobile App**: React Native companion app

### **Technical Improvements**
- **TypeScript Migration**: Gradual migration to TypeScript
- **Testing Suite**: Comprehensive test coverage
- **Micro-frontends**: Module federation architecture
- **Performance Monitoring**: Real-time performance tracking
- **A/B Testing**: Feature flag implementation
- **Internationalization**: Multi-language support

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Team & Acknowledgments

### **Development Team**
- **Frontend Developer**: Muhammad Yousaf
- **Project Type**: Internship Project
- **Platform**: Social Media Application

### **Technologies Used**
Special thanks to the open-source community and the following technologies:
- React.js and the React ecosystem
- Redux Toolkit for state management
- ShadCN UI for component library
- TipTap for rich text editing
- Socket.io for real-time communication
- Firebase for push notifications
- Vercel for deployment and hosting

## 📞 Support & Contact

### **Getting Help**
- **Documentation**: Check this README for comprehensive information
- **Issues**: Report bugs or request features via GitHub issues
- **Community**: Join our development community discussions

### **Contact Information**
- **Repository**: GitHub repository link
- **Developer**: Muhammad Yousaf
- **Project Status**: Active Development

---

**Hash** - Connecting people through meaningful conversations and shared experiences. Built with modern web technologies for a fast, secure, and engaging social media experience.
