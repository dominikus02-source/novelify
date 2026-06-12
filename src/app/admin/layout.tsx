'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard, Users, FolderOpen, MessageSquare, CreditCard,
  Repeat, BarChart3, Download, Brain, Settings, Shield, ArrowLeft, Menu, X,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: Repeat },
  { href: '/admin/usage', label: 'Usage', icon: BarChart3 },
  { href: '/admin/exports', label: 'Exports', icon: Download },
  { href: '/admin/ai-logs', label: 'AI Logs', icon: Brain },
  { href: '/admin/system', label: 'System', icon: Settings },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    handler();
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #C9A96E', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, animation: 'fadeIn 0.15s ease' }}
        />
      )}

      <aside style={{
        width: isMobile ? (sidebarOpen ? 260 : 0) : 220,
        height: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: 70,
        background: '#0d0d0d',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#1a0f00',
              flexShrink: 0,
            }}>A</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>Admin Console</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '8px 10px', marginBottom: 2,
                  borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  textAlign: 'left', background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
                  color: active ? '#E8C98A' : '#8E8E93',
                  transition: 'background 0.1s, color 0.1s',
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F7'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8E8E93'; } }}
              >
                <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '8px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'left',
              background: 'transparent', color: '#636366',
              transition: 'background 0.1s, color 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8E8E93'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#636366'; }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <div style={{
            height: 52, background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#F5F5F7', cursor: 'pointer', padding: 4 }}>
              <Menu style={{ width: 18, height: 18 }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>Admin Console</span>
          </div>
        )}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px 28px', maxWidth: 1200, width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
