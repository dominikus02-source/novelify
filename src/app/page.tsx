'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNovelifyStore } from '@/lib/store';
import { Hero } from '@/components/novelify/hero';
import { Sidebar } from '@/components/novelify/sidebar';
import { CommandCenter } from '@/components/novelify/command-center';
import { ProjectWorkspace } from '@/components/novelify/project-workspace';
import { WritingStudio } from '@/components/novelify/writing-studio';
import { Translation } from '@/components/novelify/translation';
import { Synopsis } from '@/components/novelify/synopsis';
import { CoverGenerator } from '@/components/novelify/cover-generator';
import { EpubExport } from '@/components/novelify/epub-export';
import { SettingsPage } from '@/components/novelify/settings';
import {
  MyNovelsPage, StoryBiblePage, PlotBoardPage, AICoWriterPage,
  WritingGoalsPage, RevisionRoomPage, TranslationStudioPage,
  PublishingCenterPage, CoverStudioPage, TemplatesPage,
  ResearchVaultPage, AnalyticsPage, MarketingKitPage,
} from '@/components/novelify/pages';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentView, sidebarOpen, setCurrentView } = useNovelifyStore();

  const authenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated' && currentView !== 'hero') {
      setCurrentView('hero');
    }
    if (status === 'authenticated' && currentView === 'hero') {
      setCurrentView('dashboard');
    }
  }, [status, currentView, setCurrentView]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return <Hero />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <CommandCenter />;
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
      // New views
      case 'my-novels':
        return <MyNovelsPage />;
      case 'story-bible':
        return <StoryBiblePage />;
      case 'plot-board':
        return <PlotBoardPage />;
      case 'ai-cowriter':
        return <AICoWriterPage />;
      case 'writing-goals':
        return <WritingGoalsPage />;
      case 'revision':
        return <RevisionRoomPage />;
      case 'translation-studio':
        return <TranslationStudioPage />;
      case 'publishing':
        return <PublishingCenterPage />;
      case 'cover-studio':
        return <CoverStudioPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'research':
        return <ResearchVaultPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'marketing':
        return <MarketingKitPage />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <Sidebar />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 240 : 64 }}
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
