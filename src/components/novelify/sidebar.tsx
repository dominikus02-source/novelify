'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, PenTool, FileText, Layout, Sparkles,
  FileEdit, Languages, Download, Layers, Megaphone,
  Settings, ChevronLeft, LogOut, Menu,
} from 'lucide-react';
import { useNovelifyStore, type AppView, PROJECT_VIEWS, resolveActiveProject } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from './dashboard-components';
import { PlanBadge } from './plan-badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

interface NavItemDef {
  icon: React.ElementType;
  label: string;
  view: AppView;
  section: 'workspace' | 'tools' | 'publishing' | 'resources' | 'account';
  path: string;
}

const navItems: NavItemDef[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard', section: 'workspace', path: '/dashboard' },
  { icon: BookOpen, label: 'My Novels', view: 'my-novels', section: 'workspace', path: '/dashboard/novels' },
  { icon: PenTool, label: 'Writing Studio', view: 'writing', section: 'workspace', path: '/dashboard/writing' },
  { icon: FileText, label: 'Story Bible', view: 'story-bible', section: 'workspace', path: '/dashboard/bible' },
  { icon: Layout, label: 'Plot Board', view: 'plot-board', section: 'workspace', path: '/dashboard/plot' },

  { icon: Sparkles, label: 'AI Co-Writer', view: 'ai-cowriter', section: 'tools', path: '/dashboard/ai' },
  { icon: FileEdit, label: 'Revision', view: 'revision', section: 'tools', path: '/dashboard/revision' },
  { icon: Languages, label: 'Translation', view: 'translation', section: 'tools', path: '/dashboard/translation' },
  { icon: Download, label: 'Publishing', view: 'publishing', section: 'tools', path: '/dashboard/publishing' },

  { icon: Layers, label: 'Templates', view: 'templates', section: 'resources', path: '/dashboard/templates' },
  { icon: Megaphone, label: 'Marketing Kit', view: 'marketing', section: 'resources', path: '/dashboard/marketing' },

  { icon: Settings, label: 'Settings', view: 'settings', section: 'account', path: '/dashboard/settings' },
];

