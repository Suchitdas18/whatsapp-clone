'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProfilePage() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await api.put('/users/profile', formData);
            if (response.data.success) {
                updateUser(response.data.data);
                setEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (5MB limit for avatars)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await api.post('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                updateUser({ avatar: response.data.data.avatar });
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        router.push('/auth/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
            <div className="max-w-2xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/chat">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-card rounded-lg shadow-lg border border-border p-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="text-3xl">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                                {uploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Name
                            </label>
                            {editing ? (
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    className="w-full"
                                />
                            ) : (
                                <p className="text-lg font-medium text-foreground">{user.name}</p>
                            )}
                        </div>

                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Email
                            </label>
                            <p className="text-lg text-foreground">{user.email}</p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Bio
                            </label>
                            {editing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Tell us about yourself..."
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    maxLength={150}
                                />
                            ) : (
                                <p className="text-foreground">
                                    {user.bio || 'Hey there! I am using WhatsApp Clone'}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            {editing ? (
                                <>
                                    <Button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData({
                                                name: user.name,
                                                bio: user.bio || '',
                                            });
                                        }}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setEditing(true)} className="w-full">
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 bg-card rounded-lg shadow-lg border border-border p-6">
                    <h2 className="font-semibold text-foreground mb-4">Account Info</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="text-foreground font-medium">
                                {user.isOnline ? (
                                    <span className="text-green-500">● Online</span>
                                ) : (
                                    <span className="text-gray-500">● Offline</span>
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Joined</span>
                            <span className="text-foreground">
                                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
