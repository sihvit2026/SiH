'use client';

import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => (
  <div className={`flex items-center border-b border-slate-200 overflow-x-auto ${className}`}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            isActive
              ? 'border-[#1e3a5f] text-[#1e3a5f]'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              isActive ? 'bg-[#1e3a5f] text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
