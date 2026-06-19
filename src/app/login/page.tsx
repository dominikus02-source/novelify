'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
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

export default function LoginPage() {
  const router = useRouter();
  const { update } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
      return;
    }

    toast.success('Welcome back!');
    await update();
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue writing in your Novelify workspace."
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--novel-text-secondary)' }}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all duration-200"
              style={inputBase}
              placeholder="Enter your password"
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

        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--novel-muted-dark)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-gold)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-muted-dark)'; }}
          >
            Forgot password?
          </Link>
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in to Novelify'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--novel-muted-dark)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors" style={{ color: 'var(--novel-gold)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--novel-gold-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--novel-gold)'; }}
            >
              Create your account
            </Link>
          </p>
        </div>

        <div className="pt-2">
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
