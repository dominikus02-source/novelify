'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { translations, defaultLocale, type Locale, type TranslationKey } from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    const stored = localStorage.getItem('novelify-locale')
    if (stored === 'en' || stored === 'id') {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = useCallback((locale: Locale) => {
    setLocaleState(locale)
    localStorage.setItem('novelify-locale', locale)
    document.documentElement.lang = locale
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale]?.[key] ?? translations.en[key] ?? key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
