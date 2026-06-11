'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useProject } from '@/lib/use-project';

const StoryBiblePage = dynamic(() => import('@/components/novelify/story-bible').then(m => m.StoryBiblePage), { ssr: false });

export default function BibleProjectPage() {
  const params = useParams();
  const project = useProject(params.projectId as string);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  return <StoryBiblePage />;
}