const sectionLabels: Record<string, string> = {
  workspace: 'Workspace',
  tools: 'AI & Production',
  resources: 'Resources',
  account: 'Account',
};

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    currentView, setCurrentView, sidebarOpen, setSidebarOpen,
    selectedProject, setSelectedProject, projects, lastActiveProjectId,
  } = useNovelifyStore();

  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = () => setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    handler();
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    setMobileSheetOpen(false);
  };

  const getRoute = (item: NavItemDef) => {
    if (PROJECT_VIEWS.includes(item.view)) {
      const project = resolveActiveProject(projects, selectedProject, lastActiveProjectId);
      if (project) {
        return `${item.path}/${project.id}`;
      }
      if (projects.length > 0) {
        return `${item.path}/${projects[0].id}`;
      }
      return '/dashboard/projects/new';
    }
    return item.path;
  };

  const handleNavigate = (item: NavItemDef) => {
    setCurrentView(item.view);
    setMobileSheetOpen(false);

    if (PROJECT_VIEWS.includes(item.view)) {
      const project = resolveActiveProject(projects, selectedProject, lastActiveProjectId);
      if (project) {
        setSelectedProject(project);
        router.push(`${item.path}/${project.id}`);
        return;
      }
      if (projects.length > 0) {
        const firstProject = projects[0];
        setSelectedProject(firstProject);
        router.push(`${item.path}/${firstProject.id}`);
        return;
      }
      router.push('/dashboard/projects/new');
      return;
    }

    router.push(item.path);
  };

  const isActive = (view: AppView) => currentView === view;

  const navLogo = (
    <div style={{
      width: 30, height: 30, flexShrink: 0,
      background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
      borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, fontWeight: 700, color: '#1a0f00',
      boxShadow: '0 2px 8px rgba(201,169,110,0.3)',
    }}>N</div>
  );

  const renderNavItem = (item: NavItemDef, showLabel: boolean) => {
    const Icon = item.icon;
    const active = isActive(item.view);
    return (
      <button key={item.view}
        onClick={() => handleNavigate(item)}
        title={!showLabel ? item.label : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 8px', borderRadius: 10, cursor: 'pointer',
          border: 'none', width: '100%', fontSize: 12, fontWeight: 500,
          textAlign: 'left', color: active ? '#E8C98A' : '#8E8E93',
          background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
          transition: 'background .15s',
          justifyContent: showLabel ? 'flex-start' : 'center',
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F7'; } }}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8E8E93'; } }}
      >
        <Icon style={{ width: 16, height: 16, flexShrink: 0, opacity: active ? 1 : 0.7 }} />
        <AnimatePresence>
          {showLabel && (
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
        {showLabel && active && (
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C9A96E', flexShrink: 0 }} />
        )}
      </button>
    );
  };

  const renderSheetNavItem = (item: NavItemDef) => {
    const Icon = item.icon;
    const active = isActive(item.view);
    return (
      <SheetClose asChild key={item.view}>
        <button
          onClick={() => handleNavigate(item)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 8px', borderRadius: 10, cursor: 'pointer',
            border: 'none', width: '100%', fontSize: 12, fontWeight: 500,
            textAlign: 'left', color: active ? '#E8C98A' : '#8E8E93',
            background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F7'; } }}
          onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8E8E93'; } }}
        >
          <Icon style={{ width: 16, height: 16, flexShrink: 0, opacity: active ? 1 : 0.7 }} />
          <span style={{ flex: 1 }}>{item.label}</span>
          {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C9A96E', flexShrink: 0 }} />}
        </button>
      </SheetClose>
    );
  };

  const renderNavSections = (renderFn: (item: NavItemDef) => React.ReactNode, showLabel: boolean = true) => (
    (['workspace', 'tools', 'resources', 'account'] as const).map((section) => (
      <div key={section}>
        {showLabel && (
          <div style={{ fontSize: 9, fontWeight: 600, color: '#636366', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 14px', margin: '8px 0 4px' }}>
            {sectionLabels[section]}
          </div>
        )}
        <nav style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.filter((item) => item.section === section).map(renderFn)}
        </nav>
      </div>
    ))
  );

  return (
    <>
      <style>{`[data-mobile-sheet="true"] > button:last-child { display: none !important; }`}</style>

      {/* Mobile header bar */}
      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        zIndex: 50, background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', padding: '0 14px', justifyContent: 'space-between',
      }}>
        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#1a0f00',
            boxShadow: '0 2px 8px rgba(201,169,110,0.3)',
          }}>N</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em' }}>Novelify</span>
        </a>
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5F5F7', padding: 4, display: 'flex' }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" data-mobile-sheet="true" className="p-0" style={{
            background: '#0a0a0a', width: 280, maxWidth: 280,
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Logo */}
              <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 14px 16px', textDecoration: 'none', flexShrink: 0 }}>
                {navLogo}
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em' }}>Novelify</span>
              </a>

              {/* Nav sections */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {renderNavSections(renderSheetNavItem, true)}
              </div>

              {/* Bottom area */}
              <div style={{ flexShrink: 0, padding: '0 6px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '0 6px', marginTop: 4, marginBottom: 4 }}>
                  <PlanBadge />
                </div>

                {selectedProject && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.15)', margin: '0 0 4px 0' }}>
                    <BookOpen style={{ width: 12, height: 12, flexShrink: 0, color: '#C9A96E' }} />
                    <span style={{ fontSize: 10, color: '#E8C98A', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProject.title}</span>
                    <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93', padding: 0, display: 'flex' }}>
                      <ChevronLeft style={{ width: 10, height: 10 }} />
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: '#161616', marginBottom: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#C9A96E', flexShrink: 0 }}>
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'N'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session?.user?.name || 'Writer'}
                    </div>
                  </div>
                  <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636366', padding: 2, display: 'flex' }}>
                    <LogOut style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:block"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
          display: 'flex', flexDirection: 'column',
          background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto', overflowX: 'hidden',
        }}
      >
        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '18px 14px 20px' : '18px 0 20px', justifyContent: sidebarOpen ? 'flex-start' : 'center', textDecoration: 'none', flexShrink: 0 }}>
          {navLogo}
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

        {renderNavSections((item) => renderNavItem(item, sidebarOpen), sidebarOpen)}

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 6px', marginBottom: 4 }}>
          <PlanBadge />
        </div>

        <div style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
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

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: '#161616', marginBottom: 4 }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(201,169,110,0.10)', border: '1px solid rgba(201,169,110,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#C9A96E', flexShrink: 0 }}>
                  {session?.user?.name?.charAt(0)?.toUpperCase() || 'N'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session?.user?.name || 'Writer'}
                  </div>
                </div>
                <button onClick={handleSignOut} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636366', padding: 2, display: 'flex' }}>
                  <LogOut style={{ width: 12, height: 12 }} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
    </>
  );
}
