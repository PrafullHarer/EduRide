import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Route, Plus, MapPin, Bus, Loader2, Pencil, Trash2, Eye, X, Users, UserPlus, Check, Search } from 'lucide-react';
import { routesAPI, studentsAPI, busesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Stop {
    name: string;
    order: number;
    estimatedArrival: string;
}

interface RouteData {
    _id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    stops: Stop[];
    totalDistanceKm: number;
    estimatedTime: string;
    busId?: { _id: string; busNumber: string };
}

interface Student {
    _id: string;
    name: string;
    email: string;
    class: string;
    section: string;
    routeId?: { _id: string; name: string } | string;
    busId?: { _id: string; busNumber: string } | string;
}

const Routes: React.FC = () => {
    const { toast } = useToast();
    const [routes, setRoutes] = useState<RouteData[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        startPoint: '',
        endPoint: '',
        totalDistanceKm: 0,
        estimatedTime: '',
        stops: [] as Stop[]
    });

    const [newStop, setNewStop] = useState({ name: '', estimatedArrival: '' });

    const fetchData = async () => {
        try {
            const [routeData, studentData, busData] = await Promise.all([
                routesAPI.getAll(),
                studentsAPI.getAll(),
                busesAPI.getAll()
            ]);
            setRoutes(routeData);
            setStudents(studentData);
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
        setFormData({ name: '', startPoint: '', endPoint: '', totalDistanceKm: 0, estimatedTime: '', stops: [] });
        setNewStop({ name: '', estimatedArrival: '' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'totalDistanceKm' ? parseFloat(value) || 0 : value
        }));
    };

    const addStop = () => {
        if (!newStop.name) return;
        setFormData(prev => ({
            ...prev,
            stops: [...prev.stops, { name: newStop.name, order: prev.stops.length + 1, estimatedArrival: newStop.estimatedArrival }]
        }));
        setNewStop({ name: '', estimatedArrival: '' });
    };

    const removeStop = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stops: prev.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
        }));
    };

    const handleAddRoute = async () => {
        if (!formData.name || !formData.startPoint || !formData.endPoint) {
            toast({ title: 'Error', description: 'Name, start point, and end point are required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            await routesAPI.create({
                name: formData.name,
                startPoint: formData.startPoint,
                endPoint: formData.endPoint,
                totalDistanceKm: formData.totalDistanceKm,
                estimatedTime: formData.estimatedTime,
                stops: formData.stops
            });

            toast({ title: 'Success', description: `Route ${formData.name} added successfully` });
            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add route', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditRoute = async () => {
        if (!selectedRoute) return;

        setSaving(true);
        try {
            await routesAPI.update(selectedRoute._id, {
                name: formData.name,
                startPoint: formData.startPoint,
                endPoint: formData.endPoint,
                totalDistanceKm: formData.totalDistanceKm,
                estimatedTime: formData.estimatedTime,
                stops: formData.stops
            });

            toast({ title: 'Success', description: `Route ${formData.name} updated successfully` });
            setShowEditModal(false);
            setSelectedRoute(null);
            resetForm();
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to update route', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRoute = async () => {
        if (!selectedRoute) return;

        setSaving(true);
        try {
            await routesAPI.delete(selectedRoute._id);
            toast({ title: 'Success', description: `Route ${selectedRoute.name} deleted successfully` });
            setShowDeleteDialog(false);
            setSelectedRoute(null);
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete route', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const openAssignModal = (route: RouteData) => {
        setSelectedRoute(route);
        // Get students already assigned to this route
        const assignedIds = students
            .filter(s => {
                const routeId = typeof s.routeId === 'object' ? s.routeId?._id : s.routeId;
                return routeId === route._id;
            })
            .map(s => s._id);
        setSelectedStudentIds(assignedIds);
        setShowAssignModal(true);
    };

    const toggleStudentSelection = (studentId: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const [assignSearch, setAssignSearch] = useState('');

    const handleAssignStudents = async () => {
        if (!selectedRoute) return;

        setSaving(true);
        try {
            // Find the bus assigned to this route
            const routeBus = buses.find(b => b.routeId?._id === selectedRoute._id || b.routeId === selectedRoute._id);

            // Calculate potential new student count
            let newStudentCount = 0;

            // If there's a bus, validate capacity
            if (routeBus) {
                // Count students currently on this bus (excluding those we're about to change)
                const currentBusStudents = students.filter(s => {
                    const sBusId = typeof s.busId === 'object' ? s.busId?._id : s.busId;
                    return sBusId === routeBus._id;
                });

                // Calculate net change
                const studentsSelectedForRoute = students.filter(s => selectedStudentIds.includes(s._id));
                const studentsToAssign = studentsSelectedForRoute.filter(s => {
                    const sRouteId = typeof s.routeId === 'object' ? s.routeId?._id : s.routeId;
                    return sRouteId !== selectedRoute._id;
                });

                // We also need to account for students being REMOVED from the route
                // But typically we care about peak load. The 'selectedStudentIds' IS the new state of the route.
                // So the new count for this route is exactly selectedStudentIds.length.

                // However, the BUS might be shared? In this app, 1 Route = 1 Bus seems to be the pattern (routeId in Bus model).
                // So if Bus <-> Route is 1:1, then the total students on bus = total students on route.

                if (selectedStudentIds.length > routeBus.capacity) {
                    throw new Error(`Cannot assign ${selectedStudentIds.length} students. Bus capacity is ${routeBus.capacity}.`);
                }

                newStudentCount = selectedStudentIds.length;
            }

            // Update each student's routeId and busId
            const updatePromises = students.map(async (student) => {
                const isSelected = selectedStudentIds.includes(student._id);
                const currentRouteId = typeof student.routeId === 'object' ? student.routeId?._id : student.routeId;
                const wasAssigned = currentRouteId === selectedRoute._id;

                if (isSelected && !wasAssigned) {
                    // Assign to route
                    await studentsAPI.update(student._id, {
                        routeId: selectedRoute._id,
                        busId: routeBus?._id || undefined
                    });
                } else if (!isSelected && wasAssigned) {
                    // Remove from route
                    await studentsAPI.update(student._id, {
                        routeId: null,
                        busId: null
                    });
                }
            });

            await Promise.all(updatePromises);

            // Update Bus Count
            if (routeBus) {
                await busesAPI.update(routeBus._id, {
                    currentStudents: newStudentCount
                });
            }

            toast({
                title: 'Success',
                description: `${selectedStudentIds.length} students assigned to ${selectedRoute.name}`
            });
            setShowAssignModal(false);
            setSelectedRoute(null);
            setSelectedStudentIds([]);
            setAssignSearch('');
            fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to assign students', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (route: RouteData) => {
        setSelectedRoute(route);
        setFormData({
            name: route.name,
            startPoint: route.startPoint,
            endPoint: route.endPoint,
            totalDistanceKm: route.totalDistanceKm,
            estimatedTime: route.estimatedTime || '',
            stops: route.stops || []
        });
        setShowEditModal(true);
    };

    const openViewModal = (route: RouteData) => {
        setSelectedRoute(route);
        setShowViewModal(true);
    };

    const openDeleteDialog = (route: RouteData) => {
        setSelectedRoute(route);
        setShowDeleteDialog(true);
    };

    // Get count of students assigned to a route
    const getStudentCount = (routeId: string) => {
        return students.filter(s => {
            const rId = typeof s.routeId === 'object' ? s.routeId?._id : s.routeId;
            return rId === routeId;
        }).length;
    };

    if (loading) {
        return (
            <DashboardLayout title="Routes" subtitle="Manage bus routes">
                <div className="flex items-center justify-center h-64">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Routes" subtitle="Manage bus routes">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">{routes.length} routes configured</p>
                    <Button type="button" onClick={() => { resetForm(); setShowAddModal(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Route
                    </Button>
                </div>

                {/* Route Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {routes.map((route) => (
                        <Card key={route._id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Route className="h-5 w-5 text-primary" />
                                        {route.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {getStudentCount(route._id)} students
                                        </Badge>
                                        {route.busId && (
                                            <Badge variant="outline">
                                                <Bus className="h-3 w-3 mr-1" />
                                                {route.busId.busNumber}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Route Info */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-success" />
                                        <span>{route.startPoint}</span>
                                    </div>
                                    <span className="text-muted-foreground">→</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-destructive" />
                                        <span>{route.endPoint}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <p className="font-semibold">{route.totalDistanceKm} km</p>
                                        <p className="text-muted-foreground">Distance</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{route.estimatedTime || 'N/A'}</p>
                                        <p className="text-muted-foreground">Duration</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{route.stops?.length || 0}</p>
                                        <p className="text-muted-foreground">Stops</p>
                                    </div>
                                </div>

                                {/* Stops Preview */}
                                {route.stops && route.stops.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Stops</p>
                                        <div className="flex flex-wrap gap-2">
                                            {route.stops.slice(0, 4).map((stop, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {stop.order}. {stop.name}
                                                </Badge>
                                            ))}
                                            {route.stops.length > 4 && (
                                                <Badge variant="outline" className="text-xs">+{route.stops.length - 4} more</Badge>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => openAssignModal(route)}>
                                        <UserPlus className="h-4 w-4 mr-1" />Assign Students
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => openViewModal(route)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(route)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="outline" size="icon" className="text-destructive" onClick={() => openDeleteDialog(route)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {routes.length === 0 && (
                    <Card className="p-8 text-center text-muted-foreground">
                        <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No routes found. Add your first route to get started.</p>
                    </Card>
                )}
            </div>

            {/* Assign Students Modal */}
            <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Assign Students to {selectedRoute?.name}
                        </DialogTitle>
                        <DialogDescription>Select students to assign to this route. Students will also be assigned to the route's bus if available.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search students by name, class..."
                                    value={assignSearch}
                                    onChange={(e) => setAssignSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Badge variant="secondary" className="whitespace-nowrap">
                                {selectedStudentIds.length} selected
                            </Badge>
                        </div>

                        <div className="max-h-[40vh] overflow-y-auto space-y-2">
                            {students
                                .filter(s =>
                                    s.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                    s.class.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                    s.section.toLowerCase().includes(assignSearch.toLowerCase())
                                )
                                .map((student) => {
                                    const isSelected = selectedStudentIds.includes(student._id);
                                    const currentRouteId = typeof student.routeId === 'object' ? student.routeId?._id : student.routeId;
                                    const currentRouteName = typeof student.routeId === 'object' ? student.routeId?.name : null;
                                    const isOnOtherRoute = currentRouteId && currentRouteId !== selectedRoute?._id;

                                    return (
                                        <div
                                            key={student._id}
                                            onClick={() => toggleStudentSelection(student._id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                                                }`}
                                        >
                                            <div className={`h-6 w-6 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-white' : 'border-input'
                                                }`}>
                                                {isSelected && <Check className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">Class {student.class}-{student.section}</p>
                                            </div>
                                            {isOnOtherRoute && (
                                                <Badge variant="outline" className="text-xs">
                                                    On: {currentRouteName || 'Other route'}
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            {students.filter(s =>
                                s.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                s.class.toLowerCase().includes(assignSearch.toLowerCase()) ||
                                s.section.toLowerCase().includes(assignSearch.toLowerCase())
                            ).length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">No students found</p>
                                )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                        <Button type="button" onClick={handleAssignStudents} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                            Save Assignments
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Route Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add New Route</DialogTitle>
                        <DialogDescription>Create a new bus route with stops.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label>Route Name *</Label>
                            <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="South Delhi Route" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Point *</Label>
                                <Input name="startPoint" value={formData.startPoint} onChange={handleInputChange} placeholder="School Campus" />
                            </div>
                            <div className="space-y-2">
                                <Label>End Point *</Label>
                                <Input name="endPoint" value={formData.endPoint} onChange={handleInputChange} placeholder="Green Park Metro" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Distance (km)</Label>
                                <Input name="totalDistanceKm" type="number" value={formData.totalDistanceKm} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Estimated Time</Label>
                                <Input name="estimatedTime" value={formData.estimatedTime} onChange={handleInputChange} placeholder="45 mins" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Stops ({formData.stops.length})</Label>
                            <div className="space-y-2">
                                {formData.stops.map((stop, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <Badge variant="outline">{stop.order}</Badge>
                                        <span className="flex-1">{stop.name}</span>
                                        <span className="text-sm text-muted-foreground">{stop.estimatedArrival}</span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(i)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Stop name" value={newStop.name} onChange={(e) => setNewStop(p => ({ ...p, name: e.target.value }))} className="flex-1" />
                                <Input type="time" value={newStop.estimatedArrival} onChange={(e) => setNewStop(p => ({ ...p, estimatedArrival: e.target.value }))} className="w-28" />
                                <Button type="button" variant="outline" onClick={addStop}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="button" onClick={handleAddRoute} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Route
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Route Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Route</DialogTitle>
                        <DialogDescription>Update route information and stops.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label>Route Name</Label>
                            <Input name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Point</Label>
                                <Input name="startPoint" value={formData.startPoint} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Point</Label>
                                <Input name="endPoint" value={formData.endPoint} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Distance (km)</Label>
                                <Input name="totalDistanceKm" type="number" value={formData.totalDistanceKm} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Estimated Time</Label>
                                <Input name="estimatedTime" value={formData.estimatedTime} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Stops ({formData.stops.length})</Label>
                            <div className="space-y-2">
                                {formData.stops.map((stop, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <Badge variant="outline">{stop.order}</Badge>
                                        <span className="flex-1">{stop.name}</span>
                                        <span className="text-sm text-muted-foreground">{stop.estimatedArrival}</span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(i)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Stop name" value={newStop.name} onChange={(e) => setNewStop(p => ({ ...p, name: e.target.value }))} className="flex-1" />
                                <Input type="time" value={newStop.estimatedArrival} onChange={(e) => setNewStop(p => ({ ...p, estimatedArrival: e.target.value }))} className="w-28" />
                                <Button type="button" variant="outline" onClick={addStop}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button type="button" onClick={handleEditRoute} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Route Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Route Details</DialogTitle>
                    </DialogHeader>
                    {selectedRoute && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Route className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedRoute.name}</h3>
                                    <div className="flex gap-2">
                                        {selectedRoute.busId && <Badge variant="outline">{selectedRoute.busId.busNumber}</Badge>}
                                        <Badge variant="secondary">{getStudentCount(selectedRoute._id)} students</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-success" />{selectedRoute.startPoint}
                                <span className="text-muted-foreground">→</span>
                                <MapPin className="h-4 w-4 text-destructive" />{selectedRoute.endPoint}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Distance</p><p className="font-semibold">{selectedRoute.totalDistanceKm} km</p></div>
                                <div><p className="text-muted-foreground">Duration</p><p className="font-semibold">{selectedRoute.estimatedTime || 'N/A'}</p></div>
                                <div><p className="text-muted-foreground">Stops</p><p className="font-semibold">{selectedRoute.stops?.length || 0}</p></div>
                            </div>
                            {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">All Stops</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {selectedRoute.stops.map((stop, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                                <Badge variant="outline" className="w-6 h-6 p-0 justify-center">{stop.order}</Badge>
                                                <span className="flex-1">{stop.name}</span>
                                                <span className="text-muted-foreground">{stop.estimatedArrival}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                        <Button type="button" onClick={() => { setShowViewModal(false); if (selectedRoute) openAssignModal(selectedRoute); }}>
                            <UserPlus className="h-4 w-4 mr-2" />Assign Students
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Route</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedRoute?.name}</strong>? This action cannot be undone. Students assigned to this route will be unassigned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteRoute} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default Routes;
