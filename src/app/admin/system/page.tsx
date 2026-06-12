'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Globe, Database, CreditCard, Brain, Mail, Webhook } from 'lucide-react';

export default function AdminSystemPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/admin/system');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load system status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 80 }}>
        <AlertCircle style={{ width: 28, height: 28, color: '#F87171' }} />
        <div style={{ fontSize: 14, color: '#F87171' }}>{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    {
      icon: Globe,
      label: 'Environment',
      value: data.environment,
      color: '#60A5FA',
    },
    {
      icon: Database,
      label: 'Database',
      value: data.database === 'ok' ? 'Connected' : 'Error',
      color: data.database === 'ok' ? '#34D399' : '#F87171',
      status: data.database === 'ok',
    },
    {
      icon: CreditCard,
      label: 'Lemon Squeezy',
      value: data.lemonsqueezy ? 'Configured' : 'Missing',
      color: data.lemonsqueezy ? '#34D399' : '#F87171',
      status: data.lemonsqueezy,
    },
    {
      icon: CreditCard,
      label: 'Midtrans',
      value: data.midtrans ? 'Configured' : 'Missing',
      color: data.midtrans ? '#34D399' : '#F87171',
      status: data.midtrans,
    },
    {
      icon: Brain,
      label: 'AI Provider',
      value: data.aiProvider ? 'Configured' : 'Missing',
      color: data.aiProvider ? '#34D399' : '#F87171',
      status: data.aiProvider,
    },
    {
      icon: Globe,
      label: 'App URL',
      value: data.appUrl,
      color: '#8E8E93',
    },
    {
      icon: Mail,
      label: 'Admin Emails',
      value: data.adminEmailsConfigured ? `${data.adminEmailCount} configured` : 'Not configured',
      color: data.adminEmailsConfigured ? '#34D399' : '#F87171',
      status: data.adminEmailsConfigured,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>System Status</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>Environment and service configuration</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${card.color}1A`, border: `1px solid ${card.color}33`, color: card.color }}>
              <card.icon style={{ width: 18, height: 18 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2 }}>{card.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7' }}>{card.value}</span>
                {card.status !== undefined && (
                  card.status ? (
                    <CheckCircle style={{ width: 14, height: 14, color: '#34D399', flexShrink: 0 }} />
                  ) : (
                    <XCircle style={{ width: 14, height: 14, color: '#F87171', flexShrink: 0 }} />
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.lastWebhook && (
        <div style={{ marginTop: 20, background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Webhook style={{ width: 16, height: 16, color: '#C9A96E' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Last Webhook Event</span>
          </div>
          <div style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.8 }}>
            <div>Type: <span style={{ color: '#F5F5F7' }}>{data.lastWebhook.type}</span></div>
            <div>Raw: <span style={{ color: '#F5F5F7' }}>{data.lastWebhook.rawType || '—'}</span></div>
            <div>Time: <span style={{ color: '#F5F5F7' }}>{new Date(data.lastWebhook.createdAt).toLocaleString()}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
