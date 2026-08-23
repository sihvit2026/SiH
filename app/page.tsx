import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 p-4 sm:p-8">
      {/* Header Bar */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-bold text-blue-600 text-base">
              SIH
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider text-slate-900">SIH EVALUATION CENTER</h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">VIT Digital Platform</p>
          </div>
        </div>
        <Link href="/login">
          <Button variant="primary" size="sm">
            Sign In to Platform →
          </Button>
        </Link>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl w-full mx-auto text-center space-y-8 py-12 my-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>PRODUCTION-READY EVALUATION PORTAL</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Role-Based Evaluation & <br />
          <span className="text-blue-600">
            Real-Time Merit Tallying
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Secure multi-role evaluation platform built with Next.js 16 and Supabase RLS. Designed for professional internal screening and external jury panels.
        </p>

        {/* Quick Portal Access Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
          <Link href="/admin" className="block group">
            <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl group-hover:border-indigo-300 group-hover:shadow-md transition-all text-left space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="font-bold text-indigo-700 text-base">Admin Panel</h3>
              <p className="text-xs text-slate-500">Dashboard, Team Roster, Criteria Builder & Audit Logs</p>
            </div>
          </Link>

          <Link href="/round1" className="block group">
            <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl group-hover:border-blue-300 group-hover:shadow-md transition-all text-left space-y-2">
              <div className="text-2xl">📝</div>
              <h3 className="font-bold text-blue-700 text-base">Round 1 Evaluator</h3>
              <p className="text-xs text-slate-500">Assigned team scoring, criteria inputs & comments</p>
            </div>
          </Link>

          <Link href="/round2" className="block group">
            <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl group-hover:border-purple-300 group-hover:shadow-md transition-all text-left space-y-2">
              <div className="text-2xl">⚖️</div>
              <h3 className="font-bold text-purple-700 text-base">Round 2 Jury</h3>
              <p className="text-xs text-slate-500">Jury panel evaluation with attendance locking</p>
            </div>
          </Link>

          <Link href="/reports" className="block group">
            <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl group-hover:border-emerald-300 group-hover:shadow-md transition-all text-left space-y-2">
              <div className="text-2xl">🏆</div>
              <h3 className="font-bold text-emerald-700 text-base">Merit & Reports</h3>
              <p className="text-xs text-slate-500">Aggregated leaderboards, 45 selected & 5 standby</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-4 border-t border-slate-200 text-center text-xs text-slate-500">
        SIH Evaluation Web App • VIT Requirements Compliant • Supabase Row Level Security Enforced
      </footer>
    </div>
  );
}
