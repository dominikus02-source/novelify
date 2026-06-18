'use client';

import { useState, useEffect, useRef } from 'react';

import { CreditCard, TrendingUp, AlertCircle, RefreshCw, ExternalLink, Clock, FileText } from 'lucide-react';
import type { PlanConfig, PlanLimits } from '@/lib/billing/plans';
import type { UsageSummary } from '@/lib/billing/usage';

const GOLD = '#C9A96E';
const CARD_BG = '#111111';
const LIGHT_TEXT = '#F5F5F7';
const MUTED_TEXT = '#8E8E93';
const DIM_TEXT = '#636366';
const BORDER = 'rgba(255,255,255,0.07)';
const BODY_FONT = "'Geist', system-ui, sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active: { bg: 'rgba(52,211,153,0.1)', color: '#34D399', border: 'rgba(52,211,153,0.18)' },
  past_due: { bg: 'rgba(249,115,22,0.1)', color: '#F97316', border: 'rgba(249,115,22,0.18)' },
  canceled: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.18)' },
  expired: { bg: 'rgba(107,114,128,0.1)', color: '#6B7280', border: 'rgba(107,114,128,0.18)' },
  paused: { bg: 'rgba(234,179,8,0.1)', color: '#EAB308', border: 'rgba(234,179,8,0.18)' },
  trialing: { bg: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: 'rgba(96,165,250,0.18)' },
};

interface PlanResponse {
  plan: string;
  config: PlanConfig;
  features: string[];
}

interface UsageResponse {
  usage: UsageSummary;
  periodStart: string;
  periodEnd: string;
}

interface LimitsResponse {
  plan: string;
  limits: PlanLimits;
}

