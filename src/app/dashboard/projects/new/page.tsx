'use client';
import { useSearchParams } from 'next/navigation';
import { CreateNovelWizard } from '@/components/novelify/create-novel-wizard';

export default function NewProjectPage() {
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || undefined;
  return <CreateNovelWizard initialTemplate={template} />;
}
