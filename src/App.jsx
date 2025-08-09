import React, { useEffect, Suspense, lazy, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import NotificationManager from './components/common/NotificationManager'
import ServiceWorkerNavigationHandler from './components/common/ServiceWorkerNavigationHandler'
import ErrorBoundary from './components/common/ErrorBoundary'
import { Toaster } from './components/ui/toaster'
import './App.css'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSettings } from './store/slices/settingsSlice'
import { fetchNotifications } from './store/slices/notificationsSlice'
import ForgetPassword from './pages/ForgetPassword'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { useToast } from './hooks/use-toast'
import { CheckCircle, Loader2, X } from 'lucide-react'
import { clearPostDeletionError, clearPostDeletionSuccess, clearPostEditError, clearPostEditSuccess } from './store/slices/postsSlice'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })))
const PostPage = lazy(() => import('./pages/PostPage').then(m => ({ default: m.PostPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
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
  const { toast } = useToast();
  const { isDeletingPost, postDeletionError, postDeletionSuccess, isEditingPost, postEditError, postEditSuccess } = useSelector(state => state.posts)

  // Use useRef to persist the toast reference across renders
  const deletionToastRef = useRef(null);
  const editToastRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSettings());
    }
  }, [isAuthenticated, dispatch])

  // Load notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }))
  }, [dispatch])

  useEffect(() => {
    if (isDeletingPost) {
      // Create the deletion toast immediately
      deletionToastRef.current = toast({
        title: "Post Deleting",
        description: "Your post is being deleted...",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      })
    }
    if (deletionToastRef.current) {
      if (postDeletionSuccess) {
        deletionToastRef.current.update({
          title: "Post Deleted",
          description: "Your post has been deleted successfully.",
          icon: <CheckCircle className="h-4 w-4" />,
          variant: 'success'
        })

        dispatch(clearPostDeletionSuccess())
      }

      if (postDeletionError) {
        deletionToastRef.current.update({
          title: "Post Deletion Failed",
          description: "Failed to delete post. Please try again.",
          icon: <X className="h-4 w-4" />,
          variant: 'destructive'
        })

        dispatch(clearPostDeletionError())
      }

      setTimeout(() => {
        deletionToastRef.current.dismiss();
      }, 2000)
    }
  }, [isDeletingPost, toast, postDeletionSuccess, postDeletionError, dispatch])

  useEffect(() => {
    if (isEditingPost) {
      // Create the edit toast immediately
      editToastRef.current = toast({
        title: "Post Updating",
        description: "Your post is being updated...",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      })
    }
    if (editToastRef.current) {
      if (postEditSuccess) {
        editToastRef.current.update({
          title: "Post Updated",
          description: "Your post has been updated successfully.",
          icon: <CheckCircle className="h-4 w-4" />,
          variant: 'success',
          duration: 2000
        })

        dispatch(clearPostEditSuccess())
      }

      if (postEditError) {
        editToastRef.current.update({
          title: "Post Update Failed",
          description: "Failed to update post. Please try again.",
          icon: <X className="h-4 w-4" />,
          variant: 'destructive',
          duration: 2000
        })

        dispatch(clearPostEditError())
      }
    }
  }, [isEditingPost, toast, postEditSuccess, postEditError, dispatch])

  return (
    <ErrorBoundary>
      <Router>
        <ServiceWorkerNavigationHandler />
        <NotificationManager>
          <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/reset-password/:otp/:username/:email" element={<ResetPasswordPage />} />
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
