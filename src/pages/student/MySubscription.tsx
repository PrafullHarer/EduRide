import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, IndianRupee, CheckCircle } from 'lucide-react';
import { SubscriptionSkeleton } from '@/components/skeleton/SubscriptionSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, subscriptionsAPI, calculateMonthlyFee } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
    _id: string;
    month: string;
    year: number;
    distanceKm: number;
    pricePerKm: number;
    totalAmount: number;
    status: 'pending' | 'paid' | 'overdue';
    dueDate: string;
    paidDate?: string;
}

const MySubscription: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        try {
            const studentData = await studentsAPI.getByUserId(user.id);
            setStudent(studentData);
            if (studentData?._id) {
                const subs = await subscriptionsAPI.getByStudentId(studentData._id);
                setSubscriptions(subs);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Show skeleton loader immediately for better perceived performance
    if (loading) {
        return (
            <DashboardLayout title="My Subscription" subtitle="Loading subscription details...">
                <SubscriptionSkeleton />
            </DashboardLayout>
        );
    }

    const currentSub = subscriptions[0];
    const monthlyFee = student ? calculateMonthlyFee(student.distanceKm) : 0;
    const payAmount = currentSub?.totalAmount || monthlyFee;
    const isPaid = currentSub?.status === 'paid';

    const handlePayNow = () => {
        if (!payAmount) return;
        // Direct UPI Deep Link Redirect
        const upiLink = `upi://pay?pa=demo@slice&pn=EduRide&am=${payAmount}&cu=INR`;
        window.location.href = upiLink;

        toast({
            title: "Opening Payment App",
            description: "Redirecting to your UPI app...",
        });
    };

    return (
        <DashboardLayout title="My Subscription" subtitle="View your subscription details">
            <div className="space-y-6">
                {/* Current Plan */}
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Current Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Distance</p>
                                <p className="text-2xl font-bold">{student?.distanceKm || 0} km</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Rate</p>
                                <p className="text-2xl font-bold">₹{currentSub?.pricePerKm || 150}/km</p>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">Monthly Fee</p>
                                <p className="text-2xl font-bold text-primary">₹{payAmount}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={isPaid ? 'default' : 'destructive'} className="text-sm">
                                        {currentSub?.status || 'No subscription'}
                                    </Badge>
                                    {isPaid && <CheckCircle className="h-4 w-4 text-success" />}
                                </div>
                            </div>
                        </div>

                        {currentSub && !isPaid && (
                            <Button className="w-full" size="lg" onClick={handlePayNow}>
                                <IndianRupee className="h-5 w-5 mr-2" />
                                Pay ₹{payAmount}
                            </Button>
                        )}

                        {isPaid && (
                            <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                <CheckCircle className="h-5 w-5 mx-auto mb-2" />
                                <p className="font-medium">All payments are done</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {subscriptions.map((sub) => (
                                <div key={sub._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{sub.month} {sub.year}</p>
                                            <p className="text-sm text-muted-foreground">{sub.distanceKm} km @ ₹{sub.pricePerKm}/km</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{sub.totalAmount}</p>
                                        <Badge variant={sub.status === 'paid' ? 'default' : sub.status === 'pending' ? 'secondary' : 'destructive'}>
                                            {sub.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {subscriptions.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No subscription history</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default MySubscription;
