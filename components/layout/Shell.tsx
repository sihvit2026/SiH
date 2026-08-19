'use client';

import React, { useState } from 'react';
import { Sidebar, NavItem } from './Sidebar';
import { Topbar } from './Topbar';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ShellProps {
  children: React.ReactNode;
  title: string;
  roleName: string;
  roleType: 'admin' | 'evaluator' | 'jury' | 'viewer';
  navItems: NavItem[];
  userName?: string;
  userEmail?: string;
  actions?: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  children,
  title,
  roleName,
  roleType,
  navItems,
  userName = 'Evaluator',
  userEmail,
  actions,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 synthwave-grid text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        roleName={roleName}
        roleType={roleType}
        userName={userName}
        userEmail={userEmail}
        isOpenMobile={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <Topbar
          title={title}
          roleName={roleName}
          userName={userName}
          onToggleMobileNav={() => setMobileOpen(true)}
          onLogout={handleLogout}
        >
          {actions}
        </Topbar>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
