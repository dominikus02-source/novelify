'use client';

// Note: page is 'use client' so metadata is set via root layout template

import dynamic from 'next/dynamic';

const AICoWriterPage = dynamic(() => import('@/components/novelify/pages').then(m => m.AICoWriterPage), { ssr: false });

export default function AIPage() {
  return <AICoWriterPage />;
}
