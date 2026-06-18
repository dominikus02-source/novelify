import { db } from './db';

type EventProperties = Record<string, string | number | boolean | undefined | null>

export async function trackEvent(name: string, userId?: string | null, properties?: EventProperties) {
  if (!userId) return;

  try {
    await db.usageEvent.create({
      data: {
        userId,
        type: name,
        amount: 1,
        metadata: properties ? JSON.stringify(properties) : null,
      },
    });
  } catch {
  }
}
