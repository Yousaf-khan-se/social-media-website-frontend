import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children }) => {
    const { user, initialized } = useSelector(state => state.auth)

    if (!initialized) {
        // Wait for auth check to complete
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        // Not authenticated after check, redirect to login
        return <Navigate to="/login" replace />
    }

    return children
}
