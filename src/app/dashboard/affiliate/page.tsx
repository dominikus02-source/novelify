'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Copy, Share2, Users, MousePointerClick, DollarSign, TrendingUp,
  Link, ExternalLink, Check, Loader2, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

const GOLD = '#C9A96E';
const GOLD_LIGHT = '#E8C98A';
const BG = '#080808';
const SURFACE = '#0a0a0a';
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

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${GOLD}1A`, border: `1px solid ${GOLD}33`, color: GOLD }}>
        <Icon style={{ width: 16, height: 16 }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: GOLD, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function CommissionCard({ label, amount, count, color }: { label: string; amount: number; count: number; color: string }) {
  return (
    <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color, letterSpacing: '-0.02em' }}>${amount.toFixed(2)}</div>
      <div style={{ fontSize: 12, color: DIM, marginTop: 4 }}>{count} commission{count !== 1 ? 's' : ''}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    pending: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#F59E0B' },
    approved: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', text: '#34D399' },
    payable: { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', text: '#60A5FA' },
    paid: { bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', text: '#A78BFA' },
    rejected: { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', text: '#F87171' },
  };
  const s = colors[status.toLowerCase()] || { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', text: MUTED };
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AffiliateDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payoutExpanded, setPayoutExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ payoutMethod: '', payoutEmail: '', payoutName: '', payoutNotes: '' });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, referralsRes, commissionsRes] = await Promise.all([
        fetch('/api/affiliate/me'),
        fetch('/api/affiliate/stats'),
        fetch('/api/affiliate/referrals'),
        fetch('/api/affiliate/commissions'),
      ]);
      if (profileRes.ok) {
        const p = await profileRes.json();
        setProfile(p);
        if (p.payoutMethod) setPayoutForm({ payoutMethod: p.payoutMethod || '', payoutEmail: p.payoutEmail || '', payoutName: p.payoutName || '', payoutNotes: p.payoutNotes || '' });
      } else if (profileRes.status === 404) {
        setProfile(null);
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (referralsRes.ok) setReferrals(await referralsRes.json());
      if (commissionsRes.ok) setCommissions(await commissionsRes.json());
    } catch {
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch('/api/affiliate/join', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to join');
      }
      toast.success('Welcome to the affiliate program!');
      await fetchAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleCopy = async () => {
    if (!profile?.referralCode) return;
    const link = `https://novelify.online/?ref=${profile.referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleSavePayout = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/affiliate/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutForm),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Payout settings saved');
    } catch {
      toast.error('Failed to save payout settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'affSpin 0.8s linear infinite' }} />
        <style>{`@keyframes affSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Join the Affiliate Program
          </h1>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            Earn 30% recurring commission for 12 months when writers you refer become paid Novelify subscribers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { step: '1', title: 'Join', desc: 'Sign up for the affiliate program in one click' },
            { step: '2', title: 'Share', desc: 'Get your unique referral link and share it' },
            { step: '3', title: 'Subscribe', desc: 'Writers sign up and choose a paid plan' },
            { step: '4', title: 'Earn', desc: 'Receive 30% commission monthly for 12 months' },
          ].map((s) => (
            <div key={s.step} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${GOLD}1A`, color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, margin: '0 auto 12px' }}>{s.step}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: GOLD, marginBottom: 16 }}>Key Terms</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div><div style={{ fontSize: 12, color: DIM, marginBottom: 2 }}>Commission</div><div style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>30% recurring</div></div>
            <div><div style={{ fontSize: 12, color: DIM, marginBottom: 2 }}>Duration</div><div style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>12 months</div></div>
            <div><div style={{ fontSize: 12, color: DIM, marginBottom: 2 }}>Cookie Window</div><div style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>60 days</div></div>
            <div><div style={{ fontSize: 12, color: DIM, marginBottom: 2 }}>Minimum Payout</div><div style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>$50</div></div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleJoin}
            disabled={joining}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000',
              fontSize: 15, fontWeight: 600, padding: '14px 32px', borderRadius: 50,
              border: 'none', cursor: joining ? 'not-allowed' : 'pointer',
              opacity: joining ? 0.6 : 1,
              transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={(e) => { if (!joining) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,169,110,0.3)'; } }}
            onMouseLeave={(e) => { if (!joining) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
          >
            {joining ? <><Loader2 style={{ width: 16, height: 16, animation: 'affSpin 0.8s linear infinite' }} /> Joining...</> : 'Join Affiliate Program'}
          </button>
        </div>
      </div>
    );
  }

  const referralLink = `https://novelify.online/?ref=${profile.referralCode}`;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>Affiliate Dashboard</h1>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Track your referrals, commissions, and earnings</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard icon={MousePointerClick} label="Total Clicks" value={stats?.totalClicks ?? 0} />
        <StatCard icon={Users} label="Total Signups" value={stats?.totalSignups ?? 0} />
        <StatCard icon={DollarSign} label="Paid Customers" value={stats?.paidCustomers ?? 0} />
        <StatCard icon={TrendingUp} label="Commission Rate" value="30%" />
      </div>

      {/* Referral link */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link style={{ width: 14, height: 14, color: GOLD }} />
          Your Referral Link
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, overflow: 'hidden' }}>
            <span style={{ fontSize: 13, color: GOLD, fontWeight: 500, wordBreak: 'break-all' }}>{referralLink}</span>
          </div>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 8, border: `1px solid ${copied ? '#34D399' : BORDER_BRIGHT}`,
              background: copied ? 'rgba(52,211,153,0.1)' : SURFACE2, color: copied ? '#34D399' : TEXT,
              fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}
          >
            {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => { if (navigator.share) navigator.share({ title: 'Novelify', text: 'Write your novel with AI assistance on Novelify', url: referralLink }); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 8, border: `1px solid ${BORDER_BRIGHT}`,
              background: SURFACE2, color: TEXT, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}
          >
            <Share2 style={{ width: 14, height: 14 }} />
            Share
          </button>
        </div>
      </div>

      {/* Commission summary */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 14, letterSpacing: '-0.01em' }}>Commission Summary</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 32 }}>
        <CommissionCard label="Pending" amount={stats?.pendingAmount ?? 0} count={stats?.pendingCount ?? 0} color="#F59E0B" />
        <CommissionCard label="Approved" amount={stats?.approvedAmount ?? 0} count={stats?.approvedCount ?? 0} color="#34D399" />
        <CommissionCard label="Payable" amount={stats?.payableAmount ?? 0} count={stats?.payableCount ?? 0} color="#60A5FA" />
        <CommissionCard label="Paid" amount={stats?.paidAmount ?? 0} count={stats?.paidCount ?? 0} color="#A78BFA" />
      </div>

      {/* Recent referrals */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 14, letterSpacing: '-0.01em' }}>Recent Referrals</h2>
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
        {referrals.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: MUTED, fontSize: 13 }}>No referrals yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referred User</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.slice(0, 10).map((r: any, i: number) => (
                  <tr key={r.id || i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '12px 18px', color: TEXT }}>{r.referredUser?.email || r.referredEmail || '—'}</td>
                    <td style={{ padding: '12px 18px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '12px 18px', color: MUTED }}>{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent commissions */}
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 14, letterSpacing: '-0.01em' }}>Recent Commissions</h2>
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
        {commissions.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: MUTED, fontSize: 13 }}>No commissions yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 18px', color: DIM, fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.slice(0, 10).map((c: any, i: number) => (
                  <tr key={c.id || i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '12px 18px', color: TEXT }}>{c.plan || c.subscription?.planId || '—'}</td>
                    <td style={{ padding: '12px 18px', color: GOLD, fontWeight: 500 }}>${(c.amount || 0).toFixed(2)}</td>
                    <td style={{ padding: '12px 18px' }}><StatusBadge status={c.status} /></td>
                    <td style={{ padding: '12px 18px', color: MUTED }}>{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Settings */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, marginBottom: 28 }}>
        <button
          onClick={() => setPayoutExpanded(!payoutExpanded)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', color: TEXT, fontSize: 14, fontWeight: 600 }}
        >
          <span>Payout Settings</span>
          {payoutExpanded ? <ChevronUp style={{ width: 16, height: 16, color: MUTED }} /> : <ChevronDown style={{ width: 16, height: 16, color: MUTED }} />}
        </button>
        {payoutExpanded && (
          <div style={{ padding: '0 24px 20px', borderTop: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 11, color: DIM, margin: '14px 0', lineHeight: 1.5 }}>
              Payouts are reviewed and processed manually once per month. Ensure your details are correct.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: DIM, display: 'block', marginBottom: 4 }}>Payout Method</label>
                <select
                  value={payoutForm.payoutMethod}
                  onChange={(e) => setPayoutForm(p => ({ ...p, payoutMethod: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                >
                  <option value="">Select method</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CRYPTO">Cryptocurrency</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: DIM, display: 'block', marginBottom: 4 }}>Payout Email</label>
                <input
                  value={payoutForm.payoutEmail}
                  onChange={(e) => setPayoutForm(p => ({ ...p, payoutEmail: e.target.value }))}
                  placeholder="email@example.com"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: DIM, display: 'block', marginBottom: 4 }}>Full Name</label>
                <input
                  value={payoutForm.payoutName}
                  onChange={(e) => setPayoutForm(p => ({ ...p, payoutName: e.target.value }))}
                  placeholder="Your full name"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: DIM, display: 'block', marginBottom: 4 }}>Notes</label>
                <input
                  value={payoutForm.payoutNotes}
                  onChange={(e) => setPayoutForm(p => ({ ...p, payoutNotes: e.target.value }))}
                  placeholder="Optional notes"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: BG, color: TEXT, fontSize: 12, outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSavePayout}
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 8, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000', fontSize: 12, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
              >
                {saving && <Loader2 style={{ width: 14, height: 14, animation: 'affSpin 0.8s linear infinite' }} />}
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600, color: GOLD, marginBottom: 10 }}>Affiliate Program Terms</h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12, color: MUTED, lineHeight: 1.8 }}>
          <li>• 30% recurring commission on all Starter, Pro, and Studio paid subscriptions</li>
          <li>• Commissions earned for 12 consecutive months per referred customer</li>
          <li>• 60-day cookie window — you earn commission if they subscribe within 60 days of clicking your link</li>
          <li>• $50 minimum payout threshold</li>
          <li>• Payouts are reviewed and processed manually once per month</li>
          <li>• Commissions reversed on refunds or chargebacks</li>
          <li>• Self-referral, spam, and misleading marketing are strictly prohibited</li>
        </ul>
      </div>
    </div>
  );
}
