import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


/**
 * Subscription page skeleton - shows current plan and history skeletons
 * Displays immediately while subscription data loads
 */
export function SubscriptionSkeleton() {
    return (
        <div className="space-y-6">
            {/* Current Plan Card skeleton */}
            <Card className="border-primary">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-4 bg-muted rounded-lg space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>

            {/* Subscription History Card skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-14 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SubscriptionSkeleton;
