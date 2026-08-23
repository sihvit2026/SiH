'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // username OR email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  // Password login: accepts username (e.g. eval-abc123) or real email
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
        // Let auth callback route handle redirect based on role
        router.push('/auth/callback?type=password');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-md mb-2">
            <div className="w-[60px] h-[60px] bg-white rounded-xl flex items-center justify-center">
              <span className="font-bold text-2xl text-blue-600">
                SIH
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            SIH EVALUATION CENTER
          </h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
            VIT Digital Evaluation Platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="text-center border-b border-slate-100 mb-4">
            <CardTitle className="justify-center text-xl text-slate-900">
              Sign In to Platform
            </CardTitle>
            <CardDescription className="text-center">
              Use your username or email and password to log in.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Username or Email"
                type="text"
                placeholder="eval-abc123 or admin@vit.ac.in"
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
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading}>
                Sign In
              </Button>

              <p className="text-center text-[11px] text-slate-500">
                Contact your administrator if you have lost access to your account.
              </p>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            Encrypted Session · Role-Based Access Control · Row Level Security Enforced
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
