import { db } from '@/lib/db';

const LIMITS: Record<string, number> = {
  free: 1000,
  pro: 10000,
};

export async function checkWordLimit(userId: string, newWords: number): Promise<{ allowed: boolean; used: number; limit: number; remaining: number } | { error: string }> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'User not found' };

  const today = new Date().toISOString().slice(0, 10);
  const plan = user.plan || 'free';
  const limit = LIMITS[plan] || 1000;

  let currentDaily = user.dailyWordCount || 0;
  if (user.dailyWordDate !== today) {
    currentDaily = 0;
    await db.user.update({
      where: { id: userId },
      data: { dailyWordCount: 0, dailyWordDate: today },
    });
  }

  if (currentDaily + newWords > limit) {
    return { allowed: false, used: currentDaily, limit, remaining: limit - currentDaily };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      dailyWordCount: currentDaily + newWords,
      dailyWordDate: today,
      wordCountUsed: user.wordCountUsed + newWords,
    },
  });

  return { allowed: true, used: currentDaily + newWords, limit, remaining: limit - (currentDaily + newWords) };
}
