'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';

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
    <AuthLayout
      title="Start your first novel"
      subtitle="Create your Novelify account and begin planning, writing, and publishing your story."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: '#aeaeb2' }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
            style={{
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F5F5F7',
              outline: 'none',
            }}
            placeholder="Your name"
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.08)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#aeaeb2' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
            style={{
              background: '#161616',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F5F5F7',
              outline: 'none',
            }}
            placeholder="you@example.com"
            onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.08)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#aeaeb2' }}>
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
              className="block w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all duration-200"
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F5F5F7',
                outline: 'none',
              }}
              placeholder="At least 6 characters"
              onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#636366' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#8E8E93'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#636366'; }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
            color: '#1a0f00',
            boxShadow: '0 2px 12px rgba(201,169,110,0.15)',
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 2px 12px rgba(201,169,110,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create your account'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#636366' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium transition-colors" style={{ color: '#C9A96E' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#E8C98A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#C9A96E'; }}
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] leading-relaxed" style={{ color: '#48484a' }}>
          By creating an account, you agree to{' '}
          <Link href="/terms" className="underline hover:text-[#636366] transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-[#636366] transition-colors">Privacy Policy</Link>.
        </p>

        <div className="pt-1">
          <p className="text-center" style={{ color: '#48484a' }}>
            <Link href="/" className="text-xs transition-colors hover:text-[#636366]">
              Back to home
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
