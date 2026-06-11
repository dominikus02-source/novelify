'use client';

import dynamic from 'next/dynamic';

const AICoWriterPage = dynamic(() => import('@/components/novelify/pages').then(m => m.AICoWriterPage), { ssr: false });

export default function AIPage() {
  return <AICoWriterPage />;
}
