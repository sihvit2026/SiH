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
  roleName,
  userName,
  onToggleMobileNav,
  onLogout,
  children,
}) => {
  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden text-slate-400 hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-900 transition-colors"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <span>{title}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {children}

        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-950/30 transition-all flex items-center gap-1.5"
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
