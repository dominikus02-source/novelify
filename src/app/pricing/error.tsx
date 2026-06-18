'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--novel-bg)', color: 'var(--novel-text)', padding: 24, textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--novel-gold-light)', marginBottom: 8 }}>Something went wrong</h2>
      <p style={{ fontSize: 14, color: 'var(--novel-muted)', marginBottom: 24, maxWidth: 400 }}>An unexpected error occurred. Please try again.</p>
      <button onClick={reset} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--novel-gold)', color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Try again</button>
    </div>
  );
}
