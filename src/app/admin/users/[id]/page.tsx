'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, FolderOpen, MessageSquare, Download, CreditCard, AlertCircle } from 'lucide-react';

const roleColors: Record<string, string> = {
  USER: '#60A5FA',
  ADMIN: '#F59E0B',
  SUPER_ADMIN: '#F87171',
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [planDropdown, setPlanDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [confirmRole, setConfirmRole] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setUser(json);
        setSelectedRole(json.role);
        setSelectedPlan(json.plan);
      } catch (err) {
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user.role) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUser((prev: any) => ({ ...prev, role: selectedRole }));
      setConfirmRole(false);
      setRoleDropdown(false);
    } catch (err) {
      setError('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handlePlanChange = async () => {
    if (!selectedPlan || selectedPlan === user.plan) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/users/${id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      setUser((prev: any) => ({ ...prev, plan: selectedPlan }));
      setConfirmPlan(false);
      setPlanDropdown(false);
    } catch (err) {
      setError('Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 80 }}>
        <AlertCircle style={{ width: 28, height: 28, color: '#F87171' }} />
        <div style={{ fontSize: 14, color: '#F87171' }}>{error}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <button onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8E8E93', fontSize: 12, cursor: 'pointer', padding: '4px 0', marginBottom: 16 }}>
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Users
      </button>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }}>
        <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#C9A96E' }}>
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#F5F5F7' }}>{user.name || 'Unnamed'}</span>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: `${roleColors[user.role] || '#8E8E93'}1A`, color: roleColors[user.role] || '#8E8E93', border: `1px solid ${roleColors[user.role] || '#8E8E93'}33` }}>{user.role}</span>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)', textTransform: 'capitalize' }}>{user.plan}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: '#8E8E93', fontSize: 12 }}>
                <Mail style={{ width: 12, height: 12 }} /> {user.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: '#8E8E93', fontSize: 12 }}>
                <Calendar style={{ width: 12, height: 12 }} /> Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setRoleDropdown(!roleDropdown); setPlanDropdown(false); }}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#161616', color: '#F5F5F7', fontSize: 11, cursor: 'pointer' }}
                >Change Role</button>
                {roleDropdown && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 6, zIndex: 20, minWidth: 150 }}>
                    {['USER', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
                      <button
                        key={r}
                        onClick={() => { setSelectedRole(r); setConfirmRole(true); }}
                        style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', background: selectedRole === r ? 'rgba(201,169,110,0.1)' : 'transparent', color: selectedRole === r ? '#E8C98A' : '#F5F5F7', fontSize: 11, cursor: 'pointer', textAlign: 'left' }}
                      >{r}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setPlanDropdown(!planDropdown); setRoleDropdown(false); }}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#161616', color: '#F5F5F7', fontSize: 11, cursor: 'pointer' }}
                >Change Plan</button>
                {planDropdown && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 6, zIndex: 20, minWidth: 150 }}>
                    {['free', 'starter', 'pro', 'studio'].map((p) => (
                      <button
                        key={p}
                        onClick={() => { setSelectedPlan(p); setConfirmPlan(true); }}
                        style={{ display: 'block', width: '100%', padding: '6px 10px', borderRadius: 6, border: 'none', background: selectedPlan === p ? 'rgba(201,169,110,0.1)' : 'transparent', color: selectedPlan === p ? '#E8C98A' : '#F5F5F7', fontSize: 11, cursor: 'pointer', textAlign: 'left', textTransform: 'capitalize' }}
                      >{p}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {user.subscription && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#0d0d0d', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12 }}>
              <span style={{ color: '#8E8E93' }}>Subscription: <span style={{ color: '#F5F5F7', textTransform: 'capitalize' }}>{user.subscription.plan}</span></span>
              <span style={{ color: '#8E8E93' }}>Status: <span style={{ color: '#F5F5F7', textTransform: 'capitalize' }}>{user.subscription.status}</span></span>
              <span style={{ color: '#8E8E93' }}>Provider: <span style={{ color: '#F5F5F7' }}>{user.subscription.provider || '—'}</span></span>
              {user.subscription.currentPeriodEnd && (
                <span style={{ color: '#8E8E93' }}>Period End: <span style={{ color: '#F5F5F7' }}>{new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}</span></span>
              )}
              <span style={{ color: '#8E8E93' }}>Cancel at end: <span style={{ color: user.subscription.cancelAtPeriodEnd ? '#F87171' : '#34D399' }}>{user.subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</span></span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Section icon={FolderOpen} title="Recent Projects" count={user._count?.projects}>
            {user.projects.length === 0 ? <EmptyMsg /> : user.projects.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#F5F5F7', fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 1 }}>{p.genre || 'No genre'} · {p._count.chapters} chapters</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: '#8E8E93', textTransform: 'capitalize' }}>{p.status}</span>
              </div>
            ))}
          </Section>

          <Section icon={MessageSquare} title="Recent Feedback" count={user.feedback?.length}>
            {user.feedback?.length === 0 ? <EmptyMsg /> : user.feedback?.map((f: any) => (
              <div key={f.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 10, color: '#C9A96E', fontWeight: 500 }}>{f.category}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.message}</div>
                <div style={{ fontSize: 10, color: '#636366', marginTop: 2 }}>{new Date(f.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </Section>

          <Section icon={Download} title="Recent Exports" count={user.exportJobs?.length}>
            {user.exportJobs?.length === 0 ? <EmptyMsg /> : user.exportJobs?.map((e: any) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#F5F5F7' }}>{e.format?.toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: '#8E8E93' }}>{new Date(e.createdAt).toLocaleDateString()}</div>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </Section>

          <Section icon={CreditCard} title="Recent Billing" count={user.billingEvents?.length}>
            {user.billingEvents?.length === 0 ? <EmptyMsg /> : user.billingEvents?.map((b: any) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#F5F5F7' }}>{b.type?.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: 10, color: '#8E8E93' }}>{b.provider} · {b.amount ? `${(b.amount / 100).toFixed(2)} ${b.currency || ''}` : '—'}</div>
                </div>
                <span style={{ fontSize: 10, color: '#8E8E93' }}>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </Section>
        </div>
      </div>

      {confirmRole && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24, maxWidth: 360, width: '90%' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7', marginBottom: 8 }}>Change Role</div>
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 16 }}>Change user role from <strong style={{ color: '#F5F5F7' }}>{user.role}</strong> to <strong style={{ color: '#F5F5F7' }}>{selectedRole}</strong>?</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setConfirmRole(false); setSelectedRole(user.role); }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#8E8E93', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRoleChange} disabled={saving} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#C9A96E', color: '#1a0f00', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <div style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 24, maxWidth: 360, width: '90%' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7', marginBottom: 8 }}>Change Plan</div>
            <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 16 }}>Change plan from <strong style={{ color: '#F5F5F7', textTransform: 'capitalize' }}>{user.plan}</strong> to <strong style={{ color: '#F5F5F7', textTransform: 'capitalize' }}>{selectedPlan}</strong>?</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setConfirmPlan(false); setSelectedPlan(user.plan); }} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#8E8E93', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handlePlanChange} disabled={saving} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#C9A96E', color: '#1a0f00', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, padding: '10px 16px', borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171', fontSize: 12, zIndex: 100 }}>
          {error}
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, count, children }: { icon: any; title: string; count?: number; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon style={{ width: 14, height: 14, color: '#C9A96E' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{title}</span>
        {count !== undefined && (
          <span style={{ fontSize: 10, color: '#8E8E93', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '1px 6px' }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyMsg() {
  return <div style={{ fontSize: 11, color: '#636366', padding: '12px 0', textAlign: 'center' }}>None yet</div>;
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'completed' ? '#34D399' : status === 'failed' ? '#F87171' : status === 'generating' ? '#F59E0B' : '#8E8E93';
  return (
    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 500, background: `${color}1A`, color, textTransform: 'capitalize' }}>{status}</span>
  );
}
