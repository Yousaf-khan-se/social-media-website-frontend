# deployment link

https://social-media-website-frontend-pied.vercel.app/


# Social Media Platform Frontend

A modern, responsive social media platform built with React, Redux Toolkit, and ShadCN UI components.

## 🚀 Features

- **Modern UI/UX**: Built with ShadCN UI components for a consistent, beautiful design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **State Management**: Redux Toolkit with Redux Thunk for efficient state management
- **Routing**: React Router for seamless navigation
- **Authentication**: Complete auth flow with login, register, and protected routes
- **Real-time Features**: Ready for notifications and real-time updates
- **Modular Architecture**: Well-organized, scalable code structure

## 🛠️ Tech Stack

- **React 19** - UI Library
- **Redux Toolkit** - State Management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **ShadCN UI** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # ShadCN UI components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   └── ...
│   ├── layout/               # Layout components
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── features/             # Feature-specific components
│   │   ├── auth/
│   │   ├── posts/
│   │   ├── profile/
│   │   └── notifications/
│   └── common/               # Shared components
│       └── ProtectedRoute.jsx
├── pages/                    # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── ExplorePage.jsx
│   └── NotificationsPage.jsx
├── store/                    # Redux store
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── postsSlice.js
│       ├── profileSlice.js
│       └── notificationsSlice.js
├── services/                 # API services
│   ├── api.js
│   ├── authService.js
│   ├── postsService.js
│   ├── profileService.js
│   └── notificationService.js
├── hooks/                    # Custom hooks
│   └── useAuth.js
├── utils/                    # Utility functions
│   └── constants.js
├── lib/                      # Library utilities
│   └── utils.js
├── App.jsx
├── main.jsx
├── index.css
└── App.css
```

## 🎨 Design Features

- **Sidebar Navigation**: Modern sidebar with collapsible design
- **Dark/Light Mode**: Built-in theme support via CSS variables
- **Responsive Layout**: Adapts to different screen sizes
- **Intuitive UI**: Clean, modern interface with consistent spacing
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔧 Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=SocialApp
   VITE_APP_VERSION=1.0.0
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Authentication

The app includes a complete authentication system:

- **Login/Register**: Forms with validation
- **Protected Routes**: Automatic redirection for unauthorized users
- **Token Management**: Automatic token refresh and logout
- **Persistent State**: User state persists across browser sessions

## 🛡️ State Management

Redux Toolkit is used for state management with the following slices:

- **authSlice**: User authentication and profile
- **postsSlice**: Posts, likes, comments
- **profileSlice**: User profiles and following
- **notificationsSlice**: Notifications and alerts

## 📱 Components

### UI Components (ShadCN)
- Button, Card, Input, Avatar
- ScrollArea, Separator
- Dialog, DropdownMenu, Toast (ready to add)

### Layout Components
- **Layout**: Main app layout with sidebar
- **Sidebar**: Collapsible navigation sidebar
- **ProtectedRoute**: Route protection wrapper

### Feature Components
- **PostCard**: Individual post display
- **CreatePostCard**: Post creation form
- **LoginForm**: Authentication form
- **RegisterForm**: User registration form

## 🌐 API Integration

All API calls are handled through service files:

- **authService**: Login, register, logout
- **postsService**: CRUD operations for posts
- **profileService**: User profile management
- **notificationService**: Notifications handling

## 📊 Key Features

1. **Responsive Design**: Works on all screen sizes
2. **Modern UI**: ShadCN components with Tailwind CSS
3. **State Management**: Redux Toolkit for predictable state
4. **Authentication**: Complete auth flow with JWT
5. **Real-time Ready**: Structure ready for WebSocket integration
6. **Error Handling**: Comprehensive error handling throughout
7. **Loading States**: Loading indicators for better UX
8. **Accessibility**: ARIA labels and keyboard navigation

## 🎯 Development Guidelines

- **Component Structure**: Each component has a single responsibility
- **State Management**: Use Redux for global state, local state for component-specific data
- **API Calls**: All API calls go through service files
- **Styling**: Use Tailwind CSS classes and ShadCN components
- **Error Handling**: Always handle errors gracefully with user feedback

## 🔄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Follow the existing code structure
2. Use consistent naming conventions
3. Add proper error handling
4. Include loading states for async operations
5. Test components thoroughly

## 📄 License

This project is open source and available under the [MIT License](LICENSE).+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
