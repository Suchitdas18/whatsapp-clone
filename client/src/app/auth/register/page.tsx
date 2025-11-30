'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            if (response.data.success) {
                const { user, token } = response.data.data;
                login(user, token);
                router.push('/chat');
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to register. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground">
                        Join and start chatting with friends
                    </p>
                </div>

                {/* Register Form */}
                <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                                Must be at least 6 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className="w-full"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href="/auth/login"
                                className="text-primary hover:underline font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
