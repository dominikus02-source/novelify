'use client';

import { motion } from 'framer-motion';
import { ReactNode, MouseEvent } from 'react';

// ─── Color palette ───
export const colors = {
  gold: '#C9A96E',
  amber: '#C8873A',
  paper: '#F5F0EB',
  ink: '#1a1a1a',
  muted: '#8E8E93',
  darkBg: '#080808',
  cardBg: '#111111',
  border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.11)',
  goldBg: 'rgba(201,169,110,0.10)',
  goldBorder: 'rgba(201,169,110,0.20)',
};

export const iconColors: Record<string, string> = {
  gold: '#C9A96E', amber: '#C8873A', purple: '#A78BFA', teal: '#34D399',
  red: '#F87171', blue: '#60A5FA', pink: '#F472B6', emerald: '#34D399',
};

// ─── Helpers ───
export function fmtWords(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function progressPct(current: number, target: number): number {
  return target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
}

// ─── MetricCard ───
export function MetricCard({ icon: Icon, label, value, sub, color = 'gold', loading }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string; loading?: boolean;
}) {
  const c = iconColors[color] || colors.gold;
  return (
    <div style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'border-color .2s' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${c}1A`, border: `1px solid ${c}33`, color: c }}>
        <Icon style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {loading ? '—' : value}
        </div>
        <div style={{ fontSize: 11, color: colors.muted, marginTop: 3 }}>{label}</div>
        {sub && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, marginTop: 6, padding: '2px 7px', borderRadius: 8, background: 'rgba(52,211,153,0.08)', color: '#34D399', border: '1px solid rgba(52,211,153,0.15)' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───
export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        {count !== undefined && (
          <span style={{ background: '#161616', border: `1px solid ${colors.borderLight}`, borderRadius: 8, fontSize: 10, fontWeight: 600, color: colors.muted, padding: '1px 7px' }}>{count}</span>
        )}
      </span>
      {action}
    </div>
  );
}

// ─── Page Header ───
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Glass Button ───
export function GlassButton({ children, onClick, color = colors.gold, small }: {
  children: ReactNode; onClick?: (e: MouseEvent) => void; color?: string; small?: boolean;
}) {
  return (
    <button onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: small ? 4 : 6,
        background: color, color: '#1a0f00', fontSize: small ? 11 : 12,
        fontWeight: 600, padding: small ? '6px 12px' : '8px 16px',
        borderRadius: 20, border: 'none', cursor: 'pointer',
        whiteSpace: 'nowrap', transition: 'background .15s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#E8C98A'}
      onMouseLeave={(e) => e.currentTarget.style.background = color}
    >{children}</button>
  );
}

// ─── Progress Bar ───
export function ProgressBar({ pct, height = 3 }: { pct: number; height?: number }) {
  return (
    <div style={{ height, background: 'rgba(255,255,255,0.06)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: height, background: 'linear-gradient(90deg, #C9A96E, #E8C98A)', transition: 'width .6s ease', width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ─── Status Badge ───
const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  translating: { label: 'Translating', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  ready: { label: 'Ready', cls: 'bg-green-100 text-green-700 border-green-200' },
  exported: { label: 'Exported', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusConfig[status] || { label: status, cls: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
  return (
    <span className={s.cls} style={{
      fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 8,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>{s.label}</span>
  );
}

// ─── Empty State ───
export function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ElementType; title: string; desc: string; action?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: 12 }}>
      <div style={{ width: 52, height: 52, background: colors.goldBg, border: `1px solid ${colors.goldBorder}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gold }}>
        <Icon style={{ width: 24, height: 24 }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>{title}</div>
      <div style={{ fontSize: 12, color: colors.muted, maxWidth: 320, lineHeight: 1.6 }}>{desc}</div>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// ─── Card Wrapper ───
export function Card({ children, onClick, hover, style: extStyle }: {
  children: ReactNode; onClick?: () => void; hover?: boolean; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    background: colors.cardBg, border: `1px solid ${colors.border}`,
    borderRadius: 16, overflow: 'hidden', transition: 'border-color .2s, transform .2s, box-shadow .2s',
    ...(hover ? { cursor: 'pointer' } : {}),
    ...extStyle,
  };
  return (
    <div style={base}
      onClick={onClick}
      onMouseEnter={hover ? (e) => { e.currentTarget.style.borderColor = colors.borderLight; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; } : undefined}
      onMouseLeave={hover ? (e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } : undefined}
    >{children}</div>
  );
}

// ─── Animate In ───
export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      {children}
    </motion.div>
  );
}

// ─── Quick Action Button ───
export function QuickActionBtn({ icon: Icon, label, sub, color = 'gold', onClick }: {
  icon: React.ElementType; label: string; sub: string; color?: string; onClick?: () => void;
}) {
  const c = iconColors[color] || colors.gold;
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px',
        borderRadius: 12, background: '#161616', border: `1px solid ${colors.border}`,
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'background .15s, border-color .15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#1c1c1e'; e.currentTarget.style.borderColor = colors.borderLight; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#161616'; e.currentTarget.style.borderColor = colors.border; }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${c}1A`, border: `1px solid ${c}33`, color: c }}>
        <Icon style={{ width: 15, height: 15 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#F5F5F7' }}>{label}</div>
        <div style={{ fontSize: 10, color: colors.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
    </button>
  );
}

// ─── Feature Placeholder ───
export function FeaturePlaceholder({ title, description, features, cta }: {
  title: string; description: string; features: string[]; cta: string;
}) {
  return (
    <div className="min-h-screen" style={{ background: colors.darkBg }}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F5F5F7', fontFamily: "'Playfair Display',serif", marginBottom: 12 }}>{title}</h1>
          <p style={{ fontSize: 14, color: colors.muted, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>{description}</p>
        </div>
        <div style={{ display: 'grid', gap: 12, maxWidth: 480, margin: '0 auto 32px' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', borderRadius: 14,
              background: colors.cardBg, border: `1px solid ${colors.border}`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.gold, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#aeaeb2' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: colors.muted, fontStyle: 'italic' }}>{cta}</span>
        </div>
      </div>
    </div>
  );
}
