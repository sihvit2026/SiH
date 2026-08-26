'use client';

import React from 'react';

interface TopbarProps {
  title?: string;
  roleName: string;
  userName?: string;
  onToggleMobileNav?: () => void;
  onLogout?: () => void;
  children?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({
  title = 'Dashboard',
  onToggleMobileNav,
  onLogout,
  children,
}) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden text-slate-500 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>{title}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {children}

        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
