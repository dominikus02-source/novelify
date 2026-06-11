export function LegalPageHeader({
  title,
  summary,
  lastUpdated,
  email = 'support@novelify.online',
}: {
  title: string
  summary: string
  lastUpdated: string
  email?: string
}) {
  const GOLD = '#C9A96E'
  const TEXT = '#F5F5F7'
  const MUTED = '#8E8E93'

  return (
    <div style={{ marginBottom: 40 }}>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36,
          fontWeight: 700,
          color: GOLD,
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '0 0 16px', maxWidth: 640 }}>
        {summary}
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ color: MUTED }}>
          Last updated: <span style={{ color: TEXT, fontWeight: 500 }}>{lastUpdated}</span>
        </span>
        <span style={{ color: MUTED }}>
          Questions? Email{' '}
          <a href={`mailto:${email}`} style={{ color: GOLD, textDecoration: 'none' }}>
            {email}
          </a>
        </span>
      </div>
    </div>
  )
}
