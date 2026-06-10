'use client';

import { useNovelifyStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';

export function CoverGenerator() {
  const { selectedProject, setCurrentView } = useNovelifyStore();

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-amber/10">
            <ImageIcon className="size-10 text-amber" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Select a project first</h2>
          <Button
            onClick={() => setCurrentView('dashboard')}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink mb-6">Cover Art Generator</h1>
        <Card className="border-border/50 bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <ImageIcon className="size-12 text-amber mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-ink mb-2">Generate Cover for {selectedProject.title}</h3>
            <p className="text-muted-foreground mb-4">AI cover generation coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
