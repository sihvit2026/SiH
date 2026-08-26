'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
<<<<<<< HEAD
  prefetch?: boolean;
=======
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center">
          <Image
            src="/VIT-logo.png"
            alt="Vishwakarma Institute of Technology, Pune"
<<<<<<< HEAD
            width={200}
            height={40}
            priority
            style={{ width: 'auto', height: 'auto' }}
            className="w-auto h-10 object-contain"
=======
            width={2000}
            height={100}
            className="w-auto object-contain"
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
          />
        </div>

        <div className="mt-4">
          <h1 className="text-sm font-semibold tracking-wide text-slate-900">
            SIH EVALUATION PORTAL
          </h1>

          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Institutional Evaluation System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>

        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && item.href !== '/admin' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
<<<<<<< HEAD
                prefetch={item.prefetch ?? false}
=======
>>>>>>> 52fc6d6b1d321253741e9249f27c7a76ea218d59
                onClick={onCloseMobile}
                className={`
                  relative flex items-center justify-between
                  px-3 py-2.5
                  text-sm
                  transition-colors
                  ${isActive
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-800" />
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={
                      isActive
                        ? 'text-blue-800'
                        : 'text-slate-400'
                    }
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`
                      min-w-5 px-1.5 py-0.5
                      text-[10px] text-center font-semibold
                      ${isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                      }
                    `}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 border border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-semibold text-slate-700">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {userName}
            </p>

            {userEmail && (
              <p className="mt-0.5 text-[10px] text-slate-500 truncate">
                {userEmail}
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
          />

          <div className="relative z-10 w-64 bg-white shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};