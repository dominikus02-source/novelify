'use client';

import dynamic from 'next/dynamic';

const TemplatesPage = dynamic(() => import('@/components/novelify/pages').then(m => m.TemplatesPage), { ssr: false });

export default function TemplatesRoutePage() {
  return <TemplatesPage />;
}
