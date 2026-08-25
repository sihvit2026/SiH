'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier || !password) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const email = identifier.includes('@')
        ? identifier
        : `${identifier}@sih.vit.internal`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({
          type: 'error',
          text:
            error.message === 'Invalid login credentials'
              ? 'Invalid username or password. Check your credentials and try again.'
              : error.message,
        });
      } else {
        router.push('/auth/callback?type=password');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">

      {/* Left VIT vertical strip */}
      <div className="fixed left-0 top-0 bottom-0 w-[120px] bg-white hidden lg:flex items-center justify-center z-20">
        <div className="-rotate-90 whitespace-nowrap">
          <span className="text-blue-900 text-xl font-bold tracking-[0.3em] uppercase">
            Vishwakarma Institute of Technology, Pune
          </span>
        </div>
      </div>

      {/* Right SIH vertical strip */}
      <div className="fixed right-0 top-0 bottom-0 w-[120px] bg-white hidden lg:flex items-center justify-center z-20">
        <div className="rotate-90 whitespace-nowrap">
          <span className="text-orange-500 text-xl font-bold tracking-[0.3em] uppercase">
            Smart India Hackathon 2026
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 h-20 flex items-center justify-center">
          <div className="flex items-center gap-4">
            {/* VIT × SIH */}
            <div className="flex items-center gap-3">
              <Image
                src="/VIT-logo.png"
                alt="VIT Pune"
                width={230}
                height={150}
                className="h-[78px] w-auto object-contain"
              />
              <span className="text-xl font-medium text-slate-400">
                ×
              </span>
              <Image
                src="/SIH.jpg"
                alt="Smart India Hackathon"
                width={100}
                height={80}
                className="h-[80px] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">

        <section className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-24">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — Introduction */}
            <div className="max-w-3xl">

              <p className="text-sm font-semibold tracking-wide text-blue-800 uppercase mb-5">
                Smart India Hackathon 2026
              </p>

              <h2 className="text-5xl sm:text-6xl lg:text-[64px] font-semibold tracking-tight leading-[1.08] text-slate-900">
                Evaluation Portal
              </h2>

              <p className="mt-7 text-lg leading-8 text-slate-600 max-w-2xl">
                A centralized platform for managing teams, problem statements,
                evaluator assignments and structured evaluation rounds.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">

                <div className="px-4 py-2 border border-slate-200 rounded-md text-sm text-slate-600">
                  Team Management
                </div>

                <div className="px-4 py-2 border border-slate-200 rounded-md text-sm text-slate-600">
                  Problem Statements
                </div>

                <div className="px-4 py-2 border border-slate-200 rounded-md text-sm text-slate-600">
                  Structured Evaluation
                </div>

              </div>

            </div>


            {/* RIGHT — Login */}
            <div className="w-full max-w-md lg:ml-auto">

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-7">

                <div className="mb-6">

                  <h3 className="text-xl font-semibold text-slate-900">
                    Sign in to the portal
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Use your institutional credentials to continue.
                  </p>

                </div>

                <form
                  onSubmit={handlePasswordLogin}
                  className="space-y-4"
                >

                  <Input
                    label="Username or Email"
                    type="text"
                    placeholder="eval-abc123 or admin@vit.ac.in"
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(e.target.value.trim())
                    }
                    required
                    autoComplete="username"
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    autoComplete="current-password"
                  />

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium border ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3"
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>

                </form>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-xs text-slate-400 text-center">
                    Secure authentication · Role-based access
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* Information */}
        <section className="border-y border-slate-200 bg-slate-50">

          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Team Management
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Manage registered teams, team leaders and members through
                  a centralized institutional system.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Problem Statements
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Access official problem statements and their descriptions
                  while evaluating participating teams.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Evaluation
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Conduct structured evaluation rounds with role-based access
                  for evaluators and jury members.
                </p>
              </div>

            </div>

          </div>

        </section>

      </main>


      {/* Footer */}
      <footer className="border-t border-slate-200">

        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-xs text-slate-500">
              Smart India Hackathon 2026
            </p>

            <p className="text-xs text-slate-500">
              Institutional Evaluation Portal
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}