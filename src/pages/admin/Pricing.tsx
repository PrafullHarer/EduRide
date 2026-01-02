import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Save, IndianRupee, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'schoolBusBuddy_pricePerKm';
const DEFAULT_PRICE = 150;

const Pricing: React.FC = () => {
    const { toast } = useToast();
    const [pricePerKm, setPricePerKm] = useState(DEFAULT_PRICE);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // Load saved price on mount
    useEffect(() => {
        const savedPrice = localStorage.getItem(STORAGE_KEY);
        const savedDate = localStorage.getItem(STORAGE_KEY + '_date');
        if (savedPrice) {
            setPricePerKm(parseInt(savedPrice));
        }
        if (savedDate) {
            setLastSaved(savedDate);
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);

        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, pricePerKm.toString());
        const now = new Date().toLocaleString();
        localStorage.setItem(STORAGE_KEY + '_date', now);
        setLastSaved(now);

        toast({
            title: 'Pricing Updated',
            description: `Price per km set to ₹${pricePerKm}. This will apply to new subscriptions.`,
        });

        setSaving(false);
    };

    return (
        <DashboardLayout title="Pricing" subtitle="Configure subscription pricing">
            <div className="max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Subscription Pricing
                        </CardTitle>
                        <CardDescription>
                            Set the price per kilometer for student subscriptions. This will be used to calculate monthly fees.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="pricePerKm">Price per Kilometer (₹)</Label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="pricePerKm"
                                    type="number"
                                    min="1"
                                    value={pricePerKm}
                                    onChange={(e) => setPricePerKm(Number(e.target.value) || 0)}
                                    className="pl-10 text-lg"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <p className="text-sm font-medium">Example Calculation</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Distance</p>
                                    <p className="font-semibold">10 km</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Rate</p>
                                    <p className="font-semibold">₹{pricePerKm}/km</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Monthly Fee</p>
                                    <p className="font-semibold text-primary">₹{10 * pricePerKm}</p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleSave} className="w-full" disabled={saving || pricePerKm <= 0}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Pricing
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">₹{pricePerKm}/km</p>
                                        <p className="text-sm text-muted-foreground">Active rate</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {lastSaved ? `Last updated: ${lastSaved}` : 'Not saved yet'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dashed">
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground text-center">
                            💡 <strong>Tip:</strong> Changes to pricing will only affect new subscriptions. Existing subscriptions will keep their original rate until renewed.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Pricing;
