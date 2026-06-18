'use client';

import { useEffect } from 'react';

const REF_STORAGE_KEY = 'novelify_affiliate_ref';

export function AffiliateReferralTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');

    if (!refCode) return;

    localStorage.setItem(REF_STORAGE_KEY, refCode);

    const visitorId = localStorage.getItem('novelify_visitor_id') || `vis_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('novelify_visitor_id', visitorId);

    fetch('/api/affiliate/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referralCode: refCode,
        landingPage: window.location.pathname + window.location.search,
        referrer: document.referrer || '',
        visitorId,
      }),
    }).catch(() => {});
  }, []);

  return null;
}

export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REF_STORAGE_KEY);
}

export function clearStoredReferralCode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REF_STORAGE_KEY);
}
