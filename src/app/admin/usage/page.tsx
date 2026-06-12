'use client';

import { useState, useEffect, useCallback } from 'react';
import { Brain, FileEdit, Languages, Download, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function AdminUsagePage() {
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(page));
      const res = await fetch(`/api/admin/usage?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setSummary(json.summary);
      setRecords(json.records);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const summaryCards = [
    { key: 'aiCredits', label: 'AI Credits Used', icon: Brain, color: '#60A5FA' },
    { key: 'revisions', label: 'Revisions', icon: FileEdit, color: '#A78BFA' },
    { key: 'translationWords', label: 'Translation Words', icon: Languages, color: '#34D399' },
    { key: 'exports', label: 'Exports', icon: Download, color: '#F59E0B' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Usage Tracking</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>Monthly summary and per-user records</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', marginBottom: 16 }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#F87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#F87171' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const value = loading ? null : (summary ? summary[card.key] : 0);
          return (
            <div key={card.key} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${card.color}1A`, border: `1px solid ${card.color}33`, color: card.color }}>
                  <Icon style={{ width: 14, height: 14 }} />
                </div>
                <span style={{ fontSize: 11, color: '#8E8E93' }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#C9A96E' }}>
                {loading ? <span style={{ color: '#636366' }}>—</span> : (value !== null && value !== undefined ? value.toLocaleString() : '—')}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>Usage Records</div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No usage records yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>User</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>AI Credits</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Revisions</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Translation Words</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Exports</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', whiteSpace: 'nowrap' }}>{r.user?.email || '—'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#F5F5F7' }}>{r.aiCreditsUsed}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#F5F5F7' }}>{r.revisionChecksUsed}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#F5F5F7' }}>{r.translationWordsUsed}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#F5F5F7' }}>{r.exportsUsed}</td>
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
