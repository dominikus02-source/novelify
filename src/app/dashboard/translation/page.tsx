'use client';

// Note: page is 'use client' so metadata is set via root layout template

import { ProjectPicker } from '@/components/novelify/project-picker';

export default function TranslationPage() {
  return (
    <ProjectPicker
      title="Translation"
      description="Select a novel to translate"
      targetRoute="/dashboard/translation"
    />
  );
}
