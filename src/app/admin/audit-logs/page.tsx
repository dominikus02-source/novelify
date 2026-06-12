'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(page));
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setLogs(json.logs);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Audit Logs</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{total} total audit entries</p>
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
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No audit logs yet</div>
        ) : (
          <div>
            {logs.map((log) => {
              const isExpanded = expanded[log.id];
              let metadata = null;
              try {
                if (log.metadataJson) metadata = JSON.parse(log.metadataJson);
              } catch {}
              return (
                <div key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div
                    onClick={() => metadata && setExpanded((prev) => ({ ...prev, [log.id]: !prev[log.id] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: metadata ? 'pointer' : 'default' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#F5F5F7' }}>{log.adminUser?.email || 'Unknown'}</span>
                        <span style={{ fontSize: 11, color: '#8E8E93' }}>{log.action}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#636366', marginTop: 2 }}>
                        {log.targetUser ? `Target: ${log.targetUser.email} · ` : ''}
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {metadata && (
                      isExpanded ? <ChevronUp style={{ width: 14, height: 14, color: '#636366', flexShrink: 0 }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#636366', flexShrink: 0 }} />
                    )}
                  </div>
                  {isExpanded && metadata && (
                    <div style={{ padding: '0 14px 12px 14px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
                      <pre style={{ fontSize: 10, color: '#8E8E93', background: '#0d0d0d', borderRadius: 8, padding: 10, overflow: 'auto', maxHeight: 200, margin: 0, fontFamily: "'Geist Mono', monospace" }}>
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
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
