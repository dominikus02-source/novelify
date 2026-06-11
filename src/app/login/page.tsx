'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function LoginPage() {
  const router = useRouter();
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
    router.push('/');
    router.refresh();
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue writing in your Novelify workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all duration-200"
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F5F5F7',
                outline: 'none',
              }}
              placeholder="Enter your password"
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in to Novelify'}
        </button>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#636366' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors" style={{ color: '#C9A96E' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#E8C98A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#C9A96E'; }}
            >
              Create your account
            </Link>
          </p>
        </div>

        <div className="pt-2">
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
