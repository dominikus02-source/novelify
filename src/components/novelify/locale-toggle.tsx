'use client'

import { useI18n } from '@/lib/i18n/context'

export function LocaleToggle() {
  const { locale, setLocale } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
      aria-label="Switch language"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 20,
        fontSize: 13, fontWeight: 500,
        background: 'transparent',
        border: '1px solid var(--lp-border)',
        color: 'var(--lp-muted)',
        cursor: 'pointer',
        transition: 'color .2s, border-color .2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--lp-white)'
        e.currentTarget.style.borderColor = 'var(--lp-border-bright)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--lp-muted)'
        e.currentTarget.style.borderColor = 'var(--lp-border)'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      {locale === 'en' ? 'ID' : 'EN'}
    </button>
  )
}

export function LocaleToggleMobile() {
  const { locale, setLocale, t } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
      style={{
        width: '100%', padding: '14px', borderRadius: 12,
        fontSize: 15, fontWeight: 500,
        color: 'var(--lp-white)',
        background: 'var(--lp-surface2)',
        border: '1px solid var(--lp-border)',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'all .2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border-bright)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--lp-border)'; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      {locale === 'en' ? t('lang_id') : t('lang_en')}
    </button>
  )
}
