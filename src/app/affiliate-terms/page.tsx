'use client';

import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

const GOLD = '#C9A96E';
const BG = '#080808';
const SURFACE = '#121212';
const TEXT = '#F5F5F7';
const MUTED = '#8E8E93';
const DIM = '#636366';
const BORDER = 'rgba(201,169,110,0.15)';

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} style={{ marginBottom: 32 }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '24px 28px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: GOLD, margin: '0 0 16px', letterSpacing: '-0.01em' }}>{title}</h2>
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{children}</div>
      </div>
    </section>
  );
}

export default function AffiliateTermsPage() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Geist', system-ui, sans-serif" }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <BookOpen size={20} color={GOLD} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: TEXT }}>Novelify</span>
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: MUTED, textDecoration: 'none' }}>
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: GOLD, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Affiliate Program Terms
          </h1>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '0 0 16px', maxWidth: 640 }}>
            These terms govern your participation in the Novelify Affiliate Program. By joining the program, you agree to be bound by these terms.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
            <span style={{ color: MUTED }}>Last updated: <span style={{ color: TEXT, fontWeight: 500 }}>June 1, 2025</span></span>
            <span style={{ color: MUTED }}>Questions? Email <a href="mailto:support@novelify.online" style={{ color: GOLD, textDecoration: 'none' }}>support@novelify.online</a></span>
          </div>
        </div>

        <Section title="1. Commission Rate and Structure">
          <p style={{ margin: '0 0 12px' }}>
            Affiliates earn a <strong style={{ color: TEXT }}>30% recurring commission</strong> on all eligible paid subscription payments made by referred customers. Commission is calculated on the net amount paid (excluding taxes, fees, and discounts).
          </p>
          <p style={{ margin: 0 }}>
            Commissions are earned for <strong style={{ color: TEXT }}>12 consecutive months</strong> per referred customer, starting from the date of their first paid subscription payment. After 12 months, commissions for that customer cease, even if the customer remains subscribed.
          </p>
        </Section>

        <Section title="2. Eligible Transactions">
          <p style={{ margin: '0 0 12px' }}>
            Commissions are earned on paid subscriptions for the following plans:
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
            <li>Starter (monthly and annual)</li>
            <li>Pro (monthly and annual)</li>
            <li>Studio (monthly and annual)</li>
          </ul>
          <p style={{ margin: 0 }}>
            Free plan signups, one-time payments, add-on purchases, and upgrade/downgrade prorations are not eligible for commissions. If a referred customer changes plans, commission is calculated based on the new plan&apos;s price.
          </p>
        </Section>

        <Section title="3. Cookie Duration">
          <p style={{ margin: '0 0 12px' }}>
            Referral tracking uses a <strong style={{ color: TEXT }}>60-day cookie</strong>. When a potential customer clicks your unique referral link, a cookie is placed in their browser for 60 days. If they sign up for a paid plan within this period, the referral is attributed to you.
          </p>
          <p style={{ margin: 0 }}>
            If the cookie is cleared, a different device or browser is used, or the customer uses an ad blocker that prevents tracking, attribution may be lost. Novelify is not responsible for tracking failures caused by the customer&apos;s browser or device settings.
          </p>
        </Section>

        <Section title="4. Payout Terms">
          <p style={{ margin: '0 0 12px' }}>
            <strong style={{ color: TEXT }}>Minimum payout:</strong> $50. Commissions must accumulate to at least $50 before a payout can be issued.
          </p>
          <p style={{ margin: '0 0 12px' }}>
            <strong style={{ color: TEXT }}>Payout schedule:</strong> Payouts are reviewed and processed manually once per month. There is no set date — payouts are processed as soon as possible after review.
          </p>
          <p style={{ margin: '0 0 12px' }}>
            <strong style={{ color: TEXT }}>Payout methods:</strong> Available payout methods include PayPal, bank transfer, and cryptocurrency. Affiliates must provide accurate payout information in their affiliate dashboard.
          </p>
          <p style={{ margin: 0 }}>
            Novelify reserves the right to delay or withhold payouts pending investigation of suspected violations of these terms.
          </p>
        </Section>

        <Section title="5. Refunds and Chargebacks">
          <p style={{ margin: 0 }}>
            If a referred customer requests a refund, cancels within a refund period, or initiates a chargeback, the corresponding commission will be <strong style={{ color: TEXT }}>reversed</strong> and deducted from your pending or future earnings. If the commission has already been paid out, the amount will be deducted from future commissions or may be invoiced to you.
          </p>
        </Section>

        <Section title="6. Prohibited Activities">
          <p style={{ margin: '0 0 12px' }}>
            The following activities are strictly prohibited. Violation may result in immediate termination from the program and forfeiture of all commissions:
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
            <li><strong style={{ color: TEXT }}>Self-referral:</strong> Using your own referral link to purchase subscriptions for yourself or accounts you control.</li>
            <li><strong style={{ color: TEXT }}>Spam:</strong> Sending unsolicited bulk emails, messages, or posts containing your affiliate link.</li>
            <li><strong style={{ color: TEXT }}>Misleading marketing:</strong> Making false, deceptive, or misleading claims about Novelify&apos;s features, pricing, or functionality.</li>
            <li><strong style={{ color: TEXT }}>Brand bidding:</strong> Bidding on Novelify brand terms (including &quot;Novelify&quot; and common misspellings) in paid search or social media advertising without prior written approval.</li>
            <li><strong style={{ color: TEXT }}>Coupon/traffic arbitrage:</strong> Operating coupon or deal sites that primarily drive traffic through affiliate links without adding genuine value.</li>
            <li><strong style={{ color: TEXT }}>Multi-level marketing:</strong> Recruiting sub-affiliates or building a downline. Commissions are earned on direct referrals only.</li>
            <li><strong style={{ color: TEXT }}>Impersonation:</strong> Impersonating Novelify or creating fake endorsements or reviews.</li>
          </ul>
          <p style={{ margin: 0 }}>
            Novelify reserves the right to determine, in its sole discretion, what constitutes a prohibited activity.
          </p>
        </Section>

        <Section title="7. Termination and Suspension">
          <p style={{ margin: '0 0 12px' }}>
            Novelify may suspend or terminate your affiliate account at any time, with or without cause, and with or without notice. Upon termination:
          </p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
            <li>Your affiliate account will be deactivated and your referral links will stop working.</li>
            <li>Pending commissions that have not yet been paid may be forfeited if the termination is for cause (violation of these terms).</li>
            <li>Commissions that have already been paid are not subject to clawback unless the termination is due to fraud or violation of prohibited activities.</li>
          </ul>
          <p style={{ margin: 0 }}>
            You may voluntarily withdraw from the affiliate program at any time by contacting support. Voluntary withdrawal will result in forfeiture of all pending commissions.
          </p>
        </Section>

        <Section title="8. Changes to the Program">
          <p style={{ margin: '0 0 12px' }}>
            Novelify reserves the right to modify or discontinue the Affiliate Program, these terms, commission rates, payout thresholds, or any other aspect of the program at any time, with or without notice.
          </p>
          <p style={{ margin: 0 }}>
            Material changes will be communicated via email to the address associated with your affiliate account. Your continued participation in the program after changes are posted constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="9. Contact">
          <p style={{ margin: 0 }}>
            For questions about the affiliate program, these terms, or your commissions, please contact us at{' '}
            <a href="mailto:support@novelify.online" style={{ color: GOLD, textDecoration: 'none' }}>support@novelify.online</a>.
            We aim to respond to all inquiries within 2 business days.
          </p>
        </Section>
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, background: SURFACE, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Refund Policy', href: '/refund' },
              { label: 'Contact', href: '/contact' },
              { label: 'Support', href: '/support' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ fontSize: 12, color: MUTED, textDecoration: 'none' }}>{link.label}</Link>
            ))}
          </div>
          <span style={{ fontSize: 11, color: DIM }}>&copy; {new Date().getFullYear()} Novelify. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
