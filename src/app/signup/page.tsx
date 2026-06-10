'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = typeof data.error === 'string' ? data.error : 'Failed to create account';
        setError(errMsg);
        setLoading(false);
        return;
      }

      // Auto sign in after signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign in failed. Please try logging in.');
        setLoading(false);
        return;
      }

      toast.success('Account created! Welcome to Novelify.');
      router.push('/');
      router.refresh();
    } catch {
      setError('Failed to connect. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="h-8 w-8 text-[#C8873A]" />
            <span className="font-bold text-2xl text-[#F7F3EC]">
              Noveli<span className="text-[#C8873A]">fy</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#F7F3EC]">Create your account</h2>
          <p className="mt-1 text-sm text-[#F7F3EC]/50">Start writing for a global audience</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#F7F3EC]/70 mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F7F3EC] placeholder:text-[#F7F3EC]/30 focus:border-[#C8873A] focus:outline-none focus:ring-1 focus:ring-[#C8873A]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F7F3EC]/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#F7F3EC] placeholder:text-[#F7F3EC]/30 focus:border-[#C8873A] focus:outline-none focus:ring-1 focus:ring-[#C8873A]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F7F3EC]/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-[#F7F3EC] placeholder:text-[#F7F3EC]/30 focus:border-[#C8873A] focus:outline-none focus:ring-1 focus:ring-[#C8873A]"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F7F3EC]/40 hover:text-[#F7F3EC]/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-[#C8873A] px-4 py-2.5 text-sm font-semibold text-[#0D0D0D] hover:bg-[#C8873A]/90 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#F7F3EC]/50">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#C8873A] hover:text-[#C8873A]/80">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-xs text-[#F7F3EC]/30 hover:text-[#F7F3EC]/50">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>

      {/* Right decorative panel */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C8873A]/5 via-transparent to-[#C8873A]/10" />
        <div className="flex h-full items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-[#F7F3EC] mb-3">Start your journey</h3>
            <p className="text-[#F7F3EC]/50 leading-relaxed">
              Write in your native language, translate to global markets, 
              and publish on Amazon KDP — all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
