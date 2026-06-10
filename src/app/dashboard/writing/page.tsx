'use client';

import { ProjectPicker } from '@/components/novelify/project-picker';

export default function WritingPage() {
  return (
    <ProjectPicker
      title="Writing Studio"
      description="Select a novel to open in the Writing Studio"
      targetRoute="/dashboard/writing"
      createLabel="Create New Novel"
    />
  );
}
