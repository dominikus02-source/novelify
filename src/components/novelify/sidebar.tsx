'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, PenTool, Languages, FileText, Image,
  Download, ChevronLeft, BookOpen, Settings as SettingsIcon,
  LogOut, Target, Star,
} from 'lucide-react';
import { useNovelifyStore, type AppView } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const workspaceItems: { icon: React.ElementType; label: string; view: AppView }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
  { icon: PenTool, label: 'Writing Studio', view: 'writing' },
  { icon: Languages, label: 'Translation', view: 'translate' },
  { icon: FileText, label: 'Synopsis', view: 'synopsis' },
];

const publishItems: { icon: React.ElementType; label: string; view: AppView }[] = [
  { icon: Image, label: 'Cover Art', view: 'cover' },
  { icon: Download, label: 'Export', view: 'export' },
  { icon: Target, label: 'KDP Publish', view: 'export' },
  { icon: SettingsIcon, label: 'Settings', view: 'settings' },
];

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    currentView, setCurrentView,
    sidebarOpen, setSidebarOpen,
    selectedProject, setSelectedProject,
    projects,
  } = useNovelifyStore();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setCurrentView('hero');
    router.refresh();
  };

  const isActive = (view: AppView) => currentView === view;

  const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0);

  const NavItem = ({ item, icon: Icon }: { item: typeof workspaceItems[0]; icon: React.ElementType }) => {
    const active = isActive(item.view);
    const badge = item.view === 'writing' ? totalChapters : null;

    return (
      <button
        onClick={() => setCurrentView(item.view)}
        title={!sidebarOpen ? item.label : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
          borderRadius: 12, cursor: 'pointer', border: 'none', width: '100%',
          fontSize: 13, fontWeight: 500, textAlign: 'left',
          color: active ? '#E8C98A' : '#8E8E93',
          background: active ? 'rgba(201,169,110,0.10)' : 'transparent',
          transition: 'background .15s',
        }}
        onMouseEnter={(e) => {
          if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F5F5F7'; }
        }}
        onMouseLeave={(e) => {
          if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8E8E93'; }
        }}
      >
        <Icon style={{ width: 18, height: 18, flexShrink: 0, opacity: active ? 1 : 0.7 }} />
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
          <span style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.11)', borderRadius: 10,
            padding: '1px 7px', fontSize: 10, fontWeight: 600, color: '#8E8E93',
          }}>{badge}</span>
        )}
      </button>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 228 : 64 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
        display: 'flex', flexDirection: 'column',
        background: '#111111', borderRight: '1px solid rgba(255,255,255,0.07)',
        overflowY: 'auto', overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <a href="#" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: sidebarOpen ? '20px 12px 24px' : '20px 0 24px',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        textDecoration: 'none',
      }}>
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
              style={{
                fontFamily: "'Playfair Display',serif", fontSize: 17,
                fontWeight: 600, color: '#F5F5F7', letterSpacing: '-0.01em',
                overflow: 'hidden', whiteSpace: 'nowrap',
              }}
            >Novelify</motion.span>
          )}
        </AnimatePresence>
      </a>

      {/* Workspace section */}
      {sidebarOpen && <div style={{
        fontSize: 10, fontWeight: 600, color: '#636366',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '0 10px', margin: '4px 0 6px',
      }}>Workspace</div>}

      <nav style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {workspaceItems.map((item) => (
          <NavItem key={item.view} item={item} icon={item.icon} />
        ))}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 12px' }} />

      {/* Publish section */}
      {sidebarOpen && <div style={{
        fontSize: 10, fontWeight: 600, color: '#636366',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        padding: '0 10px', margin: '4px 0 6px',
      }}>Publish</div>}

      <nav style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {publishItems.map((item) => (
          <NavItem key={item.view} item={item} icon={item.icon} />
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* Selected project */}
        <AnimatePresence>
          {sidebarOpen && selectedProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8,
                background: 'rgba(201,169,110,0.08)',
                border: '1px solid rgba(201,169,110,0.15)',
              }}>
                <BookOpen style={{ width: 14, height: 14, flexShrink: 0, color: '#C9A96E' }} />
                <span style={{
                  fontSize: 11, color: '#E8C98A', flex: 1,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{selectedProject.title}</span>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#8E8E93', padding: 0, display: 'flex',
                  }}
                >
                  <ChevronLeft style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title={!sidebarOpen ? 'Sign out' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 12, cursor: 'pointer',
            border: 'none', width: '100%', fontSize: 13, fontWeight: 500,
            color: '#F87171', background: 'transparent',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.10)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >Sign out</motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User card */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: 10, borderRadius: 12, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.07)',
                background: '#161616', marginBottom: 12,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(201,169,110,0.10)',
                border: '1px solid rgba(201,169,110,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: '#C9A96E', flexShrink: 0,
              }}>
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session?.user?.name || 'Dominikus'}
                </div>
                <div style={{
                  fontSize: 10, color: '#C9A96E', background: 'rgba(201,169,110,0.10)',
                  borderRadius: 6, padding: '1px 6px', display: 'inline-block', marginTop: 2,
                }}>Author Plan</div>
              </div>
              <div style={{ color: '#636366', flexShrink: 0 }}>
                <svg fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                  <circle cx="7" cy="3" r="1" fill="currentColor" stroke="none"/>
                  <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/>
                  <circle cx="7" cy="11" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', marginBottom: 12, borderRadius: 12,
            cursor: 'pointer', border: 'none', width: '100%',
            fontSize: 13, fontWeight: 500,
            color: '#636366', background: 'transparent',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8E8E93'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#636366'; }}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft style={{ width: 18, height: 18, flexShrink: 0 }} />
          </motion.div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >Collapse</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
