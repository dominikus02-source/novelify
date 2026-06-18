'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated') {
      const user = session?.user as any;
      const onboardingDone = user?.onboardingCompleted === true;

      // Only redirect if user is on the root landing page and has completed onboarding
      if (onboardingDone && pathname === '/') {
        router.replace('/dashboard');
      }
    }
  }, [status, router, session, pathname]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#080808', zIndex: 9999 }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  return null;
}
