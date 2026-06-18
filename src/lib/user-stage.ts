export type UserStage =
  | 'NEW_USER'
  | 'FIRST_PROJECT_CREATED'
  | 'ACTIVE_WRITER'
  | 'DRAFT_IN_PROGRESS'
  | 'READY_TO_PUBLISH'
  | 'POWER_USER';

export interface StageInput {
  projectCount: number;
  totalWordCount: number;
  chapterCount: number;
  hasContentInChapter: boolean;
  isPaidUser: boolean;
  publishingOpened: boolean;
  projectMarkedReady: boolean;
}

export function getUserStage(input: StageInput): UserStage {
  if (input.projectCount <= 0) return 'NEW_USER';

  if (input.projectCount >= 2 || input.isPaidUser) return 'POWER_USER';

  if (input.totalWordCount >= 15000 || input.publishingOpened || input.projectMarkedReady) {
    return 'READY_TO_PUBLISH';
  }

  if (input.totalWordCount >= 3000 || input.chapterCount >= 3) return 'DRAFT_IN_PROGRESS';

  if (input.totalWordCount >= 500 || input.hasContentInChapter) return 'ACTIVE_WRITER';

  return 'FIRST_PROJECT_CREATED';
}

export const STAGE_LABELS: Record<UserStage, string> = {
  NEW_USER: 'Getting Started',
  FIRST_PROJECT_CREATED: 'First Steps',
  ACTIVE_WRITER: 'Active Writer',
  DRAFT_IN_PROGRESS: 'Building Your Draft',
  READY_TO_PUBLISH: 'Ready to Publish',
  POWER_USER: 'Power User',
};

export const STAGE_ORDERS: Record<UserStage, number> = {
  NEW_USER: 0,
  FIRST_PROJECT_CREATED: 1,
  ACTIVE_WRITER: 2,
  DRAFT_IN_PROGRESS: 3,
  READY_TO_PUBLISH: 4,
  POWER_USER: 5,
};

export function getStageFromProjects(projects: any[], isPaidUser: boolean = false): UserStage {
  if (!projects || projects.length === 0) return 'NEW_USER';

  const totalWordCount = projects.reduce(
    (sum: number, p: any) =>
      sum + (p.chapters || []).reduce((cs: number, c: any) => cs + (c.wordCount || 0), 0),
    0
  );
  const chapterCount = projects.reduce(
    (sum: number, p: any) => sum + (p.chapters || []).length, 0
  );
  const hasContentInChapter = projects.some((p: any) =>
    (p.chapters || []).some((c: any) => (c.contentOriginal?.length || 0) > 0)
  );
  const projectMarkedReady = projects.some((p: any) => p.status === 'ready' || p.status === 'exported');

  return getUserStage({
    projectCount: projects.length,
    totalWordCount,
    chapterCount,
    hasContentInChapter,
    isPaidUser,
    publishingOpened: false,
    projectMarkedReady,
  });
}

export const STAGE_FEATURES: Record<UserStage, string[]> = {
  NEW_USER: ['start', 'my-novels', 'settings'],
  FIRST_PROJECT_CREATED: ['writing', 'story-bible', 'plot-board', 'my-novels', 'settings'],
  ACTIVE_WRITER: ['writing', 'story-bible', 'plot-board', 'revision', 'continuity', 'my-novels', 'settings'],
  DRAFT_IN_PROGRESS: ['writing', 'story-bible', 'plot-board', 'revision', 'continuity', 'my-novels', 'settings'],
  READY_TO_PUBLISH: ['writing', 'story-bible', 'plot-board', 'revision', 'continuity', 'publishing', 'export', 'translation', 'marketing', 'my-novels', 'settings'],
  POWER_USER: ['writing', 'story-bible', 'plot-board', 'revision', 'continuity', 'publishing', 'export', 'translation', 'marketing', 'affiliate', 'my-novels', 'settings'],
};

export function shouldShowFeature(feature: string, stage: UserStage): boolean {
  const features = STAGE_FEATURES[stage] || STAGE_FEATURES.NEW_USER;
  return features.includes(feature);
}

export const STAGE_DASHBOARD_RECOMMENDATIONS: Record<UserStage, { title: string; description: string; cta: string; action: string; ctaSecondary?: string; actionSecondary?: string }> = {
  NEW_USER: {
    title: 'Start your first novel',
    description: 'Answer a few simple questions. Novelify will prepare your writing workspace so you can begin Chapter 1.',
    cta: 'Create My First Novel',
    action: 'create-first',
    ctaSecondary: 'Explore Sample Novel',
    actionSecondary: 'sample',
  },
  FIRST_PROJECT_CREATED: {
    title: 'Your workspace is ready',
    description: 'Open your novel and start Chapter 1. Your outline, characters, and plot are ready to go.',
    cta: 'Start Chapter 1',
    action: 'start-chapter',
    ctaSecondary: 'Review Story Bible',
    actionSecondary: 'story-bible',
  },
  ACTIVE_WRITER: {
    title: 'Keep the momentum going',
    description: 'Continue writing your current chapter or run your first revision check.',
    cta: 'Continue Writing',
    action: 'continue-writing',
    ctaSecondary: 'Run First Revision',
    actionSecondary: 'revision',
  },
  DRAFT_IN_PROGRESS: {
    title: 'Your draft is growing',
    description: 'Check continuity, improve pacing, and review character consistency.',
    cta: 'Check Continuity',
    action: 'continuity',
    ctaSecondary: 'Review Character Consistency',
    actionSecondary: 'story-bible',
  },
  READY_TO_PUBLISH: {
    title: 'Ready to share your story',
    description: 'Prepare your publishing metadata, export your manuscript, and create your marketing kit.',
    cta: 'Prepare Publishing',
    action: 'publishing',
    ctaSecondary: 'Export Manuscript',
    actionSecondary: 'export',
  },
  POWER_USER: {
    title: 'Welcome back, seasoned writer',
    description: 'Manage your projects, review usage, or explore the affiliate program.',
    cta: 'Manage Projects',
    action: 'my-novels',
    ctaSecondary: 'Review Usage',
    actionSecondary: 'settings',
  },
};
