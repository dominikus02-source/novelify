'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function AdminAILogsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(page));
      const res = await fetch(`/api/admin/ai-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setEvents(json.events);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      setError('Failed to load AI logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>AI Logs</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{total} total AI usage events</p>
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
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No AI usage events yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>User</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Feature</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Credits</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', whiteSpace: 'nowrap' }}>{e.user?.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', textTransform: 'capitalize' }}>{e.type?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#C9A96E', fontWeight: 600 }}>{e.amount}</td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', whiteSpace: 'nowrap' }}>{new Date(e.createdAt).toLocaleString()}</td>
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
