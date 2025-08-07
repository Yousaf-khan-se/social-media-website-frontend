import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, MailCheck, TimerReset } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { clearError, clearSuccess, forgotPassword, resetOTPdata, resetOTPerror, verifyOTP } from '@/store/slices/authSlice';

const OTP_LENGTH = 6;
const RESEND_INTERVAL = 20; // seconds


const ForgetPassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { toast } = useToast();
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: request OTP, 2: enter OTP
    const [timer, setTimer] = useState(0);
    const otpInputRef = useRef(null);
    const { isLoading, error, success, message, otpVerifying, otpData, otpError, forgotPasswordMailAdress, user, initialized } = useSelector(state => state.auth);

    // Redirect authenticated users to home
    useEffect(() => {
        if (initialized && user) {
            dispatch(clearError());
            dispatch(clearSuccess());
            navigate('/', { replace: true });
        }
    }, [initialized, user, navigate, dispatch]);

    // Timer for resend OTP
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Focus OTP input on step 2
    useEffect(() => {
        if (step === 2 && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);

    // Toast and step logic for error/success
    useEffect(() => {
        if (error || otpError) {
            toast({
                title: 'Error',
                description: error || otpError,
                variant: 'destructive',
                duration: 3000
            });
        }
        if (success) {
            toast({
                title: 'OTP Sent',
                description: message || 'A one-time password has been sent to your email.',
            });
            setStep(2);
            setTimer(RESEND_INTERVAL);
        }
    }, [error, success, message, toast, otpError]);

    useEffect(() => {
        if (otpData) {

            if (!otp || !otpData.username || !otpData.email) {
                toast({
                    title: 'Error',
                    description: 'Missing required data for password reset. Please try again.',
                    variant: 'destructive',
                });
                return;
            }
            toast({
                title: 'OTP Verified',
                description: (otpData.message || 'You can now reset your password.'),
                duration: 3000
            });
            dispatch(clearError());
            dispatch(clearSuccess());
            navigate(`/reset-password/${otp}/${otpData.username}/${otpData.email}`, { replace: true });
        }
    }, [otpData, identifier, navigate, toast, otp, dispatch]);    // Show loading spinner if auth check is not done yet

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


    const handleRequestOtp = async (e) => {
        e.preventDefault();
        dispatch(clearError());
        dispatch(resetOTPdata());
        dispatch(resetOTPerror());
        const payload = identifier.includes('@')
            ? { email: identifier }
            : { username: identifier };
        dispatch(forgotPassword(payload));
    };

    const handleResendOtp = async () => {
        dispatch(clearError());
        dispatch(resetOTPdata());
        dispatch(resetOTPerror());
        const payload = identifier.includes('@')
            ? { email: identifier }
            : { username: identifier };
        dispatch(forgotPassword(payload));
        setTimer(RESEND_INTERVAL);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        dispatch(resetOTPdata());
        dispatch(resetOTPerror());
        if (otp.length !== OTP_LENGTH) {
            toast({
                title: 'Invalid OTP',
                description: 'Please enter a valid 6-digit OTP.',
                variant: 'destructive',
            });
            return;
        }

        dispatch(verifyOTP({ otp, email: forgotPasswordMailAdress }))
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Hash className="h-12 w-12 text-primary drop-shadow-lg" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
                    <CardDescription>
                        {step === 1
                            ? 'Enter your email or username to receive an OTP.'
                            : 'Enter the OTP sent to your email or phone.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
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
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    required
                                    disabled={isLoading || otpVerifying}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full mt-2"
                                disabled={isLoading || !identifier}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                        </form>
                    )}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                            <div className="space-y-2">
                                <label htmlFor="otp" className="text-sm font-medium flex items-center gap-2">
                                    Enter OTP
                                    <MailCheck className="h-4 w-4 text-primary" />
                                </label>
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={OTP_LENGTH}
                                    placeholder="6-digit code"
                                    ref={otpInputRef}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="tracking-widest text-lg text-center font-mono"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full mt-2"
                                disabled={isLoading || otp.length !== OTP_LENGTH || otpVerifying}
                            >
                                {isLoading ? 'Sending OTP...' : otpVerifying ? 'Verifying OTP...' : 'Verify OTP'}
                            </Button>
                            <div className="flex items-center justify-between mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResendOtp}
                                    disabled={timer > 0 || isLoading || otpVerifying}
                                    className="flex items-center gap-1"
                                >
                                    <TimerReset className="h-4 w-4" />
                                    {timer > 0 ? `Resend in ${timer}s` : otpVerifying ? 'Verifying OTP...' : 'Resend OTP'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp('');
                                        dispatch(clearSuccess());
                                    }}
                                    disabled={otpVerifying}
                                >
                                    Change Email/Username
                                </Button>
                            </div>
                        </form>
                    )}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
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

export default ForgetPassword;