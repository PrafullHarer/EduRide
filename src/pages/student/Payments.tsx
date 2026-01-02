import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Loader2, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, paymentsAPI } from '@/lib/api';

interface Payment {
    _id: string;
    amount: number;
    method: string;
    transactionId: string;
    date: string;
    status: 'success' | 'failed' | 'pending';
}

const StudentPayments: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const studentData = await studentsAPI.getByUserId(user.id);
                if (studentData?._id) {
                    const paymentData = await paymentsAPI.getByStudentId(studentData._id);
                    setPayments(paymentData);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout title="Payments" subtitle="View your payment history">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const totalPaid = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);

    return (
        <DashboardLayout title="Payments" subtitle="View your payment history">
            <div className="space-y-6">
                {/* Summary */}
                <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Paid</p>
                                <p className="text-3xl font-bold text-success">₹{totalPaid.toLocaleString()}</p>
                            </div>
                            <CheckCircle className="h-12 w-12 text-success" />
                        </div>
                    </CardContent>
                </Card>

                {/* Payment List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${payment.status === 'success' ? 'bg-success/10' : 'bg-destructive/10'
                                            }`}>
                                            <IndianRupee className={`h-5 w-5 ${payment.status === 'success' ? 'text-success' : 'text-destructive'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">₹{payment.amount}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(payment.date).toLocaleDateString()} • {payment.method.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}>
                                            {payment.status}
                                        </Badge>
                                        {payment.status === 'success' && (
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No payments yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default StudentPayments;
