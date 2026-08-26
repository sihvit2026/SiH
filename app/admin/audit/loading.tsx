import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAuditLoading() {
  return (
    <Shell
      title="Immutable Audit Log"
      roleName="SIH Super Admin"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Target Table</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Changes Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Shell>
  );
}
