'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PlotBoardPage } from '@/components/novelify/pages';
import { useProject } from '@/lib/use-project';
import { useNovelifyStore } from '@/lib/store';

export default function PlotProjectPage() {
  const params = useParams();
  const project = useProject(params.projectId as string);
  const { projects, setProjects } = useNovelifyStore();

  useEffect(() => {
    if (projects.length === 0) {
      fetch('/api/projects').then(r => r.json()).then(setProjects);
    }
  }, []);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  return <PlotBoardPage />;
}
