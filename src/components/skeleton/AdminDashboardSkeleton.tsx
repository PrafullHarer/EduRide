import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Admin Dashboard skeleton loader
 * Mirrors the structure of AdminDashboard.tsx
 */
export function AdminDashboardSkeleton() {
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

            {/* Bottom cards - Recent Subscriptions and Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Subscriptions skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <Skeleton className="h-4 w-16 ml-auto" />
                                        <Skeleton className="h-5 w-12 rounded ml-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats skeleton */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="p-4 bg-muted/50 rounded-lg text-center space-y-2">
                                <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                                <Skeleton className="h-8 w-16 mx-auto" />
                                <Skeleton className="h-4 w-24 mx-auto" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AdminDashboardSkeleton;
