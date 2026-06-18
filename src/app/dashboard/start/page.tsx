'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, BookOpen, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function StartPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const userName = (session?.user as any)?.name || 'writer';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080808', padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))',
            border: '1px solid rgba(201,169,110,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <PenTool style={{ width: 32, height: 32, color: '#C9A96E' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: '#F5F5F7', marginBottom: 8 }}>
            Start your first novel, {userName}
          </h1>
          <p style={{ fontSize: 13, color: '#8E8E93', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            Answer a few simple questions. Novelify will prepare your writing workspace so you can begin Chapter 1.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, #C9A96E, #E8C98A)', color: '#1a0f00',
              border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,169,110,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(26,15,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: 20, height: 20 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Start from an idea</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Answer 5 questions to generate your workspace</div>
            </div>
            <ArrowRight style={{ width: 18, height: 18, opacity: 0.5 }} />
          </button>

          <button
            onClick={() => router.push('/onboarding?mode=generate')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14,
              background: '#121212', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; e.currentTarget.style.background = '#1a1a1a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#121212'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(201,169,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen style={{ width: 20, height: 20, color: '#C9A96E' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Generate a story idea</div>
              <div style={{ fontSize: 11, color: '#8E8E93' }}>Let AI suggest an idea based on your genre</div>
            </div>
            <ArrowRight style={{ width: 18, height: 18, color: '#636366' }} />
          </button>

          <button
            onClick={() => router.push('/dashboard/sample-novel')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', borderRadius: 14,
              background: '#121212', color: '#F5F5F7', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; e.currentTarget.style.background = '#1a1a1a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#121212'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(201,169,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: 20, height: 20, color: '#C9A96E' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Explore sample workspace</div>
              <div style={{ fontSize: 11, color: '#8E8E93' }}>See what a completed workspace looks like</div>
            </div>
            <ArrowRight style={{ width: 18, height: 18, color: '#636366' }} />
          </button>
        </div>

        <p style={{ fontSize: 10, color: '#636366', textAlign: 'center', marginTop: 24 }}>
          You can change everything later.
        </p>
      </div>
    </motion.div>
  );
}
