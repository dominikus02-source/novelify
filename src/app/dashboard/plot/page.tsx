'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { ProjectPicker } from '@/components/novelify/project-picker';

export default function PlotPage() {
  return (
    <ProjectPicker
      title="Plot Board"
      description="Select a novel to open its Plot Board"
      targetRoute="/dashboard/plot"
    />
  );
}
