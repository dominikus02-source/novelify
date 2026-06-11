'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useProject } from '@/lib/use-project';

const PublishingCenterPage = dynamic(() => import('@/components/novelify/publishing-center').then(m => m.PublishingCenterPage), { ssr: false });

export default function PublishingProjectPage() {
  const params = useParams();
  const project = useProject(params.projectId as string);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  return <PublishingCenterPage />;
}
