'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Users, DollarSign, AlertCircle, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

const GOLD = '#C9A96E';
const GOLD_LIGHT = '#E8C98A';
const BG = '#080808';
const SURFACE = '#111111';
const SURFACE2 = '#121212';
const TEXT = '#F5F5F7';
const MUTED = '#8E8E93';
const DIM = '#636366';
const BORDER = 'rgba(255,255,255,0.06)';
const BORDER_BRIGHT = 'rgba(255,255,255,0.12)';

const FILTERS = ['All', 'Pending', 'Active', 'Suspended', 'Rejected'];

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  active: '#34D399',
  suspended: '#F87171',
  rejected: '#8E8E93',
};

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function AffiliateRow({ a, isExpanded, onToggle }: { a: any; isExpanded: boolean; onToggle: () => void }) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(a.status || 'pending');
  const [tier, setTier] = useState(a.tier || 'STANDARD');
  const [customRate, setCustomRate] = useState(a.customCommissionRate ?? '');

  const handleUpdate = async (field: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`${field} updated`);
    } catch {
      toast.error(`Failed to update ${field}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <tr
        onClick={onToggle}
        style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background .1s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 13, fontWeight: 500 }}>{a.referralCode || '—'}</td>
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 12 }}>{a.user?.email || '—'}</td>
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 12 }}>{a.user?.name || '—'}</td>
        <td style={{ padding: '12px 16px' }}>
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: `${statusColors[a.status] || MUTED}1A`, border: `1px solid ${statusColors[a.status] || MUTED}33`, color: statusColors[a.status] || MUTED }}>
            {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : '—'}
          </span>
        </td>
        <td style={{ padding: '12px 16px', color: DIM, fontSize: 12 }}>{a.tier || 'STANDARD'}</td>
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 12 }}>{a.totalClicks ?? 0}</td>
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 12 }}>{a.totalSignups ?? 0}</td>
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 12 }}>{a.paidCustomers ?? 0}</td>
        <td style={{ padding: '12px 16px', color: GOLD, fontSize: 12, fontWeight: 500 }}>${(a.totalCommissionEarned ?? 0).toFixed(2)}</td>
        <td style={{ padding: '12px 16px', color: DIM, fontSize: 12 }}>{formatDate(a.createdAt)}</td>
        <td style={{ padding: '12px 16px' }}>
          {isExpanded ? <ChevronUp size={14} color={MUTED} /> : <ChevronDown size={14} color={MUTED} />}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={11} style={{ padding: 0, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.015)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Full Profile</div>
                  <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.8 }}>
                    <div>ID: {a.id}</div>
                    <div>Email: {a.user?.email || '—'}</div>
                    <div>Name: {a.user?.name || '—'}</div>
                    <div>Code: {a.referralCode || '—'}</div>
                    <div>Joined: {formatDate(a.createdAt)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Status</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); handleUpdate('status', e.target.value); }}
                        disabled={saving}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                      >
                        {['pending', 'active', 'suspended', 'rejected'].map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {saving && <Loader2 size={14} style={{ animation: 'affSpin 0.8s linear infinite', color: GOLD, alignSelf: 'center' }} />}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => { setTier(e.target.value); handleUpdate('tier', e.target.value); }}
                      disabled={saving}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                    >
                      {['STANDARD', 'TOP_PARTNER', 'CUSTOM'].map((t) => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 10, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Custom Commission Rate (%)</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        value={customRate}
                        onChange={(e) => setCustomRate(e.target.value)}
                        placeholder="e.g. 35"
                        type="number"
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                      />
                      <button
                        onClick={() => handleUpdate('customCommissionRate', customRate === '' ? null : Number(customRate))}
                        disabled={saving}
                        style={{ padding: '6px 12px', borderRadius: 6, background: GOLD, color: '#000', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referrals */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Referrals ({a.referrals?.length || 0})</div>
                {(!a.referrals || a.referrals.length === 0) ? (
                  <div style={{ fontSize: 11, color: DIM }}>No referrals</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>User</th>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.referrals.map((r: any, i: number) => (
                          <tr key={r.id || i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td style={{ padding: '6px 10px', color: TEXT }}>{r.referredUser?.email || r.referredEmail || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>
                              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: `${statusColors[r.status] || MUTED}1A`, border: `1px solid ${statusColors[r.status] || MUTED}33`, color: statusColors[r.status] || MUTED }}>
                                {r.status || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '6px 10px', color: DIM }}>{formatDate(r.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Commissions */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Commissions ({a.commissions?.length || 0})</div>
                {(!a.commissions || a.commissions.length === 0) ? (
                  <div style={{ fontSize: 11, color: DIM }}>No commissions</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Amount</th>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.commissions.map((c: any, i: number) => (
                          <tr key={c.id || i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td style={{ padding: '6px 10px', color: GOLD, fontWeight: 500 }}>${(c.amount || 0).toFixed(2)}</td>
                            <td style={{ padding: '6px 10px' }}>
                              <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500, background: `${statusColors[c.status] || MUTED}1A`, border: `1px solid ${statusColors[c.status] || MUTED}33`, color: statusColors[c.status] || MUTED }}>
                                {c.status || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '6px 10px', color: DIM }}>{formatDate(c.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchAffiliates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filter !== 'All') params.set('status', filter.toLowerCase());
      const res = await fetch(`/api/admin/affiliates?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setAffiliates(json.affiliates || json);
      if (json.stats) setStats(json.stats);
      if (json.total !== undefined) setStats((prev: any) => ({ ...prev, total: json.total }));
    } catch {
      setError('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchAffiliates(); }, [fetchAffiliates]);

  return (
    <div>
      <style>{`@keyframes affSpin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: TEXT, fontFamily: "'Playfair Display',serif" }}>Affiliates</h1>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{stats?.total ?? affiliates.length} total affiliates</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: Users, label: 'Total Affiliates', value: stats?.total ?? affiliates.length, color: '#60A5FA' },
          { icon: Users, label: 'Active', value: stats?.active ?? affiliates.filter((a: any) => a.status === 'active').length, color: '#34D399' },
          { icon: DollarSign, label: 'Pending Commissions', value: stats?.pendingCommissions ?? '—', color: '#F59E0B' },
          { icon: DollarSign, label: 'Payable Amount', value: stats?.payableAmount != null ? `$${stats.payableAmount.toFixed(2)}` : '—', color: '#C9A96E' },
        ].map((card) => (
          <div key={card.label} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${card.color}1A`, border: `1px solid ${card.color}33`, color: card.color }}>
              <card.icon style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: GOLD, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: DIM, pointerEvents: 'none' }} />
          <input
            placeholder="Search by email or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, color: TEXT, fontSize: 12, outline: 'none' }}
          />
        </div>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter === f ? GOLD : BORDER}`,
              background: filter === f ? `${GOLD}1A` : 'transparent',
              color: filter === f ? GOLD : MUTED, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', marginBottom: 16 }}>
          <AlertCircle style={{ width: 14, height: 14, color: '#F87171', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#F87171' }}>{error}</span>
        </div>
      )}

      {/* Table */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'affSpin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : affiliates.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: MUTED, fontSize: 13 }}>No affiliates found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Code', 'Email', 'Name', 'Status', 'Tier', 'Clicks', 'Signups', 'Paid', 'Earned', 'Joined', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a: any) => (
                  <AffiliateRow
                    key={a.id}
                    a={a}
                    isExpanded={expanded === a.id}
                    onToggle={() => setExpanded(expanded === a.id ? null : a.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
