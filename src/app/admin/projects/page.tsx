'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      params.set('page', String(page));
      const res = await fetch(`/api/admin/projects?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setProjects(json.projects);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { setPage(1); }, [search, status]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', fontFamily: "'Playfair Display',serif" }}>Projects</h1>
        <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{total} total projects</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#636366', pointerEvents: 'none' }} />
          <input
            placeholder="Search by title or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#111', color: '#F5F5F7', fontSize: 12, outline: 'none' }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#111', color: '#F5F5F7', fontSize: 12, outline: 'none', cursor: 'pointer' }}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="translating">Translating</option>
          <option value="ready">Ready</option>
          <option value="exported">Exported</option>
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
        ) : projects.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>No projects found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Title</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Owner</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Genre</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Language</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Chapters</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#8E8E93', fontWeight: 500, fontSize: 11 }}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#F5F5F7', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.title}</td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', whiteSpace: 'nowrap' }}>{p.user?.email || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93' }}>{p.genre || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 500, background: 'rgba(201,169,110,0.1)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)', textTransform: 'capitalize' }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', whiteSpace: 'nowrap' }}>{p.sourceLanguage} → {p.targetLanguage}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: '#F5F5F7' }}>{p._count.chapters}</td>
                    <td style={{ padding: '10px 14px', color: '#8E8E93', whiteSpace: 'nowrap' }}>{new Date(p.updatedAt).toLocaleDateString()}</td>
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
