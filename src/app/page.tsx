'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore } from '@/lib/store';
import { Hero } from '@/components/novelify/hero';
import { Sidebar } from '@/components/novelify/sidebar';
import { Dashboard } from '@/components/novelify/dashboard';
import { ProjectWorkspace } from '@/components/novelify/project-workspace';
import { WritingStudio } from '@/components/novelify/writing-studio';
import { Translation } from '@/components/novelify/translation';
import { Synopsis } from '@/components/novelify/synopsis';
import { CoverGenerator } from '@/components/novelify/cover-generator';
import { EpubExport } from '@/components/novelify/epub-export';
import { SettingsPage } from '@/components/novelify/settings';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentView, sidebarOpen, setCurrentView } = useNovelifyStore();

  const authenticated = status === 'authenticated';

  // Redirect non-hero views to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated' && currentView !== 'hero') {
      setCurrentView('hero');
    }
  }, [status, currentView, setCurrentView]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  // Unauthenticated — show hero always
  if (!authenticated) {
    return <Hero />;
  }

  // Hero view standalone
  if (currentView === 'hero') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Hero />
        </motion.div>
      </AnimatePresence>
    );
  }

  // All other authenticated views
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'project':
        return <ProjectWorkspace />;
      case 'writing':
        return <WritingStudio />;
      case 'translate':
        return <Translation />;
      case 'synopsis':
        return <Synopsis />;
      case 'cover':
        return <CoverGenerator />;
      case 'export':
        return <EpubExport />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 256 : 64 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
