'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import {
  LayoutDashboard, BookOpen, PenTool, FileText, Layout, Sparkles,
  FileEdit, Languages, Download, Layers, Megaphone,
  Settings, Shield, ChevronLeft, LogOut, ChevronDown,
} from 'lucide-react';
import { useNovelifyStore, type AppView, PROJECT_VIEWS, resolveActiveProject } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { colors } from './dashboard-components';
import { PlanBadge } from './plan-badge';
import { getStageFromProjects, shouldShowFeature, STAGE_LABELS, type UserStage } from '@/lib/user-stage';
import { ThemeToggle } from '@/components/novelify/theme-toggle';

interface NavItemDef {
  icon: React.ElementType;
  label: string;
  view: AppView;
  section: 'workspace' | 'tools' | 'publishing' | 'resources' | 'account' | 'more';
  path: string;
  adminOnly?: boolean;
  featureKey?: string;
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard', section: 'workspace', path: '/dashboard', featureKey: 'dashboard' },
  { icon: BookOpen, label: 'My Novels', view: 'my-novels', section: 'workspace', path: '/dashboard/novels', featureKey: 'my-novels' },
  { icon: PenTool, label: 'Writing Studio', view: 'writing', section: 'workspace', path: '/dashboard/writing', featureKey: 'writing' },
  { icon: FileText, label: 'Story Bible', view: 'story-bible', section: 'workspace', path: '/dashboard/bible', featureKey: 'story-bible' },
  { icon: Layout, label: 'Plot Board', view: 'plot-board', section: 'workspace', path: '/dashboard/plot', featureKey: 'plot-board' },

  { icon: FileEdit, label: 'Revision', view: 'revision', section: 'publishing', path: '/dashboard/revision', featureKey: 'revision' },
  { icon: Languages, label: 'Translation', view: 'translation', section: 'publishing', path: '/dashboard/translation', featureKey: 'translation' },
  { icon: Download, label: 'Publishing', view: 'publishing', section: 'publishing', path: '/dashboard/publishing', featureKey: 'publishing' },
  { icon: Megaphone, label: 'Marketing Kit', view: 'marketing', section: 'publishing', path: '/dashboard/marketing', featureKey: 'marketing' },

  { icon: Layers, label: 'Templates', view: 'templates', section: 'resources', path: '/dashboard/templates', featureKey: 'templates' },
  { icon: Sparkles, label: 'AI Co-Writer', view: 'ai-cowriter', section: 'resources', path: '/dashboard/ai', featureKey: 'ai-cowriter' },

  { icon: Settings, label: 'Settings', view: 'settings', section: 'account', path: '/dashboard/settings', featureKey: 'settings' },
  { icon: Shield, label: 'Admin Console', view: 'settings', section: 'account', path: '/admin', adminOnly: true },
];

const MORE_ITEMS: NavItemDef[] = [
  { icon: FileEdit, label: 'Revision', view: 'revision', section: 'more', path: '/dashboard/revision', featureKey: 'revision' },
  { icon: Languages, label: 'Translation', view: 'translation', section: 'more', path: '/dashboard/translation', featureKey: 'translation' },
  { icon: Download, label: 'Publishing', view: 'publishing', section: 'more', path: '/dashboard/publishing', featureKey: 'publishing' },
  { icon: Layers, label: 'Templates', view: 'templates', section: 'more', path: '/dashboard/templates', featureKey: 'templates' },
  { icon: Sparkles, label: 'AI Co-Writer', view: 'ai-cowriter', section: 'more', path: '/dashboard/ai', featureKey: 'ai-cowriter' },
  { icon: Megaphone, label: 'Marketing Kit', view: 'marketing', section: 'more', path: '/dashboard/marketing', featureKey: 'marketing' },
  { icon: Languages, label: 'Affiliate', view: 'settings', section: 'more', path: '/dashboard/affiliate', featureKey: 'affiliate' },
];

const sectionLabels: Record<string, string> = {
  workspace: 'Workspace',
  publishing: 'Publishing',
  resources: 'Resources',
  account: 'Account',
  more: 'More Tools',
};

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme } = useTheme();
  const {
    currentView, setCurrentView, sidebarOpen, setSidebarOpen,
    selectedProject, setSelectedProject, projects, lastActiveProjectId,
  } = useNovelifyStore();

  const userStage = useMemo<UserStage>(() => {
    return getStageFromProjects(projects, false);
  }, [projects]);

  const isFirstProjectCreated = userStage !== 'NEW_USER';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleNavigate = (item: NavItemDef) => {
    setCurrentView(item.view);

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

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const getVisibleItems = () => {
    if (!isFirstProjectCreated) {
      return {
        visible: ALL_NAV_ITEMS.filter(item =>
          item.section === 'workspace' || item.section === 'account'
        ).filter(item =>
          item.featureKey === 'my-novels' || item.featureKey === 'dashboard' || item.featureKey === 'settings' || item.adminOnly
        ),
        moreVisible: [],
      };
    }

    const visible: NavItemDef[] = [];
    const moreVisible: NavItemDef[] = [];

    for (const item of ALL_NAV_ITEMS) {
      if (item.adminOnly && !isAdmin) continue;
      if (item.featureKey && shouldShowFeature(item.featureKey, userStage)) {
        if (item.section === 'workspace' || item.section === 'account') {
          visible.push(item);
        } else {
          visible.push({ ...item, section: 'publishing' });
        }
      } else if (item.featureKey && !shouldShowFeature(item.featureKey, userStage)) {
        moreVisible.push(item);
      }
    }

    return { visible, moreVisible };
  };

  const { visible: visibleItems, moreVisible } = getVisibleItems();

  const sections = useMemo(() => {
    const sectionOrder = ['workspace', 'publishing', 'resources', 'account'];
    const grouped: Record<string, NavItemDef[]> = {};
    sectionOrder.forEach(s => { grouped[s] = []; });
    visibleItems.forEach(item => {
      if (grouped[item.section]) grouped[item.section].push(item);
    });
    if (moreVisible.length > 0) {
      grouped['more'] = moreVisible;
    }
    return Object.entries(grouped).filter(([, items]) => items.length > 0);
  }, [visibleItems, moreVisible]);

  return (
    <>
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
          <Image src="/images/Novelify_logo_web.png" alt="Novelify" width={sidebarOpen ? 120 : 30} height={30} style={{ objectFit: 'contain', flexShrink: 0, borderRadius: sidebarOpen ? 0 : 6 }} />
        </a>

        {sidebarOpen && (
          <div style={{ padding: '0 14px', marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#636366', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {STAGE_LABELS[userStage]}
            </div>
          </div>
        )}

        {sections.map(([section, items]) => (
          <div key={section}>
            {sidebarOpen && (
              <div style={{ fontSize: 9, fontWeight: 600, color: '#636366', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 14px', margin: '8px 0 4px' }}>
                {sectionLabels[section] || section}
              </div>
            )}
            <nav style={{ padding: '0 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {items.map(item => renderNavItem(item, sidebarOpen))}
            </nav>
          </div>
        ))}

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

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px', marginBottom: 4 }}>
            <ThemeToggle />
            {sidebarOpen && (
              <span style={{ fontSize: 10, color: '#636366', marginLeft: 4 }}>
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            )}
          </div>

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
