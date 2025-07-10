import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { ExplorePage } from './pages/ExplorePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { ProfilePage } from './pages/ProfilePage'
import { PostPage } from './pages/PostPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'
import { CreatePostCard } from './components/features/posts/CreatePostCard'
import { CommentCard } from './components/features/posts/CommentCard'

function App() {
  return (
    <Router>
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
                <h1 className='text-2xl font-bold text-center pt-20'>Coming Soon ...</h1>
              </ProtectedRoute>
            } /><Route path="bookmarks" element={
              <ProtectedRoute>
                <h1 className='text-2xl font-bold text-center pt-20'>Coming Soon ...</h1>
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <h1 className='text-2xl font-bold text-center pt-20'>Under Development ...</h1>
              </ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
