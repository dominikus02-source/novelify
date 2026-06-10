'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PenTool,
  Languages,
  FileText,
  Image,
  Download,
  ChevronLeft,
  BookOpen,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useNovelifyStore, type AppView } from '@/lib/store';

const navItems: { icon: React.ElementType; label: string; view: AppView }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: PenTool, label: 'Writing Studio', view: 'writing' },
  { icon: Languages, label: 'Translation', view: 'translate' },
  { icon: FileText, label: 'Synopsis', view: 'synopsis' },
  { icon: Image, label: 'Cover Art', view: 'cover' },
  { icon: Download, label: 'Export', view: 'export' },
  { icon: SettingsIcon, label: 'Settings', view: 'settings' },
];

export function Sidebar() {
  const {
    currentView,
    setCurrentView,
    sidebarOpen,
    setSidebarOpen,
    selectedProject,
    setSelectedProject,
  } = useNovelifyStore();

  const isActive = (view: AppView) => currentView === view;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#0D0D0D] border-r border-white/5"
    >
      {/* Top section — Brand */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/5">
        <BookOpen className="h-6 w-6 shrink-0 text-[#C8873A]" />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-bold text-xl text-[#F7F3EC]">Noveli</span>
              <span className="font-bold text-xl text-[#C8873A]">fy</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.view);

          return (
            <motion.button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              whileTap={{ scale: 0.97 }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-sm ${
                active
                  ? 'bg-[#C8873A]/10 text-[#C8873A]'
                  : 'text-[#F7F3EC]/50 hover:text-[#F7F3EC]/80 hover:bg-white/5'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section — Selected project + collapse toggle */}
      <div className="border-t border-white/5 px-2 py-3 space-y-2">
        {/* Selected project */}
        <AnimatePresence>
          {sidebarOpen && selectedProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
                <BookOpen className="h-4 w-4 shrink-0 text-[#C8873A]" />
                <span className="text-xs text-[#F7F3EC]/70 truncate flex-1">
                  {selectedProject.title}
                </span>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="shrink-0 rounded p-0.5 text-[#F7F3EC]/40 hover:text-[#F7F3EC]/80 transition-colors"
                  title="Deselect project"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse / expand toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all text-sm text-[#F7F3EC]/40 hover:text-[#F7F3EC]/80 hover:bg-white/5"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-5 w-5 shrink-0" />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
