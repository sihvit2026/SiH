import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboardLoading() {
  return (
    <Shell
      title="Admin Control Center"
      roleName="SIH Super Admin"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      {/* Top Banner Overview Skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Primary Metric Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="mb-2 pb-0 border-b-0 flex flex-row items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shortlisting Action Card Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </div>

      {/* Detailed Status Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
