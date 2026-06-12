'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (plan) params.set('plan', plan);
      if (status) params.set('status', status);
      params.set('page', String(page));
      const res = await fetch(`/api/admin/subscriptions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setSubscriptions(json.subscriptions);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [plan, status, page]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);
  useEffect(() => { setPage(1); }, [plan, status]);

  const statusColor = (s: string) => {
    const colors: Record<string, string> = { active: '#34D399', trialing: '#60A5FA', past_due: '#F59E0B', canceled: '#F87171', expired: '#636366', paused: '#8E8E93', free: '#636366' };
    return colors[s] || '#8E8E93';
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Subscriptions</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{total} total subscriptions</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#111', color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="studio">Studio</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#111', color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
          <option value="expired">Expired</option>
          <option value="paused">Paused</option>
          <option value="free">Free</option>
        </select>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', marginBottom: 16 }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#F87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#F87171' }}>{error}</span>
        </div>
      )}

      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No subscriptions found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>User</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Plan</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Provider</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Period End</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Cancel at End</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', whiteSpace: 'nowrap' }}>{s.user?.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', textTransform: 'capitalize' }}>{s.plan}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 500, background: `${statusColor(s.status)}1A`, color: statusColor(s.status), textTransform: 'capitalize' }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93' }}>{s.provider || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', whiteSpace: 'nowrap' }}>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: s.cancelAtPeriodEnd ? '#F87171' : '#34D399' }}>{s.cancelAtPeriodEnd ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: page <= 1 ? '#0a0a0a' : '#111', color: page <= 1 ? '#636366' : '#F5F5F7', fontSize: 12, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
            <ChevronLeft style={{ width: 14, height: 14 }} /> Prev
          </button>
          <span style={{ fontSize: 12, color: '#8E8E93' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: page >= totalPages ? '#0a0a0a' : '#111', color: page >= totalPages ? '#636366' : '#F5F5F7', fontSize: 12, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
            Next <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}
