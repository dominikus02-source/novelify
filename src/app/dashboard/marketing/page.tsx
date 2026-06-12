'use client';

// Note: page is 'use client' so metadata is set via root layout template

import dynamic from 'next/dynamic';

const MarketingKitPage = dynamic(() => import('@/components/novelify/pages').then(m => m.MarketingKitPage), { ssr: false });

export default function MarketingRoutePage() {
  return <MarketingKitPage />;
}
