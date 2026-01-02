import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Driver Dashboard skeleton loader
 * Mirrors the structure of DriverDashboard.tsx
 */
export function DriverDashboardSkeleton() {
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

            {/* Bottom cards - Schedule and Route */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-6 w-20 rounded" />
                                </div>
                                {i === 0 && <Skeleton className="h-9 w-full mt-2" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Route skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default DriverDashboardSkeleton;
