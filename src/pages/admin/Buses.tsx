import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Bus, Plus, Users, MapPin, Loader2, Wrench, Pencil, Trash2, Eye } from 'lucide-react';
import { busesAPI, routesAPI, driversAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BusData {
    _id: string;
    busNumber: string;
    registrationNumber: string;
    capacity: number;
    currentStudents: number;
    status: 'active' | 'maintenance' | 'inactive';
    model: string;
    year: number;
    driverId?: { _id: string; name: string };
    routeId?: { _id: string; name: string };
}

const Buses: React.FC = () => {
    const { toast } = useToast();
    const [buses, setBuses] = useState<BusData[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedBus, setSelectedBus] = useState<BusData | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        busNumber: '',
        registrationNumber: '',
        capacity: 40,
        model: '',
        year: new Date().getFullYear(),
        status: 'active' as 'active' | 'maintenance' | 'inactive',
        routeId: '',
        driverId: ''
    });

    const fetchData = async () => {
        try {
            const [busData, routeData, driverData] = await Promise.all([
                busesAPI.getAll(),
                routesAPI.getAll(),
                driversAPI.getAll()
            ]);
            setBuses(busData);
            setRoutes(routeData);
            setDrivers(driverData);
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
            busNumber: '',
            registrationNumber: '',
            capacity: 40,
            model: '',
            year: new Date().getFullYear(),
            status: 'active',
            routeId: '',
            driverId: ''
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['capacity', 'year'].includes(name) ? parseInt(value) || 0 : value
        }));
    };

    const handleAddBus = async () => {
        if (!formData.busNumber || !formData.registrationNumber) {
            toast({ title: 'Error', description: 'Bus number and registration are required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            await busesAPI.create({
                busNumber: formData.busNumber,
                registrationNumber: formData.registrationNumber,
                capacity: formData.capacity,
                currentStudents: 0,
                model: formData.model,
                year: formData.year,
                status: formData.status,
                routeId: formData.routeId || undefined,
                driverId: formData.driverId || undefined
            });

            toast({ title: 'Success', description: `Bus ${formData.busNumber} added successfully` });
            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add bus', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditBus = async () => {
        if (!selectedBus) return;

        setSaving(true);
        try {
            await busesAPI.update(selectedBus._id, {
                busNumber: formData.busNumber,
                registrationNumber: formData.registrationNumber,
                capacity: formData.capacity,
                model: formData.model,
                year: formData.year,
                status: formData.status,
                routeId: formData.routeId || undefined,
                driverId: formData.driverId || undefined
            });

            toast({ title: 'Success', description: `Bus ${formData.busNumber} updated successfully` });
            setShowEditModal(false);
            setSelectedBus(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to update bus', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBus = async () => {
        if (!selectedBus) return;

        setSaving(true);
        try {
            await busesAPI.delete(selectedBus._id);
            toast({ title: 'Success', description: `Bus ${selectedBus.busNumber} deleted successfully` });
            setShowDeleteDialog(false);
            setSelectedBus(null);
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete bus', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (bus: BusData) => {
        setSelectedBus(bus);
        setFormData({
            busNumber: bus.busNumber,
            registrationNumber: bus.registrationNumber,
            capacity: bus.capacity,
            model: bus.model,
            year: bus.year,
            status: bus.status,
            routeId: bus.routeId?._id || '',
            driverId: bus.driverId?._id || ''
        });
        setShowEditModal(true);
    };

    const openViewModal = (bus: BusData) => {
        setSelectedBus(bus);
        setShowViewModal(true);
    };

    const openDeleteDialog = (bus: BusData) => {
        setSelectedBus(bus);
        setShowDeleteDialog(true);
    };

    if (loading) {
        return (
            <DashboardLayout title="Buses" subtitle="Manage your bus fleet">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Buses" subtitle="Manage your bus fleet">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Badge variant="outline" className="px-3 py-1">
                            <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                            {buses.filter(b => b.status === 'active').length} Active
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            <Wrench className="h-3 w-3 mr-2" />
                            {buses.filter(b => b.status === 'maintenance').length} Maintenance
                        </Badge>
                    </div>
                    <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bus
                    </Button>
                </div>

                {/* Bus Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buses.map((bus) => (
                        <Card key={bus._id} className="relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${bus.status === 'active' ? 'bg-success' : bus.status === 'maintenance' ? 'bg-warning' : 'bg-muted'}`} />
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Bus className="h-5 w-5 text-primary" />
                                        {bus.busNumber}
                                    </CardTitle>
                                    <Badge variant={bus.status === 'active' ? 'default' : 'secondary'}>{bus.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-muted-foreground">
                                    <p>{bus.model} • {bus.year}</p>
                                    <p className="font-mono">{bus.registrationNumber}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{bus.currentStudents}/{bus.capacity}</p>
                                            <p className="text-xs text-muted-foreground">Students</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold truncate">{bus.routeId?.name || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground">Route</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Driver: </span>
                                        <span className="font-medium">{bus.driverId?.name || 'Unassigned'}</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openViewModal(bus)}>
                                        <Eye className="h-4 w-4 mr-1" />View
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(bus)}>
                                        <Pencil className="h-4 w-4 mr-1" />Edit
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-destructive" onClick={() => openDeleteDialog(bus)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {buses.length === 0 && (
                    <Card className="p-8 text-center text-muted-foreground">
                        <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No buses found. Add your first bus to get started.</p>
                    </Card>
                )}
            </div>

            {/* Add Bus Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add New Bus</DialogTitle>
                        <DialogDescription>Add a new bus to your fleet.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bus Number *</Label>
                                <Input name="busNumber" value={formData.busNumber} onChange={handleInputChange} placeholder="BUS-001" />
                            </div>
                            <div className="space-y-2">
                                <Label>Registration *</Label>
                                <Input name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="DL 01 AB 1234" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Input name="model" value={formData.model} onChange={handleInputChange} placeholder="Tata Starbus" />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input name="year" type="number" value={formData.year} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Capacity</Label>
                                <Input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="active">Active</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Route</Label>
                                <select name="routeId" value={formData.routeId} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="">Select Route</option>
                                    {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Driver</Label>
                                <select name="driverId" value={formData.driverId} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="">Select Driver</option>
                                    {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button onClick={handleAddBus} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Bus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Bus Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Bus</DialogTitle>
                        <DialogDescription>Update bus information.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bus Number</Label>
                                <Input name="busNumber" value={formData.busNumber} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Registration</Label>
                                <Input name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Model</Label>
                                <Input name="model" value={formData.model} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input name="year" type="number" value={formData.year} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Capacity</Label>
                                <Input name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="active">Active</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Route</Label>
                                <select name="routeId" value={formData.routeId} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="">Select Route</option>
                                    {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Driver</Label>
                                <select name="driverId" value={formData.driverId} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="">Select Driver</option>
                                    {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button onClick={handleEditBus} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Bus Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Bus className="h-5 w-5" />Bus Details</DialogTitle>
                    </DialogHeader>
                    {selectedBus && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bus className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedBus.busNumber}</h3>
                                    <Badge variant={selectedBus.status === 'active' ? 'default' : 'secondary'}>{selectedBus.status}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Registration</p><p className="font-medium font-mono">{selectedBus.registrationNumber}</p></div>
                                <div><p className="text-muted-foreground">Model</p><p className="font-medium">{selectedBus.model} ({selectedBus.year})</p></div>
                                <div><p className="text-muted-foreground">Capacity</p><p className="font-medium">{selectedBus.currentStudents}/{selectedBus.capacity} students</p></div>
                                <div><p className="text-muted-foreground">Route</p><p className="font-medium">{selectedBus.routeId?.name || 'Not assigned'}</p></div>
                                <div className="col-span-2"><p className="text-muted-foreground">Driver</p><p className="font-medium">{selectedBus.driverId?.name || 'Not assigned'}</p></div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                        <Button onClick={() => { setShowViewModal(false); if (selectedBus) openEditModal(selectedBus); }}>
                            <Pencil className="h-4 w-4 mr-2" />Edit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedBus?.busNumber}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBus} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default Buses;
