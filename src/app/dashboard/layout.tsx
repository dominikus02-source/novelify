'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/novelify/sidebar';
import { useNovelifyStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { UsageMonitor } from '@/components/novelify/usage-monitor';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, currentView, setCurrentView } = useNovelifyStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    handler();
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  useEffect(() => {
    const viewFromPath = pathname.replace('/dashboard/', '').split('/')[0] || 'dashboard';
    const viewMap: Record<string, string> = {
      '': 'dashboard',
      'novels': 'my-novels',
      'writing': 'writing',
      'bible': 'story-bible',
      'plot': 'plot-board',
      'ai': 'ai-cowriter',
      'revision': 'revision',
      'translation': 'translation',
      'publishing': 'publishing',
      'templates': 'templates',
      'marketing': 'marketing',
      'settings': 'settings',
    };
    const mapped = viewMap[viewFromPath];
    if (mapped && mapped !== currentView) {
      setCurrentView(mapped as any);
    }
  }, [pathname, currentView, setCurrentView]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#080808' }}>
      <UsageMonitor />
      <Sidebar />
      <main
        className="dashboard-main transition-all duration-300"
        style={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 64) }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