interface SubscriptionInfo {
  provider: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface BillingEvent {
  type: string;
  createdAt: string;
  status: string | null;
}

interface BillingStatusResponse {
  plan: string;
  subscriptionStatus: string;
  provider: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  latestBillingEvent: BillingEvent | null;
}

interface MetricDef {
  label: string;
  usageKey: keyof UsageSummary;
  limitKey: keyof PlanLimits;
}

const METRICS: MetricDef[] = [
  { label: 'AI Credits', usageKey: 'aiCreditsUsed', limitKey: 'aiCreditsMonthly' },
  { label: 'Projects Created', usageKey: 'projectsCreated', limitKey: 'maxProjects' },
  { label: 'Exports', usageKey: 'exportsUsed', limitKey: 'exportsMonthly' },
  { label: 'Revision Checks', usageKey: 'revisionChecksUsed', limitKey: 'revisionChecksMonthly' },
  { label: 'Translation Words', usageKey: 'translationWordsUsed', limitKey: 'translationWordsMonthly' },
  { label: 'Marketing Assets', usageKey: 'marketingAssetsUsed', limitKey: 'marketingAssetsMonthly' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatStatusLabel(status: string | null): string {
  if (!status) return 'Active';
  const map: Record<string, string> = {
    active: 'Active',
    past_due: 'Past Due',
    canceled: 'Canceled',
    expired: 'Expired',
    paused: 'Paused',
    trialing: 'Trialing',
    free: 'Free',
  };
  return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function getProgressColor(pct: number): string {
  if (pct > 90) return '#EF4444';
  if (pct >= 70) return '#EAB308';
  return '#22C55E';
}

function SkeletonBlock({ width, height = 16 }: { width: number | string; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 8,
        background: 'rgba(255,255,255,0.04)',
        animation: 'billingPulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function formatEventType(type: string): string {
  const map: Record<string, string> = {
    subscription_created: 'Subscription Created',
    subscription_updated: 'Subscription Updated',
    subscription_cancelled: 'Subscription Canceled',
    subscription_resumed: 'Subscription Resumed',
    subscription_expired: 'Subscription Expired',
    subscription_paused: 'Subscription Paused',
    subscription_unpaused: 'Subscription Unpaused',
    subscription_payment_success: 'Payment Successful',
    subscription_payment_failed: 'Payment Failed',
    subscription_payment_recovered: 'Payment Recovered',
    order_created: 'Order Created',
    checkout_created: 'Checkout Created',
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatEventStatus(status: string | null): string {
  if (!status) return '';
  const map: Record<string, string> = {
    active: 'Success',
    past_due: 'Failed',
    canceled: 'Canceled',
    expired: 'Expired',
    pending: 'Pending',
    free: 'Free',
  };
  return map[status] || status;
}

function eventStatusColor(status: string | null): string {
  if (!status) return DIM_TEXT;
  const map: Record<string, string> = {
    active: '#34D399',
    success: '#34D399',
    past_due: '#F97316',
    failed: '#EF4444',
    canceled: '#6B7280',
    expired: '#6B7280',
    pending: '#EAB308',
  };
  return map[status] || DIM_TEXT;
}

function BillingSettings() {
  const [billingSuccess, setBillingSuccess] = useState(false);

  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);
  const [limitsData, setLimitsData] = useState<LimitsResponse | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [latestEvent, setLatestEvent] = useState<BillingEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingNotEnabled, setBillingNotEnabled] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [showManageMsg, setShowManageMsg] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setBillingNotEnabled(false);

    try {
      const [planRes, usageRes, limitsRes, statusRes] = await Promise.all([
        fetch('/api/billing/plan'),
        fetch('/api/billing/usage'),
        fetch('/api/billing/limits'),
        fetch('/api/billing/status'),
      ]);

      const allOk = planRes.ok && usageRes.ok && limitsRes.ok;

      if (!allOk) {
        const errors = await Promise.all([
          planRes.ok ? null : planRes.json().catch(() => ({ error: '' })),
          usageRes.ok ? null : usageRes.json().catch(() => ({ error: '' })),
          limitsRes.ok ? null : limitsRes.json().catch(() => ({ error: '' })),
        ]);

        const hasBillingError = errors.some(
          (e) =>
            e &&
            typeof e.error === 'string' &&
            (/billing/i.test(e.error) ||
              /payment/i.test(e.error) ||
              /stripe/i.test(e.error) ||
              /midtrans/i.test(e.error) ||
              /not configured/i.test(e.error) ||
              /not enabled/i.test(e.error)),
        );

        if (hasBillingError) {
          setBillingNotEnabled(true);
          setLoading(false);
          return;
        }

        throw new Error('Failed to load billing data. Please try again.');
      }

      const [planJson, usageJson, limitsJson] = await Promise.all([
        planRes.json() as Promise<PlanResponse>,
        usageRes.json() as Promise<UsageResponse>,
        limitsRes.json() as Promise<LimitsResponse>,
      ]);

      setPlanData(planJson);
      setUsageData(usageJson);
      setLimitsData(limitsJson);

      if (statusRes.ok) {
        const statusJson = (await statusRes.json()) as BillingStatusResponse;
        setSubscription({
          provider: statusJson.provider,
          status: statusJson.subscriptionStatus,
          currentPeriodEnd: statusJson.currentPeriodEnd,
          cancelAtPeriodEnd: statusJson.cancelAtPeriodEnd,
        });
        setLatestEvent(statusJson.latestBillingEvent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const pollSubscription = async () => {
    setConfirming(true);
    setConfirmMsg("We're confirming your subscription...");

    const poll = async () => {
      try {
        const res = await fetch('/api/billing/status');
        if (res.ok) {
          const data = (await res.json()) as BillingStatusResponse;
          if (data.subscriptionStatus === 'active') {
            setConfirmMsg('Subscription confirmed!');
            setSubscription({
              provider: data.provider,
              status: data.subscriptionStatus,
              currentPeriodEnd: data.currentPeriodEnd,
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            });
            setLatestEvent(data.latestBillingEvent);
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setTimeout(() => {
              setConfirming(false);
              setConfirmMsg(null);
              fetchData();
            }, 1500);
          }
        }
      } catch {
        // continue polling
      }
    };

    await poll();

    pollingRef.current = setInterval(poll, 5000);

    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setConfirmMsg(
        'Confirmation is taking longer than expected. Your subscription will be active shortly.',
      );
      setTimeout(() => {
        setConfirming(false);
        setConfirmMsg(null);
        fetchData();
      }, 4000);
    }, 30000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      setBillingSuccess(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (billingSuccess && planData?.plan === 'free') {
      pollSubscription();
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [billingSuccess, planData?.plan]);

  const isLemonSqueezy = subscription?.provider === 'lemonsqueezy';
  const isMidtrans = subscription?.provider === 'midtrans';

  const isUnlimited = (v: number | 'unlimited'): v is 'unlimited' => v === 'unlimited';

  const displayLimit = (v: number | 'unlimited'): string =>
    isUnlimited(v) ? 'Unlimited' : String(v);

  const computePct = (used: number, limit: number | 'unlimited'): number | null => {
    if (isUnlimited(limit) || limit === 0) return null;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: BODY_FONT,
    color: LIGHT_TEXT,
    maxWidth: 720,
    margin: '0 auto',
  };

  const cardStyle: React.CSSProperties = {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    overflow: 'hidden',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: HEADING_FONT,
    fontSize: 18,
    fontWeight: 600,
    color: LIGHT_TEXT,
    letterSpacing: '-0.01em',
  };

  // ─── Confirming Subscription Overlay ───
  if (confirming) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            ...cardStyle,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(201,169,110,0.1)',
              border: '1px solid rgba(201,169,110,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: GOLD,
            }}
          >
            <Clock style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: HEADING_FONT, color: LIGHT_TEXT, marginBottom: 6 }}>
              {confirmMsg}
            </div>
            {confirmMsg === "We're confirming your subscription..." && (
              <div style={{ fontSize: 13, color: MUTED_TEXT, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
                Please wait while we verify your payment with Lemon Squeezy.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading State ───
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={cardStyle}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonBlock width={160} height={22} />
              <SkeletonBlock width={240} height={14} />
              <SkeletonBlock width={100} height={36} />
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SkeletonBlock width={140} height={20} />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <SkeletonBlock width={120} height={14} />
                    <SkeletonBlock width={80} height={14} />
                  </div>
                  <SkeletonBlock width="100%" height={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            ...cardStyle,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
            }}
          >
            <AlertCircle style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: LIGHT_TEXT, marginBottom: 4 }}>
              Failed to load billing data
            </div>
            <div style={{ fontSize: 12, color: MUTED_TEXT, lineHeight: 1.5 }}>{error}</div>
          </div>
          <button
            onClick={fetchData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: GOLD,
              color: '#1a0f00',
              fontSize: 12,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#E8C98A')}
            onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Billing Not Enabled ───
  if (billingNotEnabled) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            ...cardStyle,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(201,169,110,0.1)',
              border: '1px solid rgba(201,169,110,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: GOLD,
            }}
          >
            <CreditCard style={{ width: 24, height: 24 }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: HEADING_FONT, color: LIGHT_TEXT, marginBottom: 6 }}>
              Billing & Payments
            </div>
            <div style={{ fontSize: 13, color: MUTED_TEXT, lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>
              Payment processing is not configured. Contact support to enable billing for your account.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Normal State ───
  if (!planData || !usageData || !limitsData) return null;

  const config = planData.config;
  const usage = usageData.usage;
  const limits = limitsData.limits;
  const subStatus = subscription?.status || 'active';
  const statusStyle = STATUS_STYLES[subStatus] || STATUS_STYLES.active;

  return (
    <>
      <style>{`
        @keyframes billingPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      <div style={containerStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ─── Current Plan Card ─── */}
          <div style={cardStyle}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(201,169,110,0.1)',
                    border: '1px solid rgba(201,169,110,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: GOLD,
                    flexShrink: 0,
                  }}
                >
                  <CreditCard style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: LIGHT_TEXT }}>
                      {config.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: 'rgba(201,169,110,0.12)',
                        color: GOLD,
                        border: '1px solid rgba(201,169,110,0.2)',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {config.badge}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 8,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {formatStatusLabel(subStatus)}
                    </span>
                    {isLemonSqueezy && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.06)',
                          color: MUTED_TEXT,
                          border: `1px solid ${BORDER}`,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Lemon Squeezy
                      </span>
                    )}
                    {isMidtrans && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.06)',
                          color: MUTED_TEXT,
                          border: `1px solid ${BORDER}`,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Midtrans
                      </span>
                    )}
                  </div>
                  {usageData.periodStart && usageData.periodEnd && (
                    <div style={{ fontSize: 11, color: MUTED_TEXT, marginTop: 4 }}>
                      Current billing period: {formatDate(usageData.periodStart)} — {formatDate(usageData.periodEnd)}
                    </div>
                  )}
                  {subscription?.currentPeriodEnd && subscription?.status !== 'free' && (
                    <div style={{ fontSize: 11, color: MUTED_TEXT, marginTop: 2 }}>
                      Current period ends: {formatDate(subscription.currentPeriodEnd)}
                    </div>
                  )}
                  {subscription?.cancelAtPeriodEnd && (
                    <div style={{ fontSize: 11, color: '#F97316', marginTop: 2 }}>
                      Your subscription will cancel at the end of the billing period.
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href="/pricing"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: GOLD,
                    color: '#1a0f00',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '9px 20px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E8C98A')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
                >
                  <TrendingUp style={{ width: 14, height: 14 }} />
                  {planData.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </a>
                {isLemonSqueezy && (
                  <button
                    onClick={() => setShowManageMsg(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'transparent',
                      color: LIGHT_TEXT,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '9px 20px',
                      borderRadius: 20,
                      border: `1px solid ${BORDER}`,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    Manage Subscription
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Manage Subscription Message ─── */}
          {showManageMsg && (
            <div
              style={{
                ...cardStyle,
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <AlertCircle style={{ width: 16, height: 16, color: GOLD, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: MUTED_TEXT, lineHeight: 1.5, flex: 1 }}>
                <a href="mailto:support@novelify.app" style={{ color: GOLD, textDecoration: 'underline' }}>Contact support</a> to manage your subscription.
              </div>
              <button
                onClick={() => setShowManageMsg(false)}
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  color: DIM_TEXT,
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                &times;
              </button>
            </div>
          )}

          {/* ─── Usage Meters ─── */}
          <div style={cardStyle}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <TrendingUp style={{ width: 18, height: 18, color: GOLD }} />
                <h2 style={sectionTitleStyle}>Usage Meters</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {METRICS.map((metric) => {
                  const used = Number(usage[metric.usageKey]) || 0;
                  const limit = limits[metric.limitKey] as number | 'unlimited';
                  const pct = computePct(used, limit);
                  const barColor = pct !== null ? getProgressColor(pct) : GOLD;

                  return (
                    <div key={metric.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: LIGHT_TEXT }}>
                          {metric.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, color: DIM_TEXT }}>
                            <span style={{ color: LIGHT_TEXT, fontWeight: 500 }}>{used}</span>
                            <span style={{ color: DIM_TEXT }}> / {displayLimit(limit)}</span>
                          </span>
                          {!isUnlimited(limit) && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: barColor,
                                padding: '1px 6px',
                                borderRadius: 6,
                                background: `${barColor}14`,
                                border: `1px solid ${barColor}28`,
                              }}
                            >
                              {Math.max(0, (limit as number) - used)} remaining
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
                            transition: 'width 0.6s ease',
                            width: pct !== null ? `${pct}%` : '100%',
                            opacity: pct !== null ? 1 : 0.3,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ─── Payment History ─── */}
          <div style={cardStyle}>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <FileText style={{ width: 18, height: 18, color: GOLD }} />
                <h2 style={sectionTitleStyle}>Payment History</h2>
              </div>

              {latestEvent ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: LIGHT_TEXT }}>
                      {formatEventType(latestEvent.type)}
                    </span>
                    <span style={{ fontSize: 11, color: DIM_TEXT }}>
                      {formatDate(latestEvent.createdAt)}
                    </span>
                  </div>
                  <div>
                    {latestEvent.status && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 8,
                          background: `${eventStatusColor(latestEvent.status)}14`,
                          color: eventStatusColor(latestEvent.status),
                          border: `1px solid ${eventStatusColor(latestEvent.status)}28`,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {formatEventStatus(latestEvent.status)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: DIM_TEXT, textAlign: 'center', padding: '12px 0' }}>
                  No payment history available yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default BillingSettings;
