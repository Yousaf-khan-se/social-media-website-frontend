import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearError, login } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const LoginPage = () => {
    const dispatch = useDispatch()
    const { isAuthenticated, isLoading, error, initialized } = useSelector(state => state.auth)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        identifier: '', // can be email or username
        password: ''
    })

    const navigate = useNavigate();

    // Show loading spinner if auth check is not done yet
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Checking authentication...</p>
                </div>
            </div>
        )
    }

    // Only redirect if initialized and authenticated
    if (initialized && isAuthenticated) {
        navigate('/', { replace: true })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const { identifier, password } = formData
        // Simple check: if identifier contains '@', treat as email, else username
        const payload = identifier.includes('@')
            ? { email: identifier, password }
            : { username: identifier, password }
        dispatch(login(payload))
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Hash className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="identifier" className="text-sm font-medium">
                                Email or Username
                            </label>
                            <Input
                                id="identifier"
                                name="identifier"
                                type="text"
                                placeholder="Enter your email or username"
                                autocomplete="username"
                                value={formData.identifier}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    autocomplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        {error && (
                            <div className="text-sm text-destructive">
                                {Array.isArray(error?.details?.errors)
                                    ? error.details.errors.map((err, idx) => (
                                        <div key={idx}>{err}</div>
                                    ))
                                    : error?.error || error?.message || (typeof error === 'string' ? error : 'Login failed')}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <a
                            onClick={(e) => {
                                e.preventDefault()
                                dispatch(clearError())
                                navigate('/register', { replace: true })
                            }}
                            className="text-primary hover:underline font-medium cursor-pointer"
                        >
                            Sign up
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
