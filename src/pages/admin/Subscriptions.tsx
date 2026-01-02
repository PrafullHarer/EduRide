import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CreditCard, Search, Loader2, Calendar } from 'lucide-react';
import { subscriptionsAPI, studentsAPI } from '@/lib/api';

interface Subscription {
    _id: string;
    studentId: { _id: string; name: string } | string;
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
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

    useEffect(() => {
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
        fetchSubscriptions();
    }, []);

    const filteredSubs = filter === 'all'
        ? subscriptions
        : subscriptions.filter(s => s.status === filter);

    const stats = {
        total: subscriptions.reduce((sum, s) => sum + s.totalAmount, 0),
        paid: subscriptions.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalAmount, 0),
        pending: subscriptions.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalAmount, 0),
        overdue: subscriptions.filter(s => s.status === 'overdue').reduce((sum, s) => sum + s.totalAmount, 0),
    };

    if (loading) {
        return (
            <DashboardLayout title="Subscriptions" subtitle="Manage monthly subscriptions">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Subscriptions" subtitle="Manage monthly subscriptions">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="cursor-pointer hover:border-primary" onClick={() => setFilter('all')}>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold">₹{stats.total.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-success" onClick={() => setFilter('paid')}>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-success">₹{stats.paid.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Collected</p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-warning" onClick={() => setFilter('pending')}>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-warning">₹{stats.pending.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card className="cursor-pointer hover:border-destructive" onClick={() => setFilter('overdue')}>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-destructive">₹{stats.overdue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Overdue</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2">
                    {(['all', 'pending', 'paid', 'overdue'] as const).map((f) => (
                        <Badge
                            key={f}
                            variant={filter === f ? 'default' : 'outline'}
                            className="cursor-pointer px-4 py-2"
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Badge>
                    ))}
                </div>

                {/* Subscription List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscriptions ({filteredSubs.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredSubs.map((sub) => (
                                <div key={sub._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {typeof sub.studentId === 'object' ? sub.studentId.name : 'Student'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {sub.month} {sub.year} • {sub.distanceKm} km @ ₹{sub.pricePerKm}/km
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold">₹{sub.totalAmount}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Due: {new Date(sub.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            sub.status === 'paid' ? 'default' :
                                                sub.status === 'pending' ? 'secondary' : 'destructive'
                                        }>
                                            {sub.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {filteredSubs.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No subscriptions found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Subscriptions;
