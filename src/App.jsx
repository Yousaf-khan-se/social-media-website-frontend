import React from 'react'
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
import { PostPage } from './pages/PostPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { Toaster } from './components/ui/toaster'
import './App.css'
import Messaging from './pages/Messaging'

function App() {
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
              <Route path="profile" element={
                <ProtectedRoute>
                  <ProfilePage />
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
                  <h1 className='text-2xl font-bold text-center pt-20'>Under Development ...</h1>
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
