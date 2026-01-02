import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GraduationCap, Search, Plus, Mail, Phone, Loader2, User, Bus, Calendar, Pencil, Trash2, Eye } from 'lucide-react';
import { studentsAPI, authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Student {
    _id: string;
    name: string;
    email: string;
    phone: string;
    class: string;
    section: string;
    address: string;
    distanceKm: number;
    status: 'active' | 'inactive' | 'pending';
    enrollmentDate?: string;
    busId?: { busNumber: string };
    routeId?: { name: string };
}

const Students: React.FC = () => {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: 'password123',
        phone: '',
        class: '',
        section: '',
        address: '',
        distanceKm: 0,
        status: 'active' as 'active' | 'inactive' | 'pending'
    });

    const fetchStudents = async () => {
        try {
            const data = await studentsAPI.getAll();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', email: '', password: 'password123', phone: '', class: '', section: '', address: '', distanceKm: 0, status: 'active' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'distanceKm' ? parseFloat(value) || 0 : value
        }));
    };

    const handleAddStudent = async () => {
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
                role: 'student',
                phone: formData.phone || '+91 00000 00000',
                class: formData.class || '1',
                section: formData.section || 'A',
                address: formData.address || 'Address pending',
                distanceKm: formData.distanceKm || 0
            });

            toast({ title: 'Success', description: `Student ${formData.name} added successfully` });
            setShowAddModal(false);
            resetForm();
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add student', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleEditStudent = async () => {
        if (!selectedStudent) return;

        setSaving(true);
        try {
            await studentsAPI.update(selectedStudent._id, {
                name: formData.name,
                phone: formData.phone,
                class: formData.class,
                section: formData.section,
                address: formData.address,
                distanceKm: formData.distanceKm,
                status: formData.status
            });

            toast({ title: 'Success', description: `Student ${formData.name} updated successfully` });
            setShowEditModal(false);
            setSelectedStudent(null);
            resetForm();
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to update student', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStudent = async () => {
        if (!selectedStudent) return;

        setSaving(true);
        try {
            await studentsAPI.delete(selectedStudent._id);
            toast({ title: 'Success', description: `Student ${selectedStudent.name} deleted successfully` });
            setShowDeleteDialog(false);
            setSelectedStudent(null);
            fetchStudents();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to delete student', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const openEditModal = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            password: '',
            phone: student.phone,
            class: student.class,
            section: student.section,
            address: student.address,
            distanceKm: student.distanceKm,
            status: student.status
        });
        setShowEditModal(true);
    };

    const openDeleteDialog = (student: Student) => {
        setSelectedStudent(student);
        setShowDeleteDialog(true);
    };

    const openViewModal = (student: Student) => {
        setSelectedStudent(student);
        setShowViewModal(true);
    };

    const filteredStudents = students.filter(s => {
        const searchLower = search.toLowerCase();
        return (
            s.name.toLowerCase().includes(searchLower) ||
            s.email.toLowerCase().includes(searchLower) ||
            (s.phone && s.phone.toLowerCase().includes(searchLower)) ||
            (s.class && s.class.toLowerCase().includes(searchLower)) ||
            (s.section && s.section.toLowerCase().includes(searchLower)) ||
            (s.address && s.address.toLowerCase().includes(searchLower)) ||
            (s.busId?.busNumber && s.busId.busNumber.toLowerCase().includes(searchLower)) ||
            (s.routeId?.name && s.routeId.name.toLowerCase().includes(searchLower))
        );
    });

    if (loading) {
        return (
            <DashboardLayout title="Students" subtitle="Manage student registrations">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Students" subtitle="Manage student registrations">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                    </div>
                    <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-primary/5">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{students.length}</p>
                                <p className="text-sm text-muted-foreground">Total Students</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-success">{students.filter(s => s.status === 'active').length}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-warning">{students.filter(s => s.status === 'pending').length}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-muted-foreground">{students.filter(s => s.status === 'inactive').length}</p>
                            <p className="text-sm text-muted-foreground">Inactive</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Student List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Students ({filteredStudents.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredStudents.map((student) => (
                                <div key={student._id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="font-bold text-primary">{student.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">{student.name}</p>
                                            <Badge variant={student.status === 'active' ? 'default' : student.status === 'pending' ? 'secondary' : 'outline'}>
                                                {student.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{student.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{student.phone || 'N/A'}</span>
                                            <span>Class {student.class}-{student.section}</span>
                                        </div>
                                    </div>
                                    <div className="text-right mr-2">
                                        <p className="font-medium">{student.distanceKm} km</p>
                                        <p className="text-sm text-muted-foreground">{student.busId?.busNumber || 'No bus'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openViewModal(student)} title="View">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => openEditModal(student)} title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => openDeleteDialog(student)} className="text-destructive hover:text-destructive" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No students found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Student Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add New Student</DialogTitle>
                        <DialogDescription>Create a new student account with login credentials.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Student name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@school.edu" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 00000 00000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="password123" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="class">Class</Label>
                                <Input id="class" name="class" value={formData.class} onChange={handleInputChange} placeholder="10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="section">Section</Label>
                                <Input id="section" name="section" value={formData.section} onChange={handleInputChange} placeholder="A" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="distanceKm">Distance (km)</Label>
                                <Input id="distanceKm" name="distanceKm" type="number" value={formData.distanceKm} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button onClick={handleAddStudent} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Student
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Student Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" />Edit Student</DialogTitle>
                        <DialogDescription>Update student information.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name</Label>
                                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email (readonly)</Label>
                                <Input id="edit-email" value={formData.email} disabled className="bg-muted" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <select id="edit-status" name="status" value={formData.status} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-class">Class</Label>
                                <Input id="edit-class" name="class" value={formData.class} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-section">Section</Label>
                                <Input id="edit-section" name="section" value={formData.section} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-distanceKm">Distance (km)</Label>
                                <Input id="edit-distanceKm" name="distanceKm" type="number" value={formData.distanceKm} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input id="edit-address" name="address" value={formData.address} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button onClick={handleEditStudent} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Student Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><User className="h-5 w-5" />Student Details</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-primary">{selectedStudent.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                                    <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'}>{selectedStudent.status}</Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedStudent.email}</p></div>
                                <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{selectedStudent.phone || 'N/A'}</p></div>
                                <div><p className="text-muted-foreground">Class</p><p className="font-medium">{selectedStudent.class}-{selectedStudent.section}</p></div>
                                <div><p className="text-muted-foreground">Distance</p><p className="font-medium">{selectedStudent.distanceKm} km</p></div>
                                <div><p className="text-muted-foreground">Bus</p><p className="font-medium">{selectedStudent.busId?.busNumber || 'Not assigned'}</p></div>
                                <div><p className="text-muted-foreground">Route</p><p className="font-medium">{selectedStudent.routeId?.name || 'Not assigned'}</p></div>
                            </div>
                            <div><p className="text-muted-foreground text-sm">Address</p><p>{selectedStudent.address || 'N/A'}</p></div>
                            {selectedStudent.enrollmentDate && (
                                <div><p className="text-muted-foreground text-sm">Enrolled</p><p className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p></div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
                        <Button onClick={() => { setShowViewModal(false); if (selectedStudent) openEditModal(selectedStudent); }}>
                            <Pencil className="h-4 w-4 mr-2" />Edit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Student</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedStudent?.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default Students;
