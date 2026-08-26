import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAssignmentsLoading() {
  return (
    <Shell
      title="Round 1 / Round 2 Mapping"
      roleName="SIH Super Admin"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Skeleton className="h-10 w-44 rounded-lg" />
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Grid Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg mt-4" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
