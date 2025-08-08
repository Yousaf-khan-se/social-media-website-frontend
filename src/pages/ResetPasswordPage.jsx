import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearError, clearSuccess, resetPassword } from '@/store/slices/authSlice';

const ResetPasswordPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isLoading, error, success, message, user, initialized } = useSelector(state => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    // Get otp, username, email from params (e.g. /reset-password/:otp/:username/:email)
    const { otp, username, email } = useParams();

    console.log('ResetPasswordPage - URL params:', { otp, username, email });
    console.log('ResetPasswordPage - initialized:', initialized);

    // Timer: 12 minutes (720 seconds)
    const RESET_TIME = 12 * 60;
    const [timer, setTimer] = useState(RESET_TIME);
    const timerRef = useRef();

    // Redirect authenticated users to home
    useEffect(() => {
        if (user && initialized) {
            dispatch(clearError());
            dispatch(clearSuccess());
            navigate('/', { replace: true });
        }
    }, [user, initialized, navigate, dispatch]);

    // Start countdown timer
    useEffect(() => {
        if (timer > 0) {
            timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timer]);

    // Expire/reset page when timer runs out
    useEffect(() => {
        if (timer === 0) {
            toast({
                title: 'Reset Link Expired',
                description: 'Your password reset link has expired. Please request a new one.',
                variant: 'destructive',
                duration: 3000,
                icon: <X className="h-4 w-4" />
            });
            dispatch(clearError());
            dispatch(clearSuccess());
            navigate('/forget-password', { replace: true });
        }
    }, [timer, toast, dispatch, navigate]);

    useEffect(() => {
        if (success) {
            toast({
                title: 'Success!',
                description: message || 'Your password has been reset successfully. Please log in.',
                duration: 3000,
                variant: 'success',
                icon: <CheckCircle className="h-4 w-4" />
            });
            dispatch(clearSuccess());
            dispatch(clearError());
            navigate('/login', { replace: true });
        }
    }, [message, dispatch, navigate, success, toast]);

    // Show error toast if error changes
    useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
                icon: <X className="h-4 w-4" />,
                duration: 3000

            });
        }
    }, [error, toast]);

    // If no otp after initialization, show error and redirect
    useEffect(() => {
        // Only check for otp after the component is fully initialized
        if (initialized && !otp) {
            console.log('No OTP found in URL params, redirecting to login');
            toast({
                title: 'Invalid Request for Password Reset',
                description: 'Invalid Request or Page Expired. Generate a new request or login.',
                variant: 'destructive',
                duration: 3000
            });
            dispatch(clearError());
            dispatch(clearSuccess());
            navigate('/login', { replace: true });
        }
    }, [otp, toast, navigate, initialized, dispatch]);

    // Show loading if auth check is not complete
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect authenticated users
    if (user) {
        return null; // Will be redirected by useEffect
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Passwords do not match.',
                variant: 'destructive',
                duration: 3000,
                icon: <X className="h-4 w-4" />
            });
            return;
        }
        if (!otp) {
            toast({
                title: 'Error',
                description: 'Invalid or missing reset OTP.',
                variant: 'destructive',
                duration: 3000,
                icon: <X className="h-4 w-4" />
            });
            return;
        }

        dispatch(resetPassword({ otp, newPassword: formData.password }));
    };

    // Format timer as mm:ss
    const formatTimer = (t) => {
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Hash className="h-12 w-12 text-primary drop-shadow-lg" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
                    <CardDescription>
                        Set a new password for your account.
                    </CardDescription>
                    {(username || email) && (
                        <div className="flex flex-col items-center mt-2 text-sm text-muted-foreground">
                            <span>
                                Resetting password for{' '}
                                <span className="font-semibold text-primary">{username + '/' + email}</span>
                            </span>
                            <span className="flex items-center gap-1 mt-1">
                                <span className="font-mono tracking-widest text-base text-primary">{formatTimer(timer)}</span>
                                <span className="text-xs">left to reset</span>
                            </span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                New Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
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
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
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
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                            <div className="text-sm text-destructive">
                                Passwords do not match
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Remembered your password? </span>
                        <a
                            onClick={e => {
                                e.preventDefault();
                                dispatch(clearError());
                                dispatch(clearSuccess());
                                navigate('/login', { replace: true });
                            }}
                            className="text-primary hover:underline font-medium cursor-pointer"
                        >
                            Log in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;