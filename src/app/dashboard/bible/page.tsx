'use client';

import { ProjectPicker } from '@/components/novelify/project-picker';

export default function BiblePage() {
  return (
    <ProjectPicker
      title="Story Bible"
      description="Select a novel to view its Story Bible"
      targetRoute="/dashboard/bible"
    />
  );
}
