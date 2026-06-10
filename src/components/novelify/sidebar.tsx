'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PenTool, FileText, Layout, Sparkles,
  Target, FileEdit, Languages, Download, Image, Layers, BookMarked,
  BarChart3, Megaphone, Settings, ChevronLeft, LogOut,
} from 'lucide-react';
import { useNovelifyStore, type AppView } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from './dashboard-components';

interface NavItemDef {
  icon: React.ElementType;
  label: string;
  view: AppView;
  section: 'workspace' | 'tools' | 'publishing' | 'insights';
}

const navItems: NavItemDef[] = [
  // Workspace
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard', section: 'workspace' },
  { icon: BookOpen, label: 'My Novels', view: 'my-novels', section: 'workspace' },
  { icon: PenTool, label: 'Writing Studio', view: 'writing', section: 'workspace' },
  { icon: FileText, label: 'Story Bible', view: 'story-bible', section: 'workspace' },
  { icon: Layout, label: 'Plot Board', view: 'plot-board', section: 'workspace' },

  // Tools
  { icon: Sparkles, label: 'AI Co-Writer', view: 'ai-cowriter', section: 'tools' },
  { icon: Target, label: 'Writing Goals', view: 'writing-goals', section: 'tools' },
  { icon: FileEdit, label: 'Revision Room', view: 'revision', section: 'tools' },
  { icon: Languages, label: 'Translation', view: 'translation-studio', section: 'tools' },
  { icon: BookMarked, label: 'Research Vault', view: 'research', section: 'tools' },

  // Publishing
  { icon: Download, label: 'Publishing', view: 'publishing', section: 'publishing' },
  { icon: Image, label: 'Cover Studio', view: 'cover-studio', section: 'publishing' },
  { icon: Layers, label: 'Templates', view: 'templates', section: 'publishing' },
  { icon: Megaphone, label: 'Marketing Kit', view: 'marketing', section: 'publishing' },

  // Insights
  { icon: BarChart3, label: 'Analytics', view: 'analytics', section: 'insights' },
  { icon: Settings, label: 'Settings', view: 'settings', section: 'insights' },
];

const sectionLabels: Record<string, string> = {
  workspace: 'Workspace',
  tools: 'Tools',
  publishing: 'Publishing',
  insights: 'Insights',
};

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, selectedProject, setSelectedProject, projects } = useNovelifyStore();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setCurrentView('hero');
    router.refresh();
  };

  const isActive = (view: AppView) => currentView === view;
  const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column',
        background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto', overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '18px 14px 20px' : '18px 0 20px', justifyContent: sidebarOpen ? 'flex-start' : 'center', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          width: 30, height: 30, flexShrink: 0,
          background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
          borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#1a0f00',
          boxShadow: '0 2px 8px rgba(201,169,110,0.3)',
        }}>N</div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >Novelify</motion.span>
          )}
        </AnimatePresence>
      </a>

      {/* Navigation sections */}
      {(['workspace', 'tools', 'publishing', 'insights'] as const).map((section) => (
        <div key={section}>
          {sidebarOpen && (
            <div style={{ fontSize: 9, fontWeight: 600, color: '#636366', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 14px', margin: '8px 0 4px' }}>
              {sectionLabels[section]}
            </div>
          )}
          <nav style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {navItems.filter((item) => item.section === section).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.view);
              const badge = item.view === 'writing' ? totalChapters : null;
              return (
                <button key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 8px', borderRadius: 10, cursor: 'pointer',
                    border: 'none', width: '100%', fontSize: 12, fontWeight: 500,
                    textAlign: 'left', color: active ? '#E8C98A' : '#8E8E93',
                    background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
                    transition: 'background .15s',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F7'; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8E8E93'; } }}
                >
                  <Icon style={{ width: 16, height: 16, flexShrink: 0, opacity: active ? 1 : 0.7 }} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                        style={{ flex: 1 }}
                      >{item.label}</motion.span>
                    )}
                  </AnimatePresence>
                  {sidebarOpen && badge !== null && badge > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10, padding: '0 6px', fontSize: 9, fontWeight: 600, color: '#8E8E93' }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom section */}
      <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* Selected project */}
        <AnimatePresence>
          {sidebarOpen && selectedProject && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)' }}>
                <BookOpen style={{ width: 12, height: 12, flexShrink: 0, color: '#C9A96E' }} />
                <span style={{ fontSize: 10, color: '#E8C98A', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProject.title}</span>
                <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93', padding: 0, display: 'flex' }}>
                  <ChevronLeft style={{ width: 10, height: 10 }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: '#161616', marginBottom: 4 }}
            >
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#C9A96E', flexShrink: 0 }}>
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.user?.name || 'Writer'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 10, cursor: 'pointer', border: 'none', width: '100%', fontSize: 12, fontWeight: 500, color: '#636366', background: 'transparent', justifyContent: sidebarOpen ? 'flex-start' : 'center', transition: 'background .15s', marginBottom: 8 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8E8E93'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#636366'; }}
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
            <ChevronLeft style={{ width: 16, height: 16, flexShrink: 0 }} />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden whitespace-nowrap">Collapse</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
