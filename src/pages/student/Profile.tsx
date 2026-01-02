import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: 'Profile Updated',
            description: 'Your profile has been saved successfully',
        });
    };

    return (
        <DashboardLayout title="Profile" subtitle="Manage your account settings">
            <div className="max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{user?.name}</h3>
                                <p className="text-muted-foreground capitalize">{user?.role}</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={user?.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" defaultValue={user?.email} className="pl-10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="phone" placeholder="+91 98765 43210" className="pl-10" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="address" placeholder="Your address" className="pl-10" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleSave} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <Button variant="outline" className="w-full">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
