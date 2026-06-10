'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore, type Project } from '@/lib/store';
import { BookOpen, PenTool, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { colors, Card } from './dashboard-components';
import { CreateNovelWizard } from './create-novel-wizard';

interface ProjectPickerProps {
  title: string;
  description: string;
  targetRoute: string;
  createLabel?: string;
}

export function ProjectPicker({ title, description, targetRoute, createLabel }: ProjectPickerProps) {
  const router = useRouter();
  const { projects, setSelectedProject } = useNovelifyStore();
  const [createOpen, setCreateOpen] = useState(false);

  const handleSelect = (project: Project) => {
    setSelectedProject(project);
    router.push(`${targetRoute}/${project.id}`);
  };

  if (projects.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8" style={{ background: '#080808' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: 400 }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(201,169,110,0.10)',
            border: '1px solid rgba(201,169,110,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <BookOpen style={{ width: 24, height: 24, color: '#C9A96E' }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 600, color: '#F5F5F7', margin: '0 0 8px' }}>
            {title}
          </h1>
          <p style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.6, margin: '0 0 24px' }}>
            {description}
          </p>
          <p style={{ fontSize: 12, color: '#636366', margin: '0 0 20px' }}>
            You don't have any novels yet. Create your first novel to get started.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
              border: 'none', background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
              color: '#1a0f00', fontSize: 13, fontWeight: 600,
              boxShadow: '0 2px 12px rgba(201,169,110,0.25)',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            {createLabel || 'Create New Novel'}
          </button>
          {createOpen && <CreateNovelWizard onClose={() => setCreateOpen(false)} />}
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: '#F5F5F7', margin: '0 0 6px' }}>
          {title}
        </h1>
        <p style={{ fontSize: 13, color: '#8E8E93', margin: 0 }}>{description}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card hover onClick={() => handleSelect(project)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: project.coverImage
                    ? `url(${project.coverImage}) center/cover`
                    : 'linear-gradient(135deg, rgba(201,169,110,0.12), rgba(201,169,110,0.06))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!project.coverImage && <BookOpen style={{ width: 16, height: 16, color: '#8E8E93' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7', marginBottom: 2 }}>{project.title}</div>
                  <div style={{ fontSize: 11, color: '#636366' }}>
                    {project.chapters.length} chapter{project.chapters.length !== 1 ? 's' : ''}
                    {project.genre ? ` · ${project.genre}` : ''}
                  </div>
                </div>
                <PenTool style={{ width: 14, height: 14, color: '#C9A96E', flexShrink: 0 }} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
