'use client';

import { ProjectPicker } from '@/components/novelify/project-picker';

export default function RevisionPage() {
  return (
    <ProjectPicker
      title="Revision"
      description="Select a novel to revise"
      targetRoute="/dashboard/revision"
    />
  );
}
