'use client';

// Note: page is 'use client' so metadata is set via root layout template

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
