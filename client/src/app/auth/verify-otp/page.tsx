'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OTPInput } from '@/components/auth/OTPInput';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyOTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'email';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerify = async () => {
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/otp/verify-otp', {
                email,
                otp,
                type,
            });

            if (response.data.success) {
                setSuccess('Email verified! Redirecting to complete registration...');
                setTimeout(() => {
                    router.push(`/auth/register?email=${email}&verified=true`);
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/otp/resend-otp', {
                email,
                type,
            });

            if (response.data.success) {
                setSuccess('OTP resent successfully!');
                setOtp('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit code to<br />
                        <span className="font-semibold text-foreground">{email}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* OTP Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-center block">
                            Enter Verification Code
                        </label>
                        <OTPInput
                            value={otp}
                            onChange={setOtp}
                            disabled={loading}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Verify Button */}
                    <Button
                        onClick={handleVerify}
                        disabled={otp.length !== 6 || loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </Button>

                    {/* Resend Button */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the code?
                        </p>
                        <Button
                            variant="ghost"
                            onClick={handleResend}
                            disabled={resending}
                            className="text-green-600 dark:text-green-400"
                        >
                            {resending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resending...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend Code
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Back to Login */}
                    <div className="text-center">
                        <Button
                            variant="link"
                            onClick={() => router.push('/auth/login')}
                            className="text-sm"
                        >
                            Back to Login
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
