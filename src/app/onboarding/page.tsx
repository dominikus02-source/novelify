'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { SimplifiedOnboardingWizard } from '@/components/novelify/simplified-onboarding-wizard';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');

  const handleComplete = async (answers: any) => {
    setGenerating(true);
    setStatus('Building your story workspace...');

    try {
      const genRes = await fetch('/api/onboarding/generate-starter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        toast.error(err.error || 'Generation failed. Please try again.');
        setGenerating(false);
        return;
      }

      const genData = await genRes.json();
      setStatus('Creating your novel project...');

      const createRes = await fetch('/api/onboarding/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: genData.data,
          language: answers.language,
          genre: answers.genre,
        }),
      });

      if (!createRes.ok) {
        toast.error('Failed to create project. Please try again.');
        setGenerating(false);
        return;
      }

      const createData = await createRes.json();
      setStatus('Opening Writing Studio...');

      await updateSession();

      router.push(`/dashboard/writing/${createData.project.id}?onboarding=true`);
    } catch {
      toast.error('Something went wrong. Please try again.');
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--novel-bg)', padding: 24,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--novel-gold-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: 'var(--novel-gold)',
          }}>
            <Loader2 style={{ width: 28, height: 28, animation: 'spin 1s linear infinite' }} />
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: 'var(--novel-text)', marginBottom: 8 }}>
            We are building your workspace
          </h2>
          <p style={{ fontSize: 13, color: 'var(--novel-muted)', marginBottom: 24 }}>{status}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            {[
              'Generating story outline',
              'Creating characters',
              'Building chapter structure',
              'Preparing your first scene',
              'Saving to your workspace',
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 12, color: 'var(--novel-muted-dark)',
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--novel-gold-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {i < 3 ? (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--novel-gold)' }} />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--novel-muted-dark)' }} />
                  )}
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <SimplifiedOnboardingWizard onComplete={handleComplete} />;
}
