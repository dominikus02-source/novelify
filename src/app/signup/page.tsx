'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';
import { getStoredReferralCode } from '@/components/novelify/affiliate-referral-tracker';

const inputBase: React.CSSProperties = {
  background: 'var(--novel-card)',
  border: '1px solid var(--novel-border)',
  color: 'var(--novel-text)',
  outline: 'none',
};

const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--novel-gold)';
  e.currentTarget.style.boxShadow = '0 0 0 3px var(--novel-gold-bg)';
};

const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'var(--novel-border)';
  e.currentTarget.style.boxShadow = 'none';
};

const goldGradient = 'linear-gradient(135deg, var(--novel-gold), var(--novel-gold-light))';

export default function SignupPage() {
  const router = useRouter();
  const { update } = useSession();
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
      const referralCode = getStoredReferralCode();
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, referralCode }),
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
      await update();
      router.push('/onboarding');
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
          <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--novel-text-secondary)' }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
            style={inputBase}
            placeholder="Your name"
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--novel-text-secondary)' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
            style={inputBase}
            placeholder="you@example.com"
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--novel-text-secondary)' }}>
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
              style={inputBase}
              placeholder="At least 6 characters"
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--novel-muted-dark)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-muted)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-muted-dark)'; }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--novel-error-bg)', border: '1px solid var(--novel-error-border)', color: 'var(--destructive)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50"
          style={{
            background: goldGradient,
            color: '#1a0f00',
            boxShadow: '0 2px 12px var(--novel-gold-border)',
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 4px 20px var(--novel-gold-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 2px 12px var(--novel-gold-border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create your account'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--novel-muted-dark)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium transition-colors" style={{ color: 'var(--novel-gold)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-gold-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-gold)'; }}
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] leading-relaxed" style={{ color: 'var(--novel-muted-darker)' }}>
          By creating an account, you agree to{' '}
          <Link href="/terms" className="underline transition-colors" style={{ color: 'var(--novel-muted-darker)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-muted-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-muted-darker)'; }}
          >Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline transition-colors" style={{ color: 'var(--novel-muted-darker)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-muted-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-muted-darker)'; }}
          >Privacy Policy</Link>.
        </p>

        <div className="pt-1">
          <p className="text-center" style={{ color: 'var(--novel-muted-darker)' }}>
            <Link href="/" className="text-xs transition-colors" style={{ color: 'var(--novel-muted-darker)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-muted-dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-muted-darker)'; }}
            >
              Back to home
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
