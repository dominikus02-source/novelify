'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState, useEffect } from 'react';
import { Users, FolderOpen, UserPlus, MessageSquare, Repeat, CreditCard, Brain, Download, AlertCircle } from 'lucide-react';

const metricCards = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: '#60A5FA' },
  { key: 'totalProjects', label: 'Total Projects', icon: FolderOpen, color: '#34D399' },
  { key: 'newUsersWeek', label: 'New Users (Week)', icon: UserPlus, color: '#A78BFA' },
  { key: 'openFeedback', label: 'Open Feedback', icon: MessageSquare, color: '#F472B6' },
  { key: 'totalSubs', label: 'Total Subscriptions', icon: Repeat, color: '#F59E0B' },
  { key: 'paidUsers', label: 'Paid Users', icon: CreditCard, color: '#C9A96E' },
  { key: 'aiUsageMonth', label: 'AI Usage (Month)', icon: Brain, color: '#60A5FA' },
  { key: 'exportsMonth', label: 'Exports (Month)', icon: Download, color: '#34D399' },
  { key: 'failedExports', label: 'Failed Exports', icon: AlertCircle, color: '#F87171' },
];

export default function AdminOverviewPage() {
  const [data, setData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/admin/summary');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load admin summary');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12 }}>
        <AlertCircle style={{ width: 32, height: 32, color: '#F87171' }} />
        <div style={{ fontSize: 14, color: '#F87171', fontWeight: 500 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: '#161616', color: '#F5F5F7', fontSize: 12, cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Admin Overview</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 4 }}>Platform summary at a glance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {metricCards.map((card) => {
          const Icon = card.icon;
          const value = loading ? null : (data ? data[card.key] : 0);
          return (
            <div key={card.key} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${card.color}1A`, border: `1px solid ${card.color}33`, color: card.color }}>
                <Icon style={{ width: 16, height: 16 }} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#C9A96E', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {loading ? (
                    <span style={{ color: '#636366' }}>—</span>
                  ) : (
                    value !== null && value !== undefined ? value.toLocaleString() : '—'
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 3 }}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
