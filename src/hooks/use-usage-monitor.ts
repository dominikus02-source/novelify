'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UsageData {
  aiCreditsUsed: number;
  starterOutlinesUsed: number;
  revisionChecksUsed: number;
  fullRevisionChecksUsed: number;
  translationWordsUsed: number;
  exportsUsed: number;
  marketingAssetsUsed: number;
  projectsCreated: number;
}

interface PlanLimits {
  maxProjects: number | 'unlimited';
  maxChaptersPerProject: number | 'unlimited';
  aiCreditsMonthly: number | 'unlimited';
  exportsMonthly: number | 'unlimited';
  revisionChecksMonthly: number | 'unlimited';
  fullRevisionChecksMonthly: number | 'unlimited';
  translationWordsMonthly: number | 'unlimited';
  marketingAssetsMonthly: number | 'unlimited';
  maxTeamMembers: number | 'unlimited';
  storagePerProjectMb: number | 'unlimited';
}

interface LimitConfig {
  key: string;
  usedKey: keyof UsageData;
  limitKey: keyof PlanLimits;
  label: string;
}

const LIMITS: LimitConfig[] = [
  { key: 'ai_credit', usedKey: 'aiCreditsUsed', limitKey: 'aiCreditsMonthly', label: 'AI Credits' },
  { key: 'export', usedKey: 'exportsUsed', limitKey: 'exportsMonthly', label: 'Exports' },
  { key: 'revision_check', usedKey: 'revisionChecksUsed', limitKey: 'revisionChecksMonthly', label: 'Revision Checks' },
  { key: 'full_revision_check', usedKey: 'fullRevisionChecksUsed', limitKey: 'fullRevisionChecksMonthly', label: 'Full Revisions' },
  { key: 'translation_word', usedKey: 'translationWordsUsed', limitKey: 'translationWordsMonthly', label: 'Translation Words' },
  { key: 'marketing_asset', usedKey: 'marketingAssetsUsed', limitKey: 'marketingAssetsMonthly', label: 'Marketing Assets' },
  { key: 'project_created', usedKey: 'projectsCreated', limitKey: 'maxProjects', label: 'Projects' },
];

function getThreshold(used: number, limit: number): number {
  if (limit === 0) return 100;
  return (used / limit) * 100;
}

export function useUsageMonitor() {
  const warnedRef = useRef<Set<string>>(new Set());

  const checkUsage = useCallback(async () => {
    try {
      const [usageRes, limitsRes, planRes] = await Promise.all([
        fetch('/api/billing/usage'),
        fetch('/api/billing/limits'),
        fetch('/api/billing/plan'),
      ]);
      if (!usageRes.ok || !limitsRes.ok || !planRes.ok) return;

      const usageData = await usageRes.json();
      const limitsData = await limitsRes.json();
      const planData = await planRes.json();
      const usage: UsageData = usageData.usage;
      const limits: PlanLimits = limitsData.limits;
      const plan = planData.plan as string;

      if (!usage || !limits) return;

      const exhausted: string[] = [];
      const critical: string[] = [];

      for (const cfg of LIMITS) {
        const limit = limits[cfg.limitKey];
        if (limit === 'unlimited') continue;

        const used = Number(usage[cfg.usedKey]) || 0;
        const numericLimit = limit as number;
        const pct = getThreshold(used, numericLimit);
        const warnKey = `${cfg.key}_${Math.floor(pct / 10) * 10}`;

        if (warnedRef.current.has(warnKey)) continue;

        if (pct >= 100) {
          exhausted.push(cfg.label);
          warnedRef.current.add(warnKey);
        } else if (pct >= 90) {
          critical.push(`${cfg.label} (${Math.round(pct)}%)`);
          warnedRef.current.add(warnKey);
        } else if (pct >= 80) {
          warnedRef.current.add(warnKey);
          toast(`${cfg.label} running low`, {
            description: `${Math.round(pct)}% used (${used}/${numericLimit}).`,
            duration: 4000,
          });
        }
      }

      if (exhausted.length > 0) {
        toast.error(`Usage limit reached`, {
          description: `${exhausted.join(', ')} exhausted${plan === 'free' ? '. Upgrade to Starter to continue.' : '. Upgrade your plan for more.'}`,
          duration: 8000,
        });
      } else if (critical.length > 0) {
        toast.warning(`Usage nearly exhausted`, {
          description: `${critical.join(', ')} almost gone. Upgrade your plan to avoid interruption.`,
          duration: 6000,
        });
      }
    } catch {
      // silently fail
    }
  }, []);

  const warnAfterUsage = useCallback((type: string, remaining: number | 'unlimited', limit: number | 'unlimited') => {
    if (remaining === 'unlimited' || limit === 'unlimited') return;
    const cfg = LIMITS.find(l => l.key === type);
    if (!cfg) return;

    const numericLimit = limit as number;
    const used = numericLimit - (remaining as number);
    const pct = getThreshold(used, numericLimit);

    if (pct >= 100) {
      toast.error(`${cfg.label} exhausted`, {
        description: `You've used all ${numericLimit} ${cfg.label.toLowerCase()} this month. Upgrade to continue using this feature.`,
        duration: 6000,
      });
    } else if (pct >= 90) {
      toast.warning(`${cfg.label} nearly exhausted`, {
        description: `${Math.round(pct)}% used (${used}/${numericLimit}). Upgrade your plan to get more.`,
        duration: 5000,
      });
    }
  }, []);

  useEffect(() => {
    checkUsage();
    const interval = setInterval(checkUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkUsage]);

  return { warnAfterUsage };
}
