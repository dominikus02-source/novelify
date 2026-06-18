'use client';

import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { useProject } from '@/lib/use-project';

const WritingStudio = dynamic(() => import('@/components/novelify/writing-studio').then(m => m.WritingStudio), { ssr: false });

export default function WritingProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const project = useProject(params.projectId as string);
  const onboarding = searchParams.get('onboarding') === 'true';

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  return <WritingStudio onboarding={onboarding} />;
}
