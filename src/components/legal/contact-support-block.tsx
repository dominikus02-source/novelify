const GOLD = '#C9A96E'
const TEXT = '#F5F5F7'
const MUTED = '#8E8E93'
const SURFACE = '#121212'
const BORDER = 'rgba(201,169,110,0.12)'

export function ContactSupportBlock({
  email = 'support@novelify.online',
  billingEmail = 'billing@novelify.online',
}: {
  email?: string
  billingEmail?: string
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 14,
          padding: '24px 28px',
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 600,
            color: GOLD,
            margin: '0 0 16px',
            letterSpacing: '-0.01em',
          }}
        >
          Contact & Support
        </h2>
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 12px' }}>
            If you have questions, concerns, or requests regarding this policy, please contact us:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>
              General support:{' '}
              <a href={`mailto:${email}`} style={{ color: GOLD, textDecoration: 'none' }}>
                {email}
              </a>
            </li>
            <li>
              Billing & refund inquiries:{' '}
              <a href={`mailto:${billingEmail}`} style={{ color: GOLD, textDecoration: 'none' }}>
                {billingEmail}
              </a>
            </li>
            <li>
              Privacy & data requests:{' '}
              <a href={`mailto:${email}`} style={{ color: GOLD, textDecoration: 'none' }}>
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
