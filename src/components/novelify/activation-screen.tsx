'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ActivationScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/start');
  }, [router]);

  return null;
}
