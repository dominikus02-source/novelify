'use client';

import { useEffect } from 'react';
import { useNovelifyStore, resolveActiveProject, type Project } from '@/lib/store';

export function useProject(projectId?: string) {
  const { projects, selectedProject, setSelectedProject, lastActiveProjectId } = useNovelifyStore();

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project && project.id !== selectedProject?.id) {
        setSelectedProject(project);
      }
    }
  }, [projectId, projects, selectedProject, setSelectedProject]);

  if (projectId) {
    return projects.find(p => p.id === projectId) || null;
  }

  return resolveActiveProject(projects, selectedProject, lastActiveProjectId);
}
