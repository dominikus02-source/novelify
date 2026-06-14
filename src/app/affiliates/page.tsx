'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Check, ChevronDown, ChevronUp, Users, Share2, DollarSign, TrendingUp, Globe, BookOpen, Youtube, Mail, MessageSquare, GraduationCap } from 'lucide-react';

const GOLD = '#C9A96E';
const GOLD_LIGHT = '#E8C98A';
const DIM = '#636366';

const faqItems = [
  {
    q: 'How do I earn commissions?',
    a: 'You earn 30% recurring commission for 12 months when someone you refer signs up for a paid Novelify plan (Starter, Pro, or Studio). Commissions are tracked via your unique referral link with a 60-day cookie window.',
  },
  {
    q: 'When do I get paid?',
    a: 'Payouts are reviewed and processed manually once per month once you reach the $50 minimum threshold. You can track your earnings in real-time from your affiliate dashboard.',
  },
  {
    q: 'What plans are eligible?',
    a: 'All paid plans — Starter, Pro, and Studio — are eligible for commissions. Free plan signups do not earn commissions, but if a referred user later upgrades to a paid plan within the cookie window, you earn commission.',
  },
  {
    q: 'How long does the cookie last?',
    a: 'Our referral cookies last 60 days. If someone clicks your link and subscribes to a paid plan within 60 days, you earn the commission. If they clear their cookies or use a different device, attribution may be lost.',
  },
  {
    q: 'Can I refer myself?',
    a: 'No. Self-referral is strictly prohibited and will result in immediate termination from the affiliate program and forfeiture of all commissions.',
  },
  {
    q: 'What happens if a customer refunds?',
    a: 'If a referred customer requests a refund or their payment is charged back, the corresponding commission will be reversed and deducted from your pending or future earnings.',
  },
  {
    q: 'Is there a limit to how much I can earn?',
    a: 'There is no cap on earnings. The more paying writers you refer, the more you earn, with commissions recurring monthly for 12 months per referred customer.',
  },
];

const whoItems = [
  { icon: BookOpen, title: 'Writing Coaches', desc: 'Recommend Novelify to your clients to streamline their writing process.' },
  { icon: MessageSquare, title: 'Bloggers', desc: 'Share your experience writing with Novelify and earn from your audience.' },
  { icon: Youtube, title: 'YouTubers', desc: 'Review Novelify in your videos and earn commissions from your viewers.' },
  { icon: Mail, title: 'Newsletter Writers', desc: 'Include your affiliate link in your newsletter and monetize your subscribers.' },
  { icon: Users, title: 'Writing Communities', desc: 'Share Novelify in writing groups, forums, and community platforms.' },
  { icon: GraduationCap, title: 'Educators', desc: 'Introduce Novelify to your students as a modern writing tool.' },
];

