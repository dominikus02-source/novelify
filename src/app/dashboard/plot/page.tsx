'use client';

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
