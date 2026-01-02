import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { FileText, Save, IndianRupee, Loader2, Check, Calculator, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
        <DashboardLayout title="Pricing Configuration" subtitle="Manage subscription rates and fees">
            <div className="container max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

                {/* Header Banner */}
                <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 shadow-md">
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-semibold">
                                <FileText className="h-5 w-5" />
                                <span>Subscription Settings</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">Standard Per-Km Rate</h2>
                            <p className="text-muted-foreground max-w-md">
                                Define the base rate charged per kilometer for student bus subscriptions.
                                This value is used to automatically calculate monthly bills.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border backdrop-blur-sm">
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Current Rate</p>
                                <p className="text-2xl font-bold text-primary">₹{pricePerKm}/km</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Left: Configuration Panel */}
                    <Card className="shadow-lg border-muted/40 h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                Adjust Pricing
                            </CardTitle>
                            <CardDescription>
                                Drag the slider or enter a custom amount.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">

                            {/* Input & Slider */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="pricePerKm" className="text-base">Rate per Kilometer</Label>
                                        <span className="text-2xl font-bold text-primary">₹{pricePerKm}</span>
                                    </div>
                                    <Slider
                                        value={[pricePerKm]}
                                        min={10}
                                        max={500}
                                        step={5}
                                        onValueChange={(val) => setPricePerKm(val[0])}
                                        className="py-4"
                                    />
                                </div>

                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="pricePerKm"
                                        type="number"
                                        min="1"
                                        value={pricePerKm}
                                        onChange={(e) => setPricePerKm(Number(e.target.value) || 0)}
                                        className="pl-10 text-lg h-12 bg-muted/20"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Last updated: {lastSaved || 'Never'}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Info Box */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/50 flex gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Important Note</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400/90 leading-relaxed">
                                        Updating this rate will only affect specific future calculations.
                                        Existing active subscriptions retain their locked-in price until renewed.
                                    </p>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="w-full text-lg h-12" disabled={saving || pricePerKm <= 0}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-2" />
                                        Save New Rate
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Right: Live Preview */}
                    <Card className="bg-muted/30 border-dashed shadow-inner">
                        <CardHeader>
                            <CardTitle>Bill Preview</CardTitle>
                            <CardDescription>Estimated monthly bill for a student living 12km away</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center p-8">

                            {/* Mock Bill Card */}
                            <div className="bg-background w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border">
                                <div className="bg-primary p-6 text-primary-foreground text-center">
                                    <p className="text-sm uppercase tracking-wider opacity-80 mb-1">Total Amount Due</p>
                                    <h3 className="text-4xl font-bold">₹{(12 * pricePerKm).toLocaleString()}</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b">
                                        <div>
                                            <p className="font-medium">Distance</p>
                                            <p className="text-xs text-muted-foreground">Home to School</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">12 km</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b">
                                        <div>
                                            <p className="font-medium">Rate Applied</p>
                                            <p className="text-xs text-muted-foreground">Standard Tier</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₹{pricePerKm}/km</p>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span>₹{(12 * pricePerKm).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                                            <span>Tax</span>
                                            <span>₹0</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted/50 p-4 text-center">
                                    <Badge variant="outline" className="bg-white">Sample Bill</Badge>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Pricing;
