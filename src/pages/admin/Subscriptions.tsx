import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, FileText, MessageCircle, CheckCircle, Plus, Loader2, Calendar, Search } from 'lucide-react';
import { subscriptionsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Subscription {
    _id: string;
    studentId: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    } | string;
    month: string;
    year: number;
    distanceKm: number;
    pricePerKm: number;
    totalAmount: number;
    status: 'pending' | 'paid' | 'overdue';
    dueDate: string;
    paidDate?: string;
}

const Subscriptions: React.FC = () => {
    const { toast } = useToast();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    // Date Selection
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Generate Modal
    const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchSubscriptions = async () => {
        try {
            const data = await subscriptionsAPI.getAll();
            setSubscriptions(data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    // Filter Logic
    const currentMonth = selectedDate.toLocaleString('default', { month: 'long' });
    const currentYear = selectedDate.getFullYear();

    const filteredSubs = subscriptions.filter(s => {
        // Date Match
        if (s.month !== currentMonth || s.year !== currentYear) return false;

        // Search Match
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        const student = typeof s.studentId === 'object' ? s.studentId : null;

        if (!student) return false;

        return (
            student.name.toLowerCase().includes(term) ||
            (student.email && student.email.toLowerCase().includes(term)) ||
            (student.phone && student.phone.includes(term)) ||
            (student.address && student.address.toLowerCase().includes(term))
        );
    });

    // Stats
    const stats = {
        totalBills: filteredSubs.length,
        totalAmount: filteredSubs.reduce((sum, s) => sum + s.totalAmount, 0),
        paidCount: filteredSubs.filter(s => s.status === 'paid').length,
        paidAmount: filteredSubs.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalAmount, 0),
        pendingCount: filteredSubs.filter(s => s.status !== 'paid').length,
        pendingAmount: filteredSubs.filter(s => s.status !== 'paid').reduce((sum, s) => sum + s.totalAmount, 0),
    };

    // Handlers
    const handlePrevMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    const handleMonthSelect = (month: string) => {
        const newDate = new Date(selectedDate);
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        newDate.setMonth(monthIndex);
        setSelectedDate(newDate);
    };

    const handleYearSelect = (year: string) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(parseInt(year));
        setSelectedDate(newDate);
    };

    const handleGenerateAll = async () => {
        setGenerating(true);
        try {
            const res = await subscriptionsAPI.generateAll({
                month: currentMonth,
                year: currentYear
            });
            toast({ title: 'Success', description: res.message });
            setShowGenerateConfirm(false);
            fetchSubscriptions();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to generate bills', variant: 'destructive' });
        } finally {
            setGenerating(false);
        }
    };

    const handleMarkPaid = async (id: string) => {
        if (!confirm('Mark this subscription as PAID?')) return;
        try {
            await subscriptionsAPI.update(id, { status: 'paid', paidDate: new Date() });
            toast({ title: 'Success', description: 'Marked as paid' });
            fetchSubscriptions();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        }
    };

    const handleWhatsApp = (sub: Subscription) => {
        const student = typeof sub.studentId === 'object' ? sub.studentId : null;
        if (!student?.phone) {
            toast({ title: 'Error', description: 'Student phone number not found', variant: 'destructive' });
            return;
        }
        const message = `Dear ${student.name}, your school bus bill for ${sub.month} ${sub.year} of ₹${sub.totalAmount} is ${sub.status}. Please pay as soon as possible.`;
        window.open(`https://wa.me/91${student.phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <DashboardLayout title="Bills" subtitle="Generate and manage monthly bills">
            <div className="space-y-6">

                {/* Top Bar */}
                <Card className="rounded-xl border-none shadow-sm bg-card">
                    <CardContent className="p-4 flex flex-col xl:flex-row items-center justify-between gap-4">

                        {/* 1. Date Navigation */}
                        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg w-full md:w-auto justify-center">
                            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2 px-2 font-medium whitespace-nowrap min-w-[140px] justify-center">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{currentMonth} {currentYear}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* 2. Search Bar - Centered/Expansive */}
                        <div className="relative w-full xl:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search student by name, email, phone..."
                                className="pl-10 w-full bg-muted/20 border-muted-foreground/20 focus:bg-background transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* 3. Actions Group */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                            {/* Dropdowns */}
                            <div className="flex items-center gap-2">
                                <Select value={currentMonth} onValueChange={handleMonthSelect}>
                                    <SelectTrigger className="w-[110px] bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={currentYear.toString()} onValueChange={handleYearSelect}>
                                    <SelectTrigger className="w-[90px] bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2024, 2025, 2026, 2027].map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Regenerate Button */}
                            <Button
                                className="bg-black hover:bg-black/90 text-white rounded-lg shadow-md whitespace-nowrap ml-2"
                                onClick={() => setShowGenerateConfirm(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Generate
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="rounded-xl border shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Bills</p>
                            <p className="text-3xl font-bold">{stats.totalBills}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="text-3xl font-bold">₹{stats.totalAmount.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-green-100 bg-green-50 shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Paid ({stats.paidCount})</p>
                            <p className="text-3xl font-bold text-green-700">₹{stats.paidAmount.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl border border-yellow-100 bg-yellow-50 shadow-sm">
                        <CardContent className="p-6">
                            <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-1">Pending ({stats.pendingCount})</p>
                            <p className="text-3xl font-bold text-yellow-700">₹{stats.pendingAmount.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscriptions List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12"><div className="loader" /></div>
                    ) : filteredSubs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            {searchTerm ? (
                                <span>No bills found matching "{searchTerm}" in {currentMonth} {currentYear}</span>
                            ) : (
                                <span>No bills found for {currentMonth} {currentYear}</span>
                            )}
                        </div>
                    ) : (
                        filteredSubs.map((sub) => {
                            const student = typeof sub.studentId === 'object' ? sub.studentId : { name: 'Unknown', phone: '', _id: '' };
                            return (
                                <Card key={sub._id} className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">

                                        {/* Left: Student Info */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-foreground">{student.name}</h3>
                                            <div className="flex flex-col text-sm text-muted-foreground">
                                                <span>{student.phone || 'No phone'}</span>
                                                {/* Optional: Show matched criteria if searching */}
                                                {(student.email && searchTerm && student.email.toLowerCase().includes(searchTerm.toLowerCase())) && (
                                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded w-fit mt-1">{student.email}</span>
                                                )}
                                                {(student.address && searchTerm && student.address.toLowerCase().includes(searchTerm.toLowerCase())) && (
                                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded w-fit mt-1">{student.address}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Actions & Status */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-foreground">₹{sub.totalAmount}</p>
                                                <p className={`text-xs font-bold uppercase tracking-wider ${sub.status === 'paid' ? 'text-green-600' :
                                                    sub.status === 'overdue' ? 'text-red-600' : 'text-orange-500'
                                                    }`}>
                                                    {sub.status}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {sub.status !== 'paid' && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleMarkPaid(sub._id)}
                                                        className="font-medium"
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                )}

                                                <Button variant="outline" size="icon" title="No PDF logic yet">
                                                    <FileText className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    className="bg-green-500 hover:bg-green-600 text-white border-green-600"
                                                    onClick={() => handleWhatsApp(sub)}
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    WhatsApp
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Confirm Generation Modal */}
            <Dialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Regenerate Bills?</DialogTitle>
                        <DialogDescription>
                            This will generate bills for all active students for <strong>{currentMonth} {currentYear}</strong>.
                            <br />
                            Existing bills for this month will be skipped. Are you sure you want to proceed?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowGenerateConfirm(false)}>Cancel</Button>
                        <Button onClick={handleGenerateAll} disabled={generating}>
                            {generating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Confirm Generate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default Subscriptions;
