'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const statuses = ['', 'NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusColors: Record<string, string> = {
  NEW: '#60A5FA', REVIEWED: '#8E8E93', IN_PROGRESS: '#F59E0B', RESOLVED: '#34D399', DISMISSED: '#636366',
};
const priorityColors: Record<string, string> = {
  LOW: '#8E8E93', MEDIUM: '#F59E0B', HIGH: '#F87171', CRITICAL: '#EF4444',
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      const res = await fetch(`/api/admin/feedback?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setFeedback(json.feedback);
      setTotal(json.total);
      setTotalPages(json.totalPages);
      const notes: Record<string, string> = {};
      json.feedback.forEach((f: any) => { notes[f.id] = f.adminNote || ''; });
      setAdminNotes(notes);
    } catch (err) {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);
  useEffect(() => { setPage(1); }, [status]);

  const updateField = async (id: string, data: Record<string, any>) => {
    try {
      setSaving((prev) => ({ ...prev, [id]: true }));
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      setFeedback((prev) => prev.map((f) => f.id === id ? { ...f, ...data } : f));
    } catch (err) {
      setError('Failed to update feedback');
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Feedback</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{total} total submissions</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#111', color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer' }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s || 'All Status'}</option>
          ))}
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
        ) : feedback.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No feedback found</div>
        ) : (
          <div>
            {feedback.map((f) => {
              const isExpanded = expanded[f.id];
              return (
                <div key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div
                    onClick={() => setExpanded((prev) => ({ ...prev, [f.id]: !prev[f.id] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7' }}>{f.category}</span>
                        <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 500, background: `${statusColors[f.status] || '#8E8E93'}1A`, color: statusColors[f.status] || '#8E8E93' }}>{f.status}</span>
                        <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 500, background: `${priorityColors[f.priority] || '#8E8E93'}1A`, color: priorityColors[f.priority] || '#8E8E93' }}>{f.priority}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#8E8E93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.message}</div>
                      <div style={{ fontSize: 10, color: '#636366', marginTop: 2 }}>{f.user?.email || 'Anonymous'} · {new Date(f.createdAt).toLocaleDateString()}</div>
                    </div>
                    {isExpanded ? <ChevronUp style={{ width: 14, height: 14, color: '#636366', flexShrink: 0 }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#636366', flexShrink: 0 }} />}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 14px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#F5F5F7', marginBottom: 8, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{f.message}</div>
                      {f.pageUrl && <div style={{ fontSize: 10, color: '#636366', marginBottom: 8 }}>URL: {f.pageUrl}</div>}

                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#636366' }}>Status:</span>
                        <select
                          value={f.status}
                          onChange={(e) => updateField(f.id, { status: e.target.value })}
                          style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0d', color: '#F5F5F7', fontSize: 10, outline: 'none', cursor: 'pointer' }}
                        >
                          {['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>

                        <span style={{ fontSize: 10, color: '#636366' }}>Priority:</span>
                        <select
                          value={f.priority}
                          onChange={(e) => updateField(f.id, { priority: e.target.value })}
                          style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0d', color: '#F5F5F7', fontSize: 10, outline: 'none', cursor: 'pointer' }}
                        >
                          {priorities.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div style={{ fontSize: 10, color: '#636366', marginBottom: 4 }}>Admin Note:</div>
                        <textarea
                          value={adminNotes[f.id] || ''}
                          onChange={(e) => setAdminNotes((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          placeholder="Add a note..."
                          rows={2}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#0d0d0d', color: '#F5F5F7', fontSize: 11, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                        <button
                          onClick={() => updateField(f.id, { adminNote: adminNotes[f.id] || '' })}
                          disabled={saving[f.id]}
                          style={{ marginTop: 6, padding: '4px 12px', borderRadius: 6, border: 'none', background: '#C9A96E', color: '#1a0f00', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                        >{saving[f.id] ? 'Saving...' : 'Save Note'}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
