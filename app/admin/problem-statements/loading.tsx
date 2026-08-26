import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminProblemStatementsLoading() {
  return (
    <Shell
      title="Problem Statements"
      roleName="SIH Super Admin"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      {/* Header Actions Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-72 rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PS Number</TableHead>
              <TableHead>Problem Statement</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Theme</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                <TableCell className="space-y-1">
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-3 w-80" />
                </TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Shell>
  );
}
