'use client';

// Note: page is 'use client' so metadata is set via root layout template

import dynamic from 'next/dynamic';

const TemplatesPage = dynamic(() => import('@/components/novelify/pages').then(m => m.TemplatesPage), { ssr: false });

export default function TemplatesRoutePage() {
  return <TemplatesPage />;
}
