import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Loader2, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { paymentsAPI } from '@/lib/api';

interface Payment {
    _id: string;
    studentName: string;
    amount: number;
    method: 'card' | 'upi' | 'netbanking' | 'cash';
    transactionId: string;
    date: string;
    status: 'success' | 'failed' | 'pending';
}

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await paymentsAPI.getAll();
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const stats = {
        total: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0),
        count: payments.filter(p => p.status === 'success').length,
        pending: payments.filter(p => p.status === 'pending').length,
        failed: payments.filter(p => p.status === 'failed').length,
    };

    if (loading) {
        return (
            <DashboardLayout title="Payments" subtitle="View payment history">
                <div className="flex items-center justify-center h-64">
                    <div className="loader" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Payments" subtitle="View payment history">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-success/5 border-success/20">
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-success">₹{stats.total.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Total Collected</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold">{stats.count}</p>
                            <p className="text-sm text-muted-foreground">Successful Payments</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                            <p className="text-sm text-muted-foreground">Failed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payment.status === 'success' ? 'bg-success/10' :
                                            payment.status === 'failed' ? 'bg-destructive/10' : 'bg-warning/10'
                                            }`}>
                                            {payment.status === 'success' ? <CheckCircle className="h-5 w-5 text-success" /> :
                                                payment.status === 'failed' ? <XCircle className="h-5 w-5 text-destructive" /> :
                                                    <Clock className="h-5 w-5 text-warning" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{payment.studentName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(payment.date).toLocaleDateString()} • {payment.method.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold">₹{payment.amount}</p>
                                            <p className="text-xs font-mono text-muted-foreground">{payment.transactionId}</p>
                                        </div>
                                        <Badge variant={
                                            payment.status === 'success' ? 'default' :
                                                payment.status === 'failed' ? 'destructive' : 'secondary'
                                        }>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No payments found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Payments;
