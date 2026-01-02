import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Phone, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, studentsAPI, busesAPI } from '@/lib/api';

interface Student {
    _id: string;
    name: string;
    phone: string;
    class: string;
    section: string;
    address: string;
    status: 'active' | 'inactive' | 'pending';
}

const DriverStudents: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [busNumber, setBusNumber] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const driverData = await driversAPI.getByUserId(user.id);
                if (driverData?.busId) {
                    const busData = typeof driverData.busId === 'object' ? driverData.busId : await busesAPI.getById(driverData.busId);
                    setBusNumber(busData.busNumber);

                    // Get all students and filter by busId
                    const allStudents = await studentsAPI.getAll();
                    const busStudents = allStudents.filter((s: any) =>
                        (typeof s.busId === 'object' ? s.busId._id : s.busId) === busData._id
                    );
                    setStudents(busStudents);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout title="Students" subtitle="Students on your bus">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Students" subtitle={`Students on ${busNumber || 'your bus'}`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Badge variant="outline" className="h-10 px-4 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {students.length} Students
                    </Badge>
                </div>

                {/* Student List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredStudents.map((student) => (
                                <div key={student._id} className="flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="font-bold text-primary">{student.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold">{student.name}</p>
                                            <Badge variant="secondary">Class {student.class}-{student.section}</Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />{student.phone}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />{student.address}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                        {student.status}
                                    </Badge>
                                </div>
                            ))}
                            {filteredStudents.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No students found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DriverStudents;
