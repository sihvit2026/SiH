import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ReportsLoading() {
  return (
    <Shell
      title="Merit Leaderboards & Official Reports"
      roleName="SIH Executive Report"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      <div className="space-y-1">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </CardHeader>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Evaluators / Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <TableRow key={j}>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
