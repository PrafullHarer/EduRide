import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { CreditCard, Calendar, IndianRupee, CheckCircle, Loader2 } from 'lucide-react';
import { SubscriptionSkeleton } from '@/components/skeleton/SubscriptionSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI, subscriptionsAPI, paymentsAPI, calculateMonthlyFee } from '@/lib/api';
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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);

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

    const handlePayment = async () => {
        if (!student) return;

        setProcessing(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const currentSub = subscriptions[0];
            const amount = currentSub?.totalAmount || calculateMonthlyFee(student.distanceKm);

            await paymentsAPI.create({
                studentId: student._id,
                studentName: student.name,
                subscriptionId: currentSub?._id,
                amount,
                method: paymentMethod,
                transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
                status: 'success',
                date: new Date().toISOString()
            });

            toast({
                title: 'Payment Successful',
                description: `Paid ₹${amount} via ${paymentMethod.toUpperCase()}`,
            });

            setShowPaymentModal(false);
            fetchData(); // Refresh to update status
        } catch (error: any) {
            toast({
                title: 'Payment Failed',
                description: error.message || 'Could not process payment',
                variant: 'destructive',
            });
        } finally {
            setProcessing(false);
        }
    };

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

                        {!isPaid && (
                            <Button className="w-full" size="lg" onClick={() => setShowPaymentModal(true)}>
                                <IndianRupee className="h-5 w-5 mr-2" />
                                Pay ₹{payAmount}
                            </Button>
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

            {/* Payment Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Make Payment</DialogTitle>
                        <DialogDescription>
                            Complete your payment for the monthly subscription.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                            <span className="font-medium">Total Amount</span>
                            <span className="text-2xl font-bold text-primary">₹{payAmount}</span>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Payment Method</Label>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                                <div>
                                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                    <Label
                                        htmlFor="card"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <CreditCard className="mb-2 h-6 w-6" />
                                        Card
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                                    <Label
                                        htmlFor="upi"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <IndianRupee className="mb-2 h-6 w-6" />
                                        UPI
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>Card Details (Simulated)</Label>
                                <Input placeholder="0000 0000 0000 0000" disabled />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input placeholder="MM/YY" disabled />
                                    <Input placeholder="CVC" disabled />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'upi' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>UPI ID (Simulated)</Label>
                                <Input placeholder="username@upi" disabled />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)} disabled={processing}>Cancel</Button>
                        <Button onClick={handlePayment} disabled={processing} className="w-full sm:w-auto">
                            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Pay ₹{payAmount}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default MySubscription;
