'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function AdminBillingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (provider) params.set('provider', provider);
      params.set('page', String(page));
      const res = await fetch(`/api/admin/billing?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setEvents(json.events);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      setError('Failed to load billing events');
    } finally {
      setLoading(false);
    }
  }, [provider, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setPage(1); }, [provider]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Billing Events</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{total} total events</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#111', color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Providers</option>
          <option value="lemonsqueezy">Lemon Squeezy</option>
          <option value="midtrans">Midtrans</option>
          <option value="stripe">Stripe</option>
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
        ) : events.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No billing events found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>User</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Provider</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Amount</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', whiteSpace: 'nowrap' }}>{e.user?.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', textTransform: 'capitalize' }}>{e.provider}</td>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', whiteSpace: 'nowrap' }}>{e.type?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#F5F5F7' }}>{e.amount ? `${(e.amount / 100).toFixed(2)} ${e.currency || ''}` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <StatusBadge status={e.status} />
                    </td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
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

function StatusBadge({ status }: { status: string | null }) {
  const s = status || 'unknown';
  const color = s === 'active' ? '#34D399' : s === 'past_due' ? '#F59E0B' : s === 'canceled' || s === 'expired' ? '#F87171' : '#8E8E93';
  return (
    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 500, background: `${color}1A`, color, textTransform: 'capitalize' }}>{s}</span>
  );
}
