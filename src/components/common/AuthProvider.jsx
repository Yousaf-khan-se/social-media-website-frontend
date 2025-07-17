import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from '@/store/slices/authSlice'

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch()
    const { isLoading, initialized } = useSelector(state => state.auth)

    useEffect(() => {
        dispatch(checkAuth())
        // Only run once on mount
        // eslint-disable-next-line
    }, [])

    // Show loading screen only during initial auth check
    if (!initialized && isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return children
}
