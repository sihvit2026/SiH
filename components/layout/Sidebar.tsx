'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarProps {
  navItems: NavItem[];
  roleName: string;
  roleType: 'admin' | 'evaluator' | 'jury' | 'viewer';
  userName?: string;
  userEmail?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  roleName,
  roleType,
  userName = 'User',
  userEmail,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();

  const roleColors: Record<string, string> = {
    admin: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    evaluator: 'bg-blue-50 border-blue-200 text-blue-800',
    jury: 'bg-violet-50 border-violet-200 text-violet-800',
    viewer: 'bg-slate-100 border-slate-300 text-slate-700',
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 p-4 shadow-sm">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-sm">
          <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
            <span className="font-bold text-blue-600 text-lg">SIH</span>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm tracking-wide">SIH EVAL</h1>
          <p className="text-[10px] font-semibold text-slate-500 tracking-wider">CONTROL CENTER</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-6 px-2">
        <div className={`px-3 py-2 rounded-lg border flex items-center justify-between text-xs font-semibold ${roleColors[roleType] || roleColors.viewer}`}>
          <span className="uppercase tracking-wider text-[11px]">{roleName}</span>
          <span className="w-2 h-2 rounded-full bg-current opacity-70" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/round1' && item.href !== '/round2' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-[#1e3a5f] text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${isActive ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="pt-4 mt-auto border-t border-slate-100 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
            {userEmail && <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 bg-white shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
