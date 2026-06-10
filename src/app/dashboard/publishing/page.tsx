'use client';

import { ProjectPicker } from '@/components/novelify/project-picker';

export default function PublishingPage() {
  return (
    <ProjectPicker
      title="Publishing"
      description="Select a novel to publish"
      targetRoute="/dashboard/publishing"
    />
  );
}
