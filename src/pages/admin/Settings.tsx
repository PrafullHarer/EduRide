import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Building, Mail, Phone, Calendar, Save, Loader2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        schoolName: 'School Bus Buddy',
        address: '',
        contactEmail: '',
        contactPhone: '',
        academicYear: '2025-2026',
        enableNotifications: true,
        maintenanceMode: false
    });

    useEffect(() => {
        // Load from local storage on mount
        const savedSettings = localStorage.getItem('schoolSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name: string, checked: boolean) => {
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            // Save to local storage
            localStorage.setItem('schoolSettings', JSON.stringify(settings));

            toast({
                title: 'Settings Saved',
                description: 'School configuration has been updated successfully.'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save settings.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Settings" subtitle="Manage application configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* General Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            General Information
                        </CardTitle>
                        <CardDescription>Basic details about the educational institution.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">School Name</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="schoolName"
                                    name="schoolName"
                                    value={settings.schoolName}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="Enter school name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    name="address"
                                    value={settings.address}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="Full address"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail">Contact Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="contactEmail"
                                        name="contactEmail"
                                        type="email"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        className="pl-9"
                                        placeholder="admin@school.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="contactPhone"
                                        name="contactPhone"
                                        value={settings.contactPhone}
                                        onChange={handleChange}
                                        className="pl-9"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            System Configuration
                        </CardTitle>
                        <CardDescription>Academic year and system preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Active Academic Year</Label>
                            <Input
                                id="academicYear"
                                name="academicYear"
                                value={settings.academicYear}
                                onChange={handleChange}
                                placeholder="e.g. 2025-2026"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">System Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Enable global email/SMS notifications
                                </p>
                            </div>
                            <Switch
                                checked={settings.enableNotifications}
                                onCheckedChange={(c) => handleToggle('enableNotifications', c)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-0.5">
                                <Label className="text-base text-destructive">Maintenance Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Pause all system access for non-admins
                                </p>
                            </div>
                            <Switch
                                checked={settings.maintenanceMode}
                                onCheckedChange={(c) => handleToggle('maintenanceMode', c)}
                            />
                        </div>

                        <Button onClick={handleSave} className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Configuration
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
