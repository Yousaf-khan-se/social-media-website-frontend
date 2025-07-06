import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, initialized } = useSelector(state => state.auth)

    if (!initialized) {
        // Wait for auth check to complete
        return null
    }

    if (!isAuthenticated) {
        // Not authenticated after check, redirect to login
        return <Navigate to="/login" replace />
    }

    return children
}
