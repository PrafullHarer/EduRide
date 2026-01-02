import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Track Bus page skeleton - shows map placeholder and route info skeleton
 * Immediately displays structure while GPS/route data loads
 */
export function TrackBusSkeleton() {
    return (
        <DashboardLayout title="Track My Bus" subtitle="Loading bus location...">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map placeholder */}
                <div className="lg:col-span-2">
                    <Card className="h-[500px]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent className="h-[calc(100%-60px)]">
                            {/* Map loading placeholder */}
                            <div className="h-full flex items-center justify-center bg-muted/50 rounded-lg">
                                <div className="text-center space-y-3">
                                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                                    <Skeleton className="h-4 w-32 mx-auto" />
                                    <Skeleton className="h-3 w-40 mx-auto" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Route info sidebar skeleton */}
                <div className="lg:col-span-1">
                    <Card className="h-[500px]">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default TrackBusSkeleton;
