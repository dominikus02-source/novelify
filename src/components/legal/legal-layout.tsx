'use client'

import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Billing Policy', href: '/billing-policy' },
  { label: 'AI Usage Policy', href: '/ai-usage-policy' },
  { label: 'Manuscript Privacy', href: '/manuscript-privacy' },
  { label: 'Contact', href: '/contact' },
  { label: 'Support', href: '/support' },
]

const GOLD = '#C9A96E'
const BG = '#080808'
const SURFACE = '#121212'
const TEXT = '#F5F5F7'
const MUTED = '#8E8E93'
const DIM = '#636366'
const BORDER = 'rgba(201,169,110,0.15)'

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Geist', system-ui, sans-serif" }}>
      {/* Top nav */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <BookOpen size={20} style={{ color: GOLD }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: TEXT }}>
              Novelify
            </span>
          </Link>
          <Link href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: MUTED, textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = TEXT }}
            onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'flex', gap: 32 }}>
        {/* Side nav */}
        <nav style={{ width: 220, flexShrink: 0, display: 'none', flexDirection: 'column', gap: 2 }}
          className="lg:flex"
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: DIM, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, paddingLeft: 12 }}>
            Legal
          </div>
          {NAV_LINKS.map((link) => {
            const isActive = typeof window !== 'undefined' && window.location.pathname === link.href
            return (
              <Link key={link.href} href={link.href}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? GOLD : MUTED,
                  background: isActive ? 'rgba(201,169,110,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(201,169,110,0.2)' : 'transparent'}`,
                  textDecoration: 'none',
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = TEXT; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = MUTED; e.currentTarget.style.background = 'transparent' } }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile legal links */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}
          className="lg:hidden"
        >
          {NAV_LINKS.map((link) => {
            const isActive = typeof window !== 'undefined' && window.location.pathname === link.href
            return (
              <Link key={link.href} href={link.href}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: isActive ? GOLD : MUTED,
                  background: isActive ? 'rgba(201,169,110,0.08)' : SURFACE,
                  border: `1px solid ${isActive ? 'rgba(201,169,110,0.2)' : BORDER}`,
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, background: SURFACE, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                style={{ fontSize: 12, color: MUTED, textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = TEXT }}
                onMouseLeave={(e) => { e.currentTarget.style.color = MUTED }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <span style={{ fontSize: 11, color: DIM }}>
            &copy; {new Date().getFullYear()} Novelify. All rights reserved.
          </span>
        </div>
      </div>
    </div>
  )
}
