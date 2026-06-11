type EventProperties = Record<string, string | number | boolean | undefined | null>

const isDev = process.env.NODE_ENV === 'development'

export function trackEvent(name: string, properties?: EventProperties) {
  if (isDev) {
  }
}
