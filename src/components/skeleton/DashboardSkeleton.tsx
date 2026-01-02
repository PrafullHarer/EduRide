import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Dashboard skeleton loader - displays immediately while data is being fetched
 * Improves perceived performance by showing the page structure instantly
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Stats row skeleton - 4 stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom cards - Subscription and Route info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription card skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="text-right space-y-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>

                {/* Route info card skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-36" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

/**
 * Wrapped dashboard skeleton with layout
 */
export function StudentDashboardSkeleton() {
    return (
        <DashboardLayout title="Dashboard" subtitle="Loading your data...">
            <DashboardSkeleton />
        </DashboardLayout>
    );
}

export default DashboardSkeleton;
