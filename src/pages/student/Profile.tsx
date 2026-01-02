import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Save, Loader2, Lock, Camera, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { studentsAPI, authAPI } from '@/lib/api';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();

    // UI State
    const [activeTab, setActiveTab] = useState('general');
    const isSettingsPage = location.pathname.includes('settings');

    // Profile State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '' });
    const [passLoading, setPassLoading] = useState(false);

    // Sync Tab with Route
    useEffect(() => {
        if (location.pathname.includes('settings')) {
            setActiveTab('security');
        } else {
            setActiveTab('general');
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                if (user.role === 'student') {
                    const data = await studentsAPI.getByUserId(user.id);
                    if (data) {
                        setStudentId(data._id);
                        setFormData({
                            name: data.name || user.name,
                            email: data.email || user.email,
                            phone: data.phone || '',
                            address: data.address || ''
                        });
                    }
                } else {
                    setFormData({
                        name: user.name,
                        email: user.email,
                        phone: '',
                        address: ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [id === 'current-password' ? 'current' : 'new']: value
        }));
    };

    const handleSaveProfile = async () => {
        if (!studentId) {
            toast({ title: 'Error', description: 'Cannot update: No student profile found', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            await studentsAPI.update(studentId, {
                phone: formData.phone,
                address: formData.address,
                name: formData.name
            });
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been saved successfully',
            });
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Could not save changes',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePassword = async () => {
        if (!passwords.current || !passwords.new) {
            toast({ title: 'Error', description: 'Please fill in all password fields', variant: 'destructive' });
            return;
        }

        if (passwords.new.length < 6) {
            toast({ title: 'Error', description: 'New password must be at least 6 characters', variant: 'destructive' });
            return;
        }

        setPassLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast({ title: 'Success', description: 'Password updated successfully' });
            setPasswords({ current: '', new: '' });
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Could not update password',
                variant: 'destructive'
            });
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <DashboardLayout
            title={isSettingsPage ? "Settings" : "My Profile"}
            subtitle={isSettingsPage ? "Manage your security preferences" : "Manage your account settings"}
        >
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

                {/* Header Card with Cover Image */}
                <Card className="overflow-hidden border-none shadow-lg">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40 relative">
                        {/* Decorative shape */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    </div>
                    <CardContent className="relative pt-16 pb-8 px-8">
                        <Avatar className="absolute -top-12 left-8 h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                                {formData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">{formData.name || user?.name}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <Badge variant="secondary" className="capitalize px-3 py-1">
                                        {user?.role}
                                    </Badge>
                                    <span>•</span>
                                    <span className="text-sm">{formData.email}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="hidden md:flex">
                                <Camera className="mr-2 h-4 w-4" />
                                Edit Photo
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8 mx-auto md:mx-0 p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger value="general" className="rounded-lg">General Information</TabsTrigger>
                        <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Card className="shadow-md border-muted/40">
                            <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Personal Details</h3>
                                </div>
                                <Separator className="mb-6" />

                                {loading ? (
                                    <div className="flex justify-center py-12"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="pl-10 h-10 bg-muted/20 focus:bg-background transition-colors"
                                                    disabled={user?.role !== 'student'}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="pl-10 h-10 bg-muted/50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+91 98765 43210"
                                                    className="pl-10 h-10 bg-muted/20 focus:bg-background transition-colors"
                                                    disabled={user?.role !== 'student'}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Your address"
                                                    className="pl-10 h-10 bg-muted/20 focus:bg-background transition-colors"
                                                    disabled={user?.role !== 'student'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSaveProfile}
                                        className="w-full md:w-auto min-w-[150px]"
                                        disabled={saving || loading || user?.role !== 'student'}
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Card className="shadow-md border-muted/40 max-w-2xl">
                            <CardContent className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Key className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Password Management</h3>
                                </div>
                                <Separator className="mb-6" />

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="current-password"
                                                type="password"
                                                value={passwords.current}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter current password"
                                                className="pl-10 h-10 bg-muted/20 focus:bg-background"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={passwords.new}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter new password (min. 6 chars)"
                                                className="pl-10 h-10 bg-muted/20 focus:bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSavePassword}
                                        disabled={passLoading}
                                        variant="default" // or destructive for security? keep default
                                        className="w-full md:w-auto min-w-[150px]"
                                    >
                                        {passLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Update Password"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
