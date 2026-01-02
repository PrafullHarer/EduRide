import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Users, Search, Phone, MapPin, Loader2, Sun, Moon, Check,
    ChevronLeft, ChevronRight, CalendarOff, Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { driversAPI, studentsAPI, busesAPI, attendanceAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Student {
    _id: string;
    name: string;
    phone: string;
    class: string;
    section: string;
    address: string;
    status: 'active' | 'inactive' | 'pending';
}

interface AttendanceRecord {
    [studentId: string]: {
        morning: boolean;
        evening: boolean;
    };
}

const DriverStudents: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [busNumber, setBusNumber] = useState('');

    // Attendance State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendance, setAttendance] = useState<AttendanceRecord>({});
    const [isHoliday, setIsHoliday] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const driverData = await driversAPI.getByUserId(user.id);
                if (driverData?.busId) {
                    const busData = typeof driverData.busId === 'object' ? driverData.busId : await busesAPI.getById(driverData.busId);
                    setBusNumber(busData.busNumber);

                    // Get students by routeId (more reliable than busId)
                    if (busData.routeId) {
                        const routeStudents = await studentsAPI.getByRouteId(busData.routeId);
                        setStudents(routeStudents);

                        // Initialize attendance - default to present
                        const initialAttendance: AttendanceRecord = {};
                        routeStudents.forEach((s: Student) => {
                            initialAttendance[s._id] = { morning: true, evening: true };
                        });
                        setAttendance(initialAttendance);
                    }
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

    const toggleAttendance = (studentId: string, shift: 'morning' | 'evening') => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [shift]: !prev[studentId]?.[shift]
            }
        }));
    };

    const markAllPresent = () => {
        const updated: AttendanceRecord = {};
        students.forEach(s => {
            updated[s._id] = { morning: true, evening: true };
        });
        setAttendance(updated);
    };

    const markAllAbsent = () => {
        const updated: AttendanceRecord = {};
        students.forEach(s => {
            updated[s._id] = { morning: false, evening: false };
        });
        setAttendance(updated);
    };

    const changeDate = async (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        // Load attendance for new date
        await loadAttendanceForDate(newDate);
    };

    const loadAttendanceForDate = async (date: Date) => {
        if (students.length === 0) return;

        // Reset holiday state first
        setIsHoliday(false);

        try {
            const studentIds = students.map(s => s._id);
            const dateStr = date.toISOString().split('T')[0];
            const attendanceData = await attendanceAPI.getByDate(dateStr, studentIds);

            const loaded: AttendanceRecord = {};
            let hasRecords = false;
            let dayIsHoliday = false;

            students.forEach(s => {
                if (attendanceData[s._id]) {
                    hasRecords = true;
                    loaded[s._id] = {
                        morning: attendanceData[s._id].morning,
                        evening: attendanceData[s._id].evening
                    };
                    if (attendanceData[s._id].isHoliday) {
                        dayIsHoliday = true;
                    }
                } else {
                    // No record exists - default to present
                    loaded[s._id] = { morning: true, evening: true };
                }
            });

            setAttendance(loaded);
            setIsHoliday(dayIsHoliday);
        } catch (error) {
            console.error('Error loading attendance:', error);
            // On error, default to all present
            const defaultAttendance: AttendanceRecord = {};
            students.forEach(s => {
                defaultAttendance[s._id] = { morning: true, evening: true };
            });
            setAttendance(defaultAttendance);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                morning: status.morning,
                evening: status.evening
            }));

            const dateStr = selectedDate.toISOString().split('T')[0];
            await attendanceAPI.saveBulk(dateStr, records, isHoliday);

            toast({
                title: 'Attendance Saved',
                description: `Attendance for ${selectedDate.toLocaleDateString()} has been saved to database.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save attendance. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    const getDaysInMonth = () => {
        return new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    };

    const morningCount = Object.values(attendance).filter(a => a.morning).length;
    const eveningCount = Object.values(attendance).filter(a => a.evening).length;

    if (loading) {
        return (
            <DashboardLayout title="Attendance" subtitle="Mark student attendance">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Attendance" subtitle={`Day ${selectedDate.getDate()} of ${getDaysInMonth()} • ${students.length} students eligible`}>
            <div className="space-y-6">

                {/* Top Bar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => changeDate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-44 h-9"
                        />
                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => changeDate(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Actions & Stats */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-4 text-sm mr-4">
                            <span className="flex items-center gap-1">
                                <Sun className="h-4 w-4 text-orange-500" />
                                <span className="text-orange-600 font-medium">{morningCount}</span>
                                <span className="text-muted-foreground">/ {students.length}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Moon className="h-4 w-4 text-blue-500" />
                                <span className="text-blue-600 font-medium">{eveningCount}</span>
                                <span className="text-muted-foreground">/ {students.length}</span>
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsHoliday(!isHoliday)}
                            className={isHoliday ? 'bg-orange-100 border-orange-300 text-orange-700' : ''}
                        >
                            <CalendarOff className="h-4 w-4 mr-1" />
                            {isHoliday ? 'Holiday' : 'Mark Holiday'}
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                            Save
                        </Button>
                    </div>
                </div>

                {/* Quick Actions & Search */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={markAllPresent}>All Present</Button>
                        <Button variant="outline" size="sm" onClick={markAllAbsent}>All Absent</Button>
                    </div>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                </div>

                {/* Attendance List */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {busNumber ? `Bus ${busNumber}` : 'Student List'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isHoliday ? (
                            <div className="text-center py-12 text-muted-foreground bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-dashed border-orange-200">
                                <CalendarOff className="h-12 w-12 mx-auto mb-3 text-orange-400" />
                                <p className="font-medium text-orange-700 dark:text-orange-300">Holiday</p>
                                <p className="text-sm">No attendance required for this day</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredStudents.map((student) => (
                                    <div key={student._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-xs text-muted-foreground">{student.phone || 'No Phone'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => window.open(`tel:${student.phone}`, '_self')}
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <div className="flex gap-2">
                                                {/* Morning Toggle */}
                                                <button
                                                    onClick={() => toggleAttendance(student._id, 'morning')}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-all ${attendance[student._id]?.morning
                                                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                                                        : 'bg-muted/50 border-muted text-muted-foreground hover:border-orange-200'
                                                        }`}
                                                >
                                                    <Sun className="h-4 w-4" />
                                                    {attendance[student._id]?.morning && <Check className="h-3 w-3" />}
                                                </button>
                                                {/* Evening Toggle */}
                                                <button
                                                    onClick={() => toggleAttendance(student._id, 'evening')}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-all ${attendance[student._id]?.evening
                                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                        : 'bg-muted/50 border-muted text-muted-foreground hover:border-blue-200'
                                                        }`}
                                                >
                                                    <Moon className="h-4 w-4" />
                                                    {attendance[student._id]?.evening && <Check className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">No students found</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DriverStudents;