export default function AffiliatesLandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCta = () => {
    if (session) {
      router.push('/dashboard/affiliate');
    } else {
      router.push('/register?returnUrl=/dashboard/affiliate');
    }
  };

  return (
    <div style={{ background: 'var(--lp-black)', color: 'var(--lp-white)', fontFamily: "'Geist', system-ui, sans-serif", minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--lp-border)', background: 'var(--lp-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <BookOpen size={20} color={GOLD} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: 'var(--lp-white)' }}>Novelify</span>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/pricing" style={{ fontSize: 13, color: 'var(--lp-muted)', textDecoration: 'none' }}>Pricing</Link>
            {session ? (
              <Link href="/dashboard/affiliate" style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, background: GOLD, color: '#000', fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
            ) : (
              <Link href="/login" style={{ fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--lp-border-bright)', color: 'var(--lp-white)', textDecoration: 'none' }}>Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--lp-glass)', border: '1px solid var(--lp-border-bright)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, color: 'var(--lp-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24 }}>
            <TrendingUp size={14} color={GOLD} />
            Affiliate Program
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--lp-white)', marginBottom: 20 }}>
            Earn by helping writers discover <span style={{ color: GOLD }}>Novelify</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--lp-muted)', maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Share Novelify with writers and earn <strong style={{ color: 'var(--lp-white)' }}>30% recurring commission</strong> for 12 months on every paid subscription you refer.
          </p>
          <button
            onClick={handleCta}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000',
              fontSize: 15, fontWeight: 600, padding: '14px 32px', borderRadius: 50,
              border: 'none', cursor: 'pointer',
              transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,169,110,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Join the Affiliate Program
          </button>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: 'var(--lp-surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 48 }}>
            How It <span style={{ color: GOLD }}>Works</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: Users, step: '01', title: 'Join the program', desc: 'Sign up in one click and get your unique referral link.' },
              { icon: Share2, step: '02', title: 'Share your link', desc: 'Share your referral link on social media, blogs, or with your network.' },
              { icon: DollarSign, step: '03', title: 'Writers subscribe', desc: 'When writers click your link and buy a paid plan, you earn commission.' },
              { icon: TrendingUp, step: '04', title: 'Earn monthly', desc: 'Receive 30% commission every month for 12 months per referred customer.' },
            ].map((item) => (
              <div key={item.step} style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 16, padding: '28px 24px', textAlign: 'center', transition: 'border-color .25s, transform .25s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${GOLD}1A`, border: `1px solid ${GOLD}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: GOLD }}>
                  <item.icon size={22} />
                </div>
                <div style={{ fontSize: 11, color: DIM, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>{item.step}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--lp-white)', marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'var(--lp-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission details */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 16, padding: '40px 32px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 600, textAlign: 'center', letterSpacing: '-0.01em', marginBottom: 32 }}>
              Commission <span style={{ color: GOLD }}>Structure</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
              {[
                { icon: DollarSign, label: 'Commission Rate', value: '30% recurring' },
                { icon: TrendingUp, label: 'Duration', value: '12 months' },
                { icon: Globe, label: 'Cookie Window', value: '60 days' },
                { icon: Users, label: 'Minimum Payout', value: '$50' },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${GOLD}1A`, border: `1px solid ${GOLD}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: GOLD }}>
                    <item.icon size={18} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--lp-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--lp-white)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--lp-glass)', borderRadius: 10, border: '1px solid var(--lp-border)' }}>
              <div style={{ fontSize: 13, color: 'var(--lp-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--lp-white)' }}>Eligible plans:</strong> Starter, Pro, and Studio paid subscriptions. Free plan signups are not eligible.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who should join */}
      <section style={{ padding: '80px 24px', background: 'var(--lp-surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Who Should <span style={{ color: GOLD }}>Join</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--lp-muted)', textAlign: 'center', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.6 }}>
            If you have an audience of writers or aspiring authors, this program is for you.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {whoItems.map((item) => (
              <div key={item.title} style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 14, padding: '24px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .25s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border)'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GOLD}1A`, border: `1px solid ${GOLD}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: GOLD }}>
                  <item.icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--lp-white)', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--lp-muted)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 32 }}>
            Program <span style={{ color: GOLD }}>Rules</span>
          </h2>
          <div style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 16, padding: '32px' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'No self-referral — you cannot earn commissions on your own purchases or accounts.',
                'No spam — do not send unsolicited promotional messages or post affiliate links in irrelevant places.',
                'No misleading claims — do not make false or exaggerated claims about Novelify features or pricing.',
                'No paid ads without approval — running paid search or social ads targeting Novelify brand terms requires prior written approval.',
                'No multi-level marketing — this is a straightforward referral program, not an MLM. Commissions are earned on direct referrals only.',
                'Violation of these rules may result in immediate termination and forfeiture of all commissions.',
              ].map((rule, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--lp-muted)', lineHeight: 1.5 }}>
                  <Check size={14} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', background: 'var(--lp-surface)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 40 }}>
            Frequently Asked <span style={{ color: GOLD }}>Questions</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ background: 'var(--lp-surface2)', border: '1px solid var(--lp-border)', borderRadius: 12, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lp-white)', fontSize: 14, fontWeight: 500, textAlign: 'left' }}
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={16} color={DIM} /> : <ChevronDown size={16} color={DIM} />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--lp-border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--lp-muted)', lineHeight: 1.6, margin: '12px 0 0' }}>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to start <span style={{ color: GOLD }}>earning</span>?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--lp-muted)', lineHeight: 1.6, marginBottom: 32 }}>
            Join the Novelify affiliate program today and earn 30% recurring commission for 12 months on every paid subscription you refer.
          </p>
          <button
            onClick={handleCta}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: '#000',
              fontSize: 15, fontWeight: 600, padding: '14px 32px', borderRadius: 50,
              border: 'none', cursor: 'pointer',
              transition: 'transform .2s, box-shadow .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(201,169,110,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Join the Affiliate Program
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--lp-border)', padding: '24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ fontSize: 12, color: 'var(--lp-muted)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: 'var(--lp-muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/affiliate-terms" style={{ fontSize: 12, color: 'var(--lp-muted)', textDecoration: 'none' }}>Affiliate Terms</Link>
          <Link href="/contact" style={{ fontSize: 12, color: 'var(--lp-muted)', textDecoration: 'none' }}>Contact</Link>
        </div>
        <div style={{ fontSize: 11, color: 'var(--lp-muted)', marginTop: 12 }}>&copy; {new Date().getFullYear()} Novelify. All rights reserved.</div>
      </footer>
    </div>
  );
}
