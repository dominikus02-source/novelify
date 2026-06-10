'use client';

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
  const { currentView, sidebarOpen } = useNovelifyStore();

  // Hero view is standalone (no sidebar)
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

  // All other views have the sidebar
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
