'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, Sparkles, ArrowRight, Users, Map } from 'lucide-react';

const SAMPLE = {
  title: 'The Last Letter from Elaria',
  genre: 'Fantasy Mystery',
  premise: 'When archivist Mira discovers a sealed letter hidden in the royal library, she unwinds a conspiracy that stretches across three kingdoms — and a war that never truly ended.',
  characters: [
    { name: 'Mira Vellan', role: 'Protagonist', desc: 'A meticulous royal archivist with a gift for finding what others hide.' },
    { name: 'Captain Toren Ashvale', role: 'Ally', desc: 'A disgraced soldier seeking redemption through Mira\'s quest.' },
    { name: 'The Whisperer', role: 'Antagonist', desc: 'A shadowy figure who controls the kingdom\'s secrets from the dark.' },
  ],
  chapters: [
    { num: 1, title: 'The Sealed Letter', excerpt: 'The archive smelled of cedar and time. Mira ran her fingers along the shelf, stopping at a book that felt wrong — newer than the rest, its spine uncreased.' },
    { num: 2, title: 'Footsteps in the Dark', excerpt: 'Someone had been in her office. The letter was gone. The candle still warm.' },
    { num: 3, title: 'The Queen\'s Secret', excerpt: 'Her Majesty spoke in riddles, but Mira had spent a lifetime decoding the truth hidden in plain sight.' },
  ],
  plot: [
    'Beginning — Mira finds the letter',
    'Rising Action — The chase across the city',
    'Midpoint — Discovery of the conspiracy',
    'Climax — Confrontation in the throne room',
    'Falling Action — The truth revealed',
    'Ending — A new dawn for Elaria',
  ],
};

export default function SampleNovelPage() {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ background: '#080808', color: '#F5F5F7', minHeight: '100vh' }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))',
            border: '1px solid rgba(201,169,110,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <BookOpen style={{ width: 32, height: 32, color: '#C9A96E' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>{SAMPLE.title}</h1>
          <p style={{ fontSize: 13, color: '#C9A96E', marginBottom: 12 }}>{SAMPLE.genre}</p>
          <p style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>{SAMPLE.premise}</p>
        </div>

        {/* Characters */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users style={{ width: 16, height: 16, color: '#C9A96E' }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600 }}>Characters</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SAMPLE.characters.map((c) => (
              <div key={c.name} style={{
                padding: '14px 18px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(201,169,110,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#C9A96E', fontSize: 14, fontWeight: 700,
                  }}>{c.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: '#C9A96E' }}>{c.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: '#8E8E93', lineHeight: 1.5, marginTop: 8 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plot Cards */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Map style={{ width: 16, height: 16, color: '#C9A96E' }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600 }}>Plot Board</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SAMPLE.plot.map((beat, i) => (
              <div key={i} style={{
                padding: '8px 14px', borderRadius: 20,
                background: i < 2 ? 'rgba(201,169,110,0.10)' : i < 4 ? 'rgba(167,139,250,0.10)' : 'rgba(52,211,153,0.10)',
                border: `1px solid ${
                  i < 2 ? 'rgba(201,169,110,0.2)' : i < 4 ? 'rgba(167,139,250,0.2)' : 'rgba(52,211,153,0.2)'
                }`,
                color: i < 2 ? '#C9A96E' : i < 4 ? '#A78BFA' : '#34D399',
                fontSize: 11, fontWeight: 500,
              }}>
                {beat}
              </div>
            ))}
          </div>
        </section>

        {/* Chapter Previews */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <PenTool style={{ width: 16, height: 16, color: '#C9A96E' }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 600 }}>Chapters</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SAMPLE.chapters.map((ch) => (
              <div key={ch.num} style={{
                padding: 18, borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 10, color: '#636366', marginBottom: 4 }}>Chapter {ch.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#C9A96E', marginBottom: 8, fontFamily: "'Playfair Display',serif" }}>{ch.title}</div>
                <p style={{ fontSize: 12, color: '#8E8E93', lineHeight: 1.7, fontStyle: 'italic' }}>{ch.excerpt}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <button onClick={() => router.push('/onboarding')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 28px', borderRadius: 12,
            background: 'linear-gradient(135deg, #C9A96E, #E8C98A)', color: '#1a0f00',
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
          }}>
            <Sparkles style={{ width: 18, height: 18 }} />
            Create Your Own Novel
            <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
