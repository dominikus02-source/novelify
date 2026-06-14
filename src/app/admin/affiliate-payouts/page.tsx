'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Users, AlertCircle, Loader2, X, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
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

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#60A5FA',
  completed: '#34D399',
  failed: '#F87171',
  cancelled: '#8E8E93',
};

function PayoutRow({ p, isExpanded, onToggle }: { p: any; isExpanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        onClick={onToggle}
        style={{ borderBottom: `1px solid ${BORDER}`, cursor: 'pointer', transition: 'background .1s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <td style={{ padding: '12px 16px', color: TEXT, fontSize: 12 }}>{p.affiliate?.user?.email || p.affiliateEmail || '—'}</td>
        <td style={{ padding: '12px 16px', color: GOLD, fontSize: 12, fontWeight: 500 }}>${(p.amount || 0).toFixed(2)}</td>
        <td style={{ padding: '12px 16px' }}>
          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: `${statusColors[p.status] || MUTED}1A`, border: `1px solid ${statusColors[p.status] || MUTED}33`, color: statusColors[p.status] || MUTED }}>
            {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : '—'}
          </span>
        </td>
        <td style={{ padding: '12px 16px', color: DIM, fontSize: 12 }}>{formatDate(p.createdAt)}</td>
        <td style={{ padding: '12px 16px' }}>
          {isExpanded ? <ChevronUp size={14} color={MUTED} /> : <ChevronDown size={14} color={MUTED} />}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} style={{ padding: 0, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.015)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Payout Items</div>
              {(!p.items || p.items.length === 0) ? (
                <div style={{ fontSize: 11, color: DIM }}>No payout items</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Description</th>
                        <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '6px 10px', color: DIM, fontWeight: 500 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.items.map((item: any, i: number) => (
                        <tr key={item.id || i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td style={{ padding: '6px 10px', color: TEXT }}>{item.description || item.commission?.id || 'Commission'}</td>
                          <td style={{ padding: '6px 10px', color: GOLD, fontWeight: 500 }}>${(item.amount || 0).toFixed(2)}</td>
                          <td style={{ padding: '6px 10px', color: DIM }}>{item.status || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState('');
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [availableCommissions, setAvailableCommissions] = useState<any[]>([]);
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/affiliate-payouts');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setPayouts(json.payouts || json);
    } catch {
      setError('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const openCreateDialog = async () => {
    setShowCreate(true);
    setSelectedAffiliate('');
    setSelectedCommissions([]);
    setAvailableCommissions([]);
    try {
      const res = await fetch('/api/admin/affiliates?status=active&limit=100');
      if (res.ok) {
        const json = await res.json();
        setAffiliates(json.affiliates || json);
      }
    } catch {
      // Non-critical
    }
  };

  const handleAffiliateChange = async (affiliateId: string) => {
    setSelectedAffiliate(affiliateId);
    setSelectedCommissions([]);
    setAvailableCommissions([]);
    if (!affiliateId) return;
    setLoadingCommissions(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/commissions?status=payable`);
      if (res.ok) {
        const json = await res.json();
        setAvailableCommissions(json.commissions || json);
      }
    } catch {
      toast.error('Failed to load commissions');
    } finally {
      setLoadingCommissions(false);
    }
  };

  const totalSelected = availableCommissions
    .filter((c: any) => selectedCommissions.includes(c.id))
    .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

  const handleCreate = async () => {
    if (!selectedAffiliate || selectedCommissions.length === 0) {
      toast.error('Please select an affiliate and at least one commission');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/affiliate-payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId: selectedAffiliate, commissionIds: selectedCommissions }),
      });
      if (!res.ok) throw new Error('Failed to create payout');
      toast.success('Payout created');
      setShowCreate(false);
      fetchPayouts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (payoutId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/affiliate-payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Payout updated');
      fetchPayouts();
    } catch {
      toast.error('Failed to update payout');
    }
  };

  return (
    <div>
      <style>{`@keyframes affSpin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: TEXT, fontFamily: "'Playfair Display',serif" }}>Affiliate Payouts</h1>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Manage affiliate commission payouts</p>
        </div>
        <button
          onClick={openCreateDialog}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          <Plus size={14} />
          Create Payout
        </button>
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
        ) : payouts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: MUTED, fontSize: 13 }}>No payouts yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Affiliate', 'Amount', 'Status', 'Date', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p: any) => (
                  <PayoutRow key={p.id} p={p} isExpanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Payout Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: SURFACE2, border: `1px solid ${BORDER_BRIGHT}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: TEXT, letterSpacing: '-0.01em' }}>Create Payout</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: DIM, display: 'block', marginBottom: 4 }}>Select Affiliate</label>
              <select
                value={selectedAffiliate}
                onChange={(e) => handleAffiliateChange(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
              >
                <option value="">Choose an affiliate...</option>
                {affiliates.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.user?.email || a.id} ({a.referralCode})</option>
                ))}
              </select>
            </div>

            {selectedAffiliate && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: DIM, display: 'block', marginBottom: 4 }}>Select Payable Commissions</label>
                {loadingCommissions ? (
                  <div style={{ padding: 20, textAlign: 'center' }}>
                    <Loader2 size={20} style={{ animation: 'affSpin 0.8s linear infinite', color: GOLD }} />
                  </div>
                ) : availableCommissions.length === 0 ? (
                  <div style={{ padding: 16, textAlign: 'center', color: DIM, fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 8 }}>No payable commissions found for this affiliate</div>
                ) : (
                  <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
                    {availableCommissions.map((c: any) => {
                      const checked = selectedCommissions.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer', borderBottom: `1px solid ${BORDER}`, background: checked ? 'rgba(201,169,110,0.05)' : 'transparent' }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedCommissions(prev =>
                                checked ? prev.filter(id => id !== c.id) : [...prev, c.id]
                              );
                            }}
                            style={{ accentColor: GOLD }}
                          />
                          <div style={{ flex: 1, fontSize: 12, color: TEXT }}>
                            Commission — ${(c.amount || 0).toFixed(2)}
                          </div>
                          <div style={{ fontSize: 11, color: DIM }}>{formatDate(c.createdAt)}</div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedCommissions.length > 0 && (
              <div style={{ padding: '12px 16px', background: `${GOLD}0D`, borderRadius: 8, border: `1px solid ${GOLD}33`, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: TEXT }}>Total amount</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: GOLD }}>${totalSelected.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent', color: MUTED, fontSize: 12, cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || selectedCommissions.length === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 20px', borderRadius: 8,
                  background: selectedCommissions.length === 0 ? DIM : `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                  color: '#000', fontSize: 12, fontWeight: 600, border: 'none',
                  cursor: selectedCommissions.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.6 : 1,
                }}
              >
                {creating && <Loader2 size={14} style={{ animation: 'affSpin 0.8s linear infinite' }} />}
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
