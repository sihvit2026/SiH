'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

type LoginMode = 'password' | 'magic';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('password');
  const [identifier, setIdentifier] = useState(''); // username OR email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  // Password login: accepts username (e.g. eval-abc123) or internal email
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      // If user entered username (no @), append internal domain
      const email = identifier.includes('@')
        ? identifier
        : `${identifier}@sih.vit.internal`;

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage({
          type: 'error',
          text: error.message === 'Invalid login credentials'
            ? 'Invalid username or password. Check your credentials and try again.'
            : error.message,
        });
      } else {
        // Let auth callback route handle redirect
        router.push('/auth/callback?type=password');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Magic Link: only for institutional email addresses (admin/data_operator)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const { error } = await supabase.auth.signInWithOtp({
        email: identifier,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          shouldCreateUser: false, // Don't allow self-registration via magic link
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Magic link sent! Check your institutional email inbox.',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 synthwave-grid">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-purple-600 p-0.5 shadow-[0_0_30px_rgba(0,240,255,0.4)] mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-mono font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-400">
                SIH
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
            SIH EVALUATION CENTER
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wide">
            VIT DIGITAL EVALUATION PLATFORM
          </p>
        </div>

        {/* Login Card */}
        <Card glowColor="cyan" className="border-cyan-500/30">
          <CardHeader className="text-center border-b border-slate-800/80 mb-4">
            <CardTitle className="justify-center text-xl text-cyan-300">
              Sign In to Platform
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'password'
                ? 'Use the username and password provided by your administrator'
                : 'Admin & coordinator access via institutional email'}
            </CardDescription>

            {/* Mode Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-800 mt-3">
              <button
                type="button"
                onClick={() => { setMode('password'); setMessage(null); }}
                className={`flex-1 text-xs py-2 font-semibold transition-colors ${
                  mode === 'password'
                    ? 'bg-cyan-500/20 text-cyan-300 border-r border-slate-800'
                    : 'bg-transparent text-slate-500 hover:text-slate-300 border-r border-slate-800'
                }`}
              >
                🔑 Evaluator / Jury Login
              </button>
              <button
                type="button"
                onClick={() => { setMode('magic'); setMessage(null); }}
                className={`flex-1 text-xs py-2 font-semibold transition-colors ${
                  mode === 'magic'
                    ? 'bg-fuchsia-500/20 text-fuchsia-300'
                    : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                ✉️ Admin Magic Link
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {mode === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <Input
                  label="Username"
                  type="text"
                  placeholder="eval-abc123"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value.trim())}
                  required
                  autoComplete="username"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {message && (
                  <div className={`p-3 rounded-lg text-xs font-medium border ${
                    message.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  }`}>
                    {message.text}
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                  Sign In
                </Button>

                <p className="text-center text-[11px] text-slate-500">
                  Your username and password were provided by the SIH coordinator.
                  Contact your administrator if you have lost access.
                </p>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <Input
                  label="Institutional Email Address"
                  type="email"
                  placeholder="coordinator@vit.ac.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="email"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                {message && (
                  <div className={`p-3 rounded-lg text-xs font-medium border ${
                    message.type === 'success'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  }`}>
                    {message.text}
                  </div>
                )}

                <Button type="submit" variant="accent" className="w-full py-3" isLoading={isLoading}>
                  Send Magic Link
                </Button>

                <p className="text-center text-[11px] text-slate-500">
                  Admin and coordinator accounts use institutional email. Magic links are not used
                  for evaluator/jury logins.
                </p>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
            Encrypted Session · Role-Based Access Control · Row Level Security Enforced
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
