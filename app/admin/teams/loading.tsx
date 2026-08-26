import React from 'react';
import { Shell } from '@/components/layout/Shell';
import { adminNavItems } from '@/lib/nav';
import { TableContainer, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminTeamsLoading() {
  return (
    <Shell
      title="Team & Student Management"
      roleName="SIH Super Admin"
      roleType="admin"
      userName="Admin"
      navItems={adminNavItems}
    >
      {/* Top Header Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SIH Code</TableHead>
              <TableHead>Team Name</TableHead>
              <TableHead>Problem Statement</TableHead>
              <TableHead>Student Members</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </TableCell>
                <TableCell className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-40" />
                </TableCell>
                <TableCell className="space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 rounded-lg ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Shell>
  );
}
