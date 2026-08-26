import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminCriteriaLoading() {
  return (
    <Shell
      title="Configurable Criteria Builder"
      roleName="SIH Super Admin"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                  <Skeleton className="h-4 w-44" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
