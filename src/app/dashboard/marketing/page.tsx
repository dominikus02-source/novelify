'use client';

import dynamic from 'next/dynamic';

const MarketingKitPage = dynamic(() => import('@/components/novelify/pages').then(m => m.MarketingKitPage), { ssr: false });

export default function MarketingRoutePage() {
  return <MarketingKitPage />;
}
