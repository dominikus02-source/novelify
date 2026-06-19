'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setSubmitted(true);
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--novel-error-bg)', border: '1px solid var(--novel-error-border)', color: 'var(--destructive)' }}>
            {error}
          </div>
        )}

        {submitted ? (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--novel-card)', border: '1px solid var(--novel-border)', color: 'var(--novel-text-secondary)' }}>
            If an account exists with that email, we&apos;ve sent a password reset link.
          </div>
        ) : (
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
          </button>
        )}

        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--novel-muted-dark)' }}>
            <Link href="/login" className="font-medium transition-colors" style={{ color: 'var(--novel-gold)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-gold-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-gold)'; }}
            >
              Back to login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
