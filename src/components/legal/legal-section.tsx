export function LegalSection({
  title,
  children,
  id,
}: {
  title: string
  children: React.ReactNode
  id?: string
}) {
  const GOLD = '#C9A96E'
  const TEXT = '#F5F5F7'
  const MUTED = '#8E8E93'
  const SURFACE = '#121212'
  const BORDER = 'rgba(201,169,110,0.12)'

  return (
    <section id={id} style={{ marginBottom: 32 }}>
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
          {title}
        </h2>
        <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
          {children}
        </div>
      </div>
    </section>
  )
}
