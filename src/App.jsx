import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import NotificationManager from './components/common/NotificationManager'
import ErrorBoundary from './components/common/ErrorBoundary'
import { Toaster } from './components/ui/toaster'
import './App.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSettings } from './store/slices/settingsSlice'
import { fetchNotifications } from './store/slices/notificationsSlice'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })))
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })))
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(module => ({ default: module.ExplorePage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then(module => ({ default: module.UserProfilePage })))
const PostPage = lazy(() => import('./pages/PostPage').then(module => ({ default: module.PostPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })))
const Messaging = lazy(() => import('./pages/Messaging'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
)

function App() {

  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSettings());
    }
  }, [isAuthenticated, dispatch])

  // Load notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }))
  }, [dispatch])

  return (
    <ErrorBoundary>
      <Router>
        <NotificationManager>
          <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="explore" element={
                    <ProtectedRoute>
                      <ExplorePage />
                    </ProtectedRoute>
                  } />
                  <Route path="notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="user/:userId" element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="post/:postId" element={
                    <ProtectedRoute>
                      <PostPage />
                    </ProtectedRoute>
                  } />
                  <Route path="messages" element={
                    <ProtectedRoute>
                      <Messaging />
                    </ProtectedRoute>
                  }
                  />
                  <Route path="settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </NotificationManager>
      </Router>
    </ErrorBoundary>
  )
}

export default App
