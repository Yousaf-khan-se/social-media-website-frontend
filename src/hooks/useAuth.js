import { useSelector } from 'react-redux'

export const useAuth = () => {
    const { user, isAuthenticated, isLoading, error, initialized } = useSelector(state => state.auth)

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        initialized,
    }
}
