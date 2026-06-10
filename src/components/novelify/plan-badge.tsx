'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Crown } from 'lucide-react';

interface PlanData {
  plan: string;
  config: {
    name: string;
    limits: {
      aiCreditsMonthly: number | 'unlimited';
    };
  };
}

interface UsageData {
  usage: {
    aiCreditsUsed: number;
  };
}

export function PlanBadge() {
  const router = useRouter();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, usageRes] = await Promise.all([
          fetch('/api/billing/plan'),
          fetch('/api/billing/usage'),
        ]);

        if (!planRes.ok) throw new Error('Failed to fetch plan');
        setPlanData(await planRes.json());

        if (usageRes.ok) {
          setUsageData(await usageRes.json());
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClick = () => router.push('/pricing');

  if (loading) {
    return (
      <div style={{ padding: '6px 8px', borderRadius: 8, background: '#161616', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
          <div style={{ width: 36, height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
          borderRadius: 8, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#161616',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#161616'; }}
      >
        <Zap style={{ width: 12, height: 12, color: '#C9A96E', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E', flex: 1 }}>Plan</span>
        <span style={{ fontSize: 9, color: '#FF453A' }}>!</span>
      </div>
    );
  }

  const planName = planData?.config?.name || 'Free';
  const isFree = planData?.plan === 'free';
  const aiCreditsMonthly = planData?.config?.limits?.aiCreditsMonthly ?? 50;
  const aiCreditsUsed = usageData?.usage?.aiCreditsUsed ?? 0;
  const isUnlimitedPlan = aiCreditsMonthly === 'unlimited';
  const total = isUnlimitedPlan ? 100 : aiCreditsMonthly;
  const used = isUnlimitedPlan ? 0 : aiCreditsUsed;
  const percentage = isUnlimitedPlan ? 0 : Math.min((used / total) * 100, 100);

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '6px 8px', borderTop: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer', background: '#161616', borderRadius: 8,
        transition: 'background .15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#161616'; }}
    >
      {isFree ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Zap style={{ width: 12, height: 12, color: '#C9A96E', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E', flex: 1 }}>Free</span>
            <span style={{ fontSize: 9, color: '#8E8E93' }}>{used}/{total}</span>
          </div>
          <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: '#C9A96E', borderRadius: 2, transition: 'width .3s' }} />
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Crown style={{ width: 13, height: 13, color: '#C9A96E', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#C9A96E', flex: 1 }}>{planName}</span>
        </div>
      )}
    </div>
  );
}
