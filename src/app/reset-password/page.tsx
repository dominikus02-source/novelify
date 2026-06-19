'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle={success ? 'Your password has been reset successfully.' : 'Enter your new password below.'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!success && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--novel-text-secondary)' }}>
                New password
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--novel-text-secondary)' }}>
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all duration-200"
                  style={inputBase}
                  placeholder="Re-enter your password"
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--novel-muted-dark)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-muted)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-muted-dark)'; }}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--novel-error-bg)', border: '1px solid var(--novel-error-border)', color: 'var(--destructive)' }}>
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--novel-card)', border: '1px solid var(--novel-border)', color: 'var(--novel-text-secondary)' }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                background: goldGradient,
                color: '#1a0f00',
                boxShadow: '0 2px 12px var(--novel-gold-border)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px var(--novel-gold-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px var(--novel-gold-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Sign in
            </Link>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading || !token}
            className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: goldGradient,
              color: '#1a0f00',
              boxShadow: '0 2px 12px var(--novel-gold-border)',
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 4px 20px var(--novel-gold-border)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 2px 12px var(--novel-gold-border)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset password'}
          </button>
        )}

        {!success && (
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
        )}
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Set new password" subtitle="Loading...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--novel-gold)' }} />
        </div>
      </AuthLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
