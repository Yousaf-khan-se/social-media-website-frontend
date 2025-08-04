import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import NotificationManager from './components/common/NotificationManager'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { ExplorePage } from './pages/ExplorePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { UserProfilePage } from './pages/UserProfilePage'
import { PostPage } from './pages/PostPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { Toaster } from './components/ui/toaster'
import './App.css'
import Messaging from './pages/Messaging'
import SettingsPage from './pages/SettingsPage'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSettings } from './store/slices/settingsSlice'
import { fetchNotifications } from './store/slices/notificationsSlice'

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
    <Router>
      <NotificationManager>
        <div className="min-h-screen bg-background text-foreground">
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
          <Toaster />
        </div>
      </NotificationManager>
    </Router>
  )
}

export default App
