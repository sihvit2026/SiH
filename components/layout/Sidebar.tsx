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
    admin: 'from-pink-500 to-purple-600 border-pink-400/40 text-pink-300',
    evaluator: 'from-cyan-500 to-blue-600 border-cyan-400/40 text-cyan-300',
    jury: 'from-purple-500 to-indigo-600 border-purple-400/40 text-purple-300',
    viewer: 'from-slate-600 to-slate-700 border-slate-500/40 text-slate-300',
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950/90 border-r border-slate-800/80 backdrop-blur-xl w-64 p-4 shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 text-lg">
              SIH
            </span>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-sm tracking-wide">SIH EVAL</h1>
          <p className="text-[10px] font-mono text-cyan-400/80 tracking-wider">CONTROL CENTER</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-6 px-2">
        <div className={`px-3 py-2 rounded-lg border bg-slate-900/80 flex items-center justify-between text-xs font-semibold ${roleColors[roleType] || roleColors.viewer}`}>
          <span className="uppercase tracking-wider text-[11px]">{roleName}</span>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900/90 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="pt-4 mt-auto border-t border-slate-800/80 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
