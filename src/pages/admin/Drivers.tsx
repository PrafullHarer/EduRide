import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserCog, Plus, Phone, Mail, Bus, Loader2, Pencil, Trash2, Eye } from 'lucide-react';
import { driversAPI, authAPI, busesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Driver {
    _id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    status: 'on-duty' | 'off-duty' | 'on-leave';
    experience: number;
    busId?: { _id: string; busNumber: string };
}

const Drivers: React.FC = () => {
    const { toast } = useToast();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'driver123',
        phone: '',
        licenseNumber: '',
        experience: 0,
        status: 'off-duty' as 'on-duty' | 'off-duty' | 'on-leave',
        busId: ''
    });

    const fetchData = async () => {
        try {
            const [driverData, busData] = await Promise.all([
                driversAPI.getAll(),
                busesAPI.getAll()
            ]);
            setDrivers(driverData);
            setBuses(busData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: 'driver123',
            phone: '',
            licenseNumber: '',
            experience: 0,
            status: 'off-duty',
            busId: ''
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'experience' ? parseInt(value) || 0 : value
        }));
    };

    const handleAddDriver = async () => {
        if (!formData.name || !formData.email) {
            toast({ title: 'Error', description: 'Name and email are required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'driver',
                phone: formData.phone || '+91 00000 00000',
                licenseNumber: formData.licenseNumber || 'PENDING'
            });

            toast({ title: 'Success', description: `Driver ${formData.name} added successfully` });
            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add driver', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditDriver = async () => {
        if (!selectedDriver) return;

        setSaving(true);
        try {
            await driversAPI.update(selectedDriver._id, {
                name: formData.name,
                phone: formData.phone,
                licenseNumber: formData.licenseNumber,
                experience: formData.experience,
                status: formData.status,
                busId: formData.busId || undefined
            });

            toast({ title: 'Success', description: `Driver ${formData.name} updated successfully` });
            setShowEditModal(false);
            setSelectedDriver(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to update driver', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDriver = async () => {
        if (!selectedDriver) return;

        setSaving(true);
        try {
            await driversAPI.delete(selectedDriver._id);
            toast({ title: 'Success', description: `Driver ${selectedDriver.name} deleted successfully` });
            setShowDeleteDialog(false);
            setSelectedDriver(null);
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete driver', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (driver: Driver) => {
        setSelectedDriver(driver);
        setFormData({
            name: driver.name,
            email: driver.email,
            password: '',
            phone: driver.phone,
            licenseNumber: driver.licenseNumber,
            experience: driver.experience,
            status: driver.status,
            busId: driver.busId?._id || ''
        });
        setShowEditModal(true);
    };

    const openViewModal = (driver: Driver) => {
        setSelectedDriver(driver);
        setShowViewModal(true);
    };

    const openDeleteDialog = (driver: Driver) => {
        setSelectedDriver(driver);
        setShowDeleteDialog(true);
    };

    if (loading) {
        return (
            <DashboardLayout title="Drivers" subtitle="Manage bus drivers">
                <div className="flex items-center justify-center h-64">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Drivers" subtitle="Manage bus drivers">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Badge variant="default" className="px-3 py-1">{drivers.filter(d => d.status === 'on-duty').length} On Duty</Badge>
                        <Badge variant="secondary" className="px-3 py-1">{drivers.filter(d => d.status === 'off-duty').length} Off Duty</Badge>
                        <Badge variant="outline" className="px-3 py-1">{drivers.filter(d => d.status === 'on-leave').length} On Leave</Badge>
                    </div>
                    <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Driver
                    </Button>
                </div>

                {/* Driver Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map((driver) => (
                        <Card key={driver._id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserCog className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{driver.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{driver.experience} years exp.</p>
                                        </div>
                                    </div>
                                    <Badge variant={driver.status === 'on-duty' ? 'default' : driver.status === 'off-duty' ? 'secondary' : 'outline'}>
                                        {driver.status.replace('-', ' ')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" /><span>{driver.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" /><span>{driver.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">License</span>
                                        <span className="font-mono">{driver.licenseNumber}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-muted-foreground">Assigned Bus</span>
                                        <span className="flex items-center gap-1"><Bus className="h-3 w-3" />{driver.busId?.busNumber || 'None'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openViewModal(driver)}>
                                        <Eye className="h-4 w-4 mr-1" />View
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(driver)}>
                                        <Pencil className="h-4 w-4 mr-1" />Edit
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-destructive" onClick={() => openDeleteDialog(driver)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {drivers.length === 0 && (
                    <Card className="p-8 text-center text-muted-foreground">
                        <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No drivers found. Add your first driver to get started.</p>
                    </Card>
                )}
            </div>

            {/* Add Driver Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add New Driver</DialogTitle>
                        <DialogDescription>Create a new driver account with login credentials.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Driver name" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="driver@school.edu" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 00000 00000" />
                            </div>
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input name="password" value={formData.password} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>License Number</Label>
                                <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="DL-1234567890" />
                            </div>
                            <div className="space-y-2">
                                <Label>Experience (years)</Label>
                                <Input name="experience" type="number" value={formData.experience} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="button" onClick={handleAddDriver} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Driver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Driver Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Driver</DialogTitle>
                        <DialogDescription>Update driver information.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input name="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email (readonly)</Label>
                                <Input value={formData.email} disabled className="bg-muted" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="on-duty">On Duty</option>
                                    <option value="off-duty">Off Duty</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>License Number</Label>
                                <Input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Experience (years)</Label>
                                <Input name="experience" type="number" value={formData.experience} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Bus</Label>
                            <select name="busId" value={formData.busId} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                <option value="">No Bus</option>
                                {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber}</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button type="button" onClick={handleEditDriver} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Driver Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" />Driver Details</DialogTitle>
                    </DialogHeader>
                    {selectedDriver && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserCog className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedDriver.name}</h3>
                                    <Badge variant={selectedDriver.status === 'on-duty' ? 'default' : 'secondary'}>{selectedDriver.status.replace('-', ' ')}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedDriver.email}</p></div>
                                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedDriver.phone || 'N/A'}</p></div>
                                <div><p className="text-muted-foreground">License</p><p className="font-medium font-mono">{selectedDriver.licenseNumber}</p></div>
                                <div><p className="text-muted-foreground">Experience</p><p className="font-medium">{selectedDriver.experience} years</p></div>
                                <div className="col-span-2"><p className="text-muted-foreground">Assigned Bus</p><p className="font-medium">{selectedDriver.busId?.busNumber || 'Not assigned'}</p></div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                        <Button type="button" onClick={() => { setShowViewModal(false); if (selectedDriver) openEditModal(selectedDriver); }}>
                            <Pencil className="h-4 w-4 mr-2" />Edit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Driver</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedDriver?.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDriver} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default Drivers;
