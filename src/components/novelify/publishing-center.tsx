'use client';

import {
  BookOpen, FileText, Layout, Sparkles, Target, FileEdit, Languages,
  Download, Image as ImageIcon, Layers, BookMarked, Megaphone,
  Plus, Search, Clock, PenTool, Globe,
  Lightbulb, Quote, Wand2, Award, Star, Users, Map,
  CheckCircle2, AlignLeft, Save, Upload, Trash2, X, Loader2,
  ChevronDown, ChevronRight, Check, ToggleLeft, ToggleRight,
  Circle, AlertCircle, UploadCloud, File, RefreshCw,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  colors, MetricCard, SectionHeader, StatusBadge,
  EmptyState, Card, FadeIn, GlassButton, PageHeader,
} from './dashboard-components';

// ─── Types ───
type PubTab = 'metadata' | 'frontmatter' | 'backmatter' | 'cover' | 'synopsis' | 'export' | 'checklist';

interface PublishingMetadata {
  bookTitle: string;
  subtitle: string;
  series: string;
  seriesNumber: string;
  authorName: string;
  publisher: string;
  language: string;
  genre: string;
  subgenre: string;
  keywords: string;
  targetAudience: string;
  ageRange: string;
  isbn: string;
  copyrightYear: string;
  copyrightHolder: string;
  shortDescription: string;
  longDescription: string;
  logline: string;
  tagline: string;
  blurb: string;
  amazonDescription: string;
  goodreadsDescription: string;
  authorBio: string;
  authorWebsite: string;
}

interface FrontMatterItem {
  key: string;
  label: string;
  enabled: boolean;
  content: string;
}

interface BackMatterItem {
  key: string;
  label: string;
  enabled: boolean;
  content: string;
}

interface ExportItem {
  id: string;
  format: string;
  status: string;
  createdAt: string;
  fileSize: number;
  fileUrl: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

// ─── Constants ───
const TABS: { key: PubTab; label: string; icon: React.ElementType }[] = [
  { key: 'metadata', label: 'Metadata', icon: FileText },
  { key: 'frontmatter', label: 'Front Matter', icon: BookMarked },
  { key: 'backmatter', label: 'Back Matter', icon: Layers },
  { key: 'cover', label: 'Cover', icon: ImageIcon },
  { key: 'synopsis', label: 'Synopsis & Blurb', icon: AlignLeft },
  { key: 'export', label: 'Export', icon: Download },
  { key: 'checklist', label: 'Checklist', icon: CheckCircle2 },
];

const FRONT_MATTER_DEFAULTS: FrontMatterItem[] = [
  { key: 'titlePage', label: 'Include Title Page', enabled: true, content: '' },
  { key: 'copyrightPage', label: 'Copyright Page', enabled: true, content: 'Copyright © {year} {author}. All rights reserved.' },
  { key: 'dedication', label: 'Dedication', enabled: false, content: '' },
  { key: 'epigraph', label: 'Epigraph', enabled: false, content: '' },
  { key: 'foreword', label: 'Foreword', enabled: false, content: '' },
  { key: 'preface', label: 'Preface', enabled: false, content: '' },
  { key: 'acknowledgments', label: 'Acknowledgments', enabled: false, content: '' },
  { key: 'toc', label: 'Table of Contents', enabled: true, content: '' },
  { key: 'alsoBy', label: 'Also By', enabled: false, content: '' },
];

const BACK_MATTER_DEFAULTS: BackMatterItem[] = [
  { key: 'aboutAuthor', label: 'About Author', enabled: true, content: '' },
  { key: 'authorWebsite', label: 'Author Website', enabled: false, content: '' },
  { key: 'reviewRequest', label: 'Review Request', enabled: true, content: 'If you enjoyed this book, please consider leaving a review.' },
  { key: 'newsletterSignup', label: 'Newsletter Signup', enabled: false, content: '' },
  { key: 'thankYou', label: 'Thank You', enabled: true, content: 'Thank you for reading!' },
  { key: 'nextBookTeaser', label: 'Next Book Teaser', enabled: false, content: '' },
  { key: 'alsoByBack', label: 'Also By', enabled: false, content: '' },
];

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'metadata', label: 'Metadata Complete', description: 'Fill in book title, author name, genre, and description', completed: false },
  { id: 'cover', label: 'Cover Ready', description: 'Upload a cover image for your book', completed: false },
  { id: 'synopsis', label: 'Synopsis Ready', description: 'Write a compelling synopsis', completed: false },
  { id: 'blurb', label: 'Blurb Ready', description: 'Write your book blurb', completed: false },
  { id: 'frontmatter', label: 'Front Matter Ready', description: 'Configure title page, copyright, dedication, and more', completed: false },
  { id: 'backmatter', label: 'Back Matter Ready', description: 'Configure about author, acknowledgments, and more', completed: false },
  { id: 'manuscript', label: 'Manuscript Ready', description: 'Complete at least one chapter with content', completed: false },
  { id: 'revision', label: 'Revision Ready', description: 'Review your manuscript for final polish', completed: false },
  { id: 'export', label: 'Export Ready', description: 'Complete all readiness items above', completed: false },
];

const EXPORT_FORMATS = [
  { value: 'epub', label: 'EPUB' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'DOCX' },
  { value: 'markdown', label: 'Markdown' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'other', label: 'Other' },
];

const GENRE_OPTIONS = [
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'science-fiction', label: 'Science Fiction' },
  { value: 'romance', label: 'Romance' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'horror', label: 'Horror' },
  { value: 'literary-fiction', label: 'Literary Fiction' },
  { value: 'historical-fiction', label: 'Historical Fiction' },
  { value: 'young-adult', label: 'Young Adult' },
  { value: 'new-adult', label: 'New Adult' },
  { value: 'children', label: "Children's" },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'memoir', label: 'Memoir' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'other', label: 'Other' },
];

const SUBGENRE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  fantasy: [
    { value: 'epic-fantasy', label: 'Epic Fantasy' },
    { value: 'urban-fantasy', label: 'Urban Fantasy' },
    { value: 'dark-fantasy', label: 'Dark Fantasy' },
    { value: 'romantasy', label: 'Romantasy' },
    { value: 'cozy-fantasy', label: 'Cozy Fantasy' },
    { value: 'portal-fantasy', label: 'Portal Fantasy' },
    { value: 'sword-and-sorcery', label: 'Sword & Sorcery' },
    { value: 'grimdark', label: 'Grimdark' },
    { value: 'high-fantasy', label: 'High Fantasy' },
    { value: 'low-fantasy', label: 'Low Fantasy' },
  ],
  'science-fiction': [
    { value: 'hard-sci-fi', label: 'Hard Sci-Fi' },
    { value: 'space-opera', label: 'Space Opera' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'dystopian', label: 'Dystopian' },
    { value: 'post-apocalyptic', label: 'Post-Apocalyptic' },
    { value: 'time-travel', label: 'Time Travel' },
    { value: 'military-sci-fi', label: 'Military Sci-Fi' },
    { value: 'biopunk', label: 'Biopunk' },
    { value: 'solarpunk', label: 'Solarpunk' },
    { value: 'steampunk', label: 'Steampunk' },
  ],
  romance: [
    { value: 'contemporary-romance', label: 'Contemporary Romance' },
    { value: 'historical-romance', label: 'Historical Romance' },
    { value: 'paranormal-romance', label: 'Paranormal Romance' },
    { value: 'erotic-romance', label: 'Erotic Romance' },
    { value: 'clean-romance', label: 'Clean Romance' },
    { value: 'christian-romance', label: 'Christian Romance' },
    { value: 'romantic-suspense', label: 'Romantic Suspense' },
    { value: 'lgbtq-romance', label: 'LGBTQ+ Romance' },
  ],
  mystery: [
    { value: 'cozy-mystery', label: 'Cozy Mystery' },
    { value: 'hardboiled', label: 'Hardboiled' },
    { value: 'police-procedural', label: 'Police Procedural' },
    { value: 'amateur-sleuth', label: 'Amateur Sleuth' },
    { value: 'noir', label: 'Noir' },
    { value: 'locked-room', label: 'Locked Room' },
  ],
  thriller: [
    { value: 'psychological-thriller', label: 'Psychological Thriller' },
    { value: 'political-thriller', label: 'Political Thriller' },
    { value: 'legal-thriller', label: 'Legal Thriller' },
    { value: 'techno-thriller', label: 'Techno-Thriller' },
    { value: 'medical-thriller', label: 'Medical Thriller' },
    { value: 'spy-thriller', label: 'Spy Thriller' },
    { value: 'domestic-thriller', label: 'Domestic Thriller' },
  ],
  horror: [
    { value: 'cosmic-horror', label: 'Cosmic Horror' },
    { value: 'gothic-horror', label: 'Gothic Horror' },
    { value: 'psychological-horror', label: 'Psychological Horror' },
    { value: 'body-horror', label: 'Body Horror' },
    { value: 'supernatural-horror', label: 'Supernatural Horror' },
    { value: 'slasher', label: 'Slasher' },
  ],
  'literary-fiction': [
    { value: 'magical-realism', label: 'Magical Realism' },
    { value: 'historical-literary', label: 'Historical Literary' },
    { value: 'coming-of-age', label: 'Coming of Age' },
    { value: 'satire', label: 'Satire' },
    { value: 'epistolary', label: 'Epistolary' },
    { value: 'experimental', label: 'Experimental' },
  ],
  'historical-fiction': [
    { value: 'ancient-history', label: 'Ancient History' },
    { value: 'medieval', label: 'Medieval' },
    { value: 'renaissance', label: 'Renaissance' },
    { value: 'victorian', label: 'Victorian' },
    { value: 'wwi-wwii', label: 'World War I & II' },
    { value: 'american-west', label: 'American West' },
  ],
  'young-adult': [
    { value: 'ya-fantasy', label: 'YA Fantasy' },
    { value: 'ya-dystopian', label: 'YA Dystopian' },
    { value: 'ya-contemporary', label: 'YA Contemporary' },
    { value: 'ya-romance', label: 'YA Romance' },
    { value: 'ya-thriller', label: 'YA Thriller' },
    { value: 'ya-sci-fi', label: 'YA Sci-Fi' },
  ],
  'new-adult': [
    { value: 'na-contemporary', label: 'NA Contemporary' },
    { value: 'na-romance', label: 'NA Romance' },
    { value: 'na-fantasy', label: 'NA Fantasy' },
    { value: 'na-urban-fantasy', label: 'NA Urban Fantasy' },
  ],
};

const TARGET_AUDIENCES = [
  { value: 'children', label: 'Children (0-12)' },
  { value: 'young-adult', label: 'Young Adult (13-18)' },
  { value: 'new-adult', label: 'New Adult (18-25)' },
  { value: 'adult', label: 'Adult (25+)' },
  { value: 'all-ages', label: 'All Ages' },
];

// ─── Sub Components ───

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#aeaeb2', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline, rows = 2, type, style: extStyle, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  multiline?: boolean; rows?: number; type?: string; style?: React.CSSProperties; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: disabled ? '#111' : '#161616', border: `1px solid ${colors.border}`,
    color: disabled ? '#636366' : '#F5F5F7', fontSize: 12, padding: multiline ? '10px 12px' : '8px 12px',
    borderRadius: 10, outline: 'none', transition: 'border-color .2s',
    fontFamily: 'inherit', resize: multiline ? 'vertical' : 'none', ...extStyle, cursor: disabled ? 'not-allowed' : 'auto',
  };
  if (multiline) {
    return (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        rows={rows} style={base} disabled={disabled}
        onFocus={(e) => !disabled && (e.currentTarget.style.borderColor = colors.goldBorder)}
        onBlur={(e) => !disabled && (e.currentTarget.style.borderColor = colors.border)}
      />
    );
  }
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      type={type || 'text'} style={base} disabled={disabled}
      onFocus={(e) => !disabled && (e.currentTarget.style.borderColor = colors.goldBorder)}
      onBlur={(e) => !disabled && (e.currentTarget.style.borderColor = colors.border)}
    />
  );
}

function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[]; placeholder?: string;
}) {
  const opts = Array.isArray(options) ? (typeof options[0] === 'string' ? (options as string[]).map(o => ({ value: o, label: o.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) })) : options as { value: string; label: string }[]) : [];
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', background: '#161616', border: `1px solid ${colors.border}`,
        color: value ? '#F5F5F7' : '#636366', fontSize: 12, padding: '8px 12px',
        borderRadius: 10, outline: 'none', cursor: 'pointer', appearance: 'none',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = colors.goldBorder}
      onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SaveIndicator({ status }: { status: 'saved' | 'saving' | 'unsaved' | 'idle' }) {
  const colors_s = {
    saved: { color: '#34D399', label: 'Saved' },
    saving: { color: '#C9A96E', label: 'Saving...' },
    unsaved: { color: '#F87171', label: 'Unsaved changes' },
    idle: { color: '#636366', label: '' },
  };
  const s = colors_s[status];
  if (status === 'idle') return null;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: s.color, fontWeight: 500 }}>
      <Save style={{ width: 11, height: 11 }} />
      {s.label}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px',
        borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer',
        border: `1px solid ${enabled ? colors.goldBorder : colors.border}`,
        background: enabled ? 'rgba(201,169,110,0.10)' : '#161616',
        color: enabled ? colors.gold : '#636366', transition: 'all .15s',
      }}
    >
      {enabled ? <ToggleRight style={{ width: 14, height: 14 }} /> : <ToggleLeft style={{ width: 14, height: 14 }} />}
      {enabled ? 'On' : 'Off'}
    </button>
  );
}

function Skeleton({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div style={{
      width, height, borderRadius: 6,
      background: 'linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      marginBottom: 8,
    }} />
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: 24 }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <Skeleton width={120} height={10} />
          <Skeleton height={36} />
        </div>
      ))}
    </div>
  );
}

function CircularProgress({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;
  let color = '#F87171';
  if (score >= 7) color = '#34D399';
  else if (score >= 4) color = '#C9A96E';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
        />
        <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
          fill="#F5F5F7" fontSize="22" fontWeight="700" fontFamily="'Playfair Display',serif"
        >
          {score}/{maxScore}
        </text>
      </svg>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>
          Readiness Score
        </div>
        <div style={{ fontSize: 11, color: color, fontWeight: 500, marginTop: 2 }}>
          {score >= 7 ? 'Ready to Publish!' : score >= 4 ? 'Getting There' : 'Needs Work'}
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        padding: '12px 20px', borderRadius: 12,
        background: type === 'error' ? '#3D1A1A' : '#1A3D1A',
        border: `1px solid ${type === 'error' ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)'}`,
        color: type === 'error' ? '#F87171' : '#34D399',
        fontSize: 12, fontWeight: 500,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {type === 'error' ? <AlertCircle style={{ width: 14, height: 14 }} /> : <Check style={{ width: 14, height: 14 }} />}
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 8, padding: 0, display: 'flex' }}>
        <X style={{ width: 12, height: 12 }} />
      </button>
    </motion.div>
  );
}

function Divider() {
  return (
    <div style={{ height: 1, background: colors.border, margin: '16px 0' }} />
  );
}

function CharacterCount({ text, max }: { text: string; max: number }) {
  const count = text.length;
  const pct = count / max;
  const color = pct > 0.9 ? '#F87171' : pct > 0.7 ? '#C9A96E' : '#636366';
  return (
    <div style={{ fontSize: 9, color, textAlign: 'right', marginTop: 4 }}>
      {count.toLocaleString()} / {max.toLocaleString()} chars
    </div>
  );
}

function FieldHint({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 9, color: '#636366', marginTop: 3, fontStyle: 'italic' }}>
      {text}
    </div>
  );
}

function Badge({ label, color = colors.gold }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 6,
      fontSize: 9, fontWeight: 600, letterSpacing: '0.04em',
      background: `${color}15`, color,
      border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  );
}

function FormatBadge({ format }: { format: string }) {
  const colors_f: Record<string, string> = {
    epub: '#A78BFA',
    pdf: '#F87171',
    docx: '#60A5FA',
    markdown: '#34D399',
  };
  return (
    <Badge label={format.toUpperCase()} color={colors_f[format] || colors.gold} />
  );
}

function LoadingCard({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <div style={{ padding: 24 }}>
        <Skeleton width={160} height={14} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ marginTop: 16 }}>
            <Skeleton width={100} height={10} />
            <Skeleton height={34} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Component ───
export function PublishingCenterPage() {
  const router = useRouter();
  const { selectedProject, setSelectedProject, projects } = useNovelifyStore();

  const [tab, setTab] = useState<PubTab>('metadata');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'unsaved'>('idle');

  // Metadata state
  const [metadata, setMetadata] = useState<PublishingMetadata>({
    bookTitle: '', subtitle: '', series: '', seriesNumber: '', authorName: '',
    publisher: '', language: 'en', genre: '', subgenre: '', keywords: '',
    targetAudience: '', ageRange: '', isbn: '', copyrightYear: '',
    copyrightHolder: '', shortDescription: '', longDescription: '', logline: '',
    tagline: '', blurb: '', amazonDescription: '', goodreadsDescription: '',
    authorBio: '', authorWebsite: '',
  });

  // Front matter state
  const [frontMatter, setFrontMatter] = useState<FrontMatterItem[]>([]);

  // Back matter state
  const [backMatter, setBackMatter] = useState<BackMatterItem[]>([]);

  // Cover state
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverDragOver, setCoverDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synopsis state
  const [synopsis, setSynopsis] = useState('');
  const [blurb, setBlurb] = useState('');
  const [aiGenModal, setAiGenModal] = useState<{ field: string; open: boolean }>({ field: '', open: false });
  const [aiGenType, setAiGenType] = useState('blurb');
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenResult, setAiGenResult] = useState('');

  // Export state
  const [exportFormat, setExportFormat] = useState('epub');
  const [exportIncludeScenes, setExportIncludeScenes] = useState(true);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ fileUrl: string; format: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportItem[]>([]);

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_ITEMS.map(i => ({ ...i })));

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const projectId = selectedProject?.id;

  const CHECKLIST_FIELD_MAP: Record<string, string> = {
    metadata: 'metadataComplete',
    cover: 'coverReady',
    synopsis: 'synopsisReady',
    blurb: 'blurbReady',
    frontmatter: 'frontMatterReady',
    backmatter: 'backMatterReady',
    manuscript: 'manuscriptReady',
    revision: 'revisionReady',
    export: 'exportReady',
  };

  // ─── API Helpers ───
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // ─── Load data on mount ───
  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);

    Promise.all([
      fetch(`/api/publishing/metadata?projectId=${projectId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/publishing/checklist?projectId=${projectId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/publishing/export?projectId=${projectId}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/projects/${projectId}`).then(r => r.ok ? r.json() : null),
    ]).then(([metaData, checklistData, exportsData, projectData]) => {
      if (metaData) {
        setMetadata({ ...metaData });
        setSaveStatus('saved');
      }
      if (checklistData) {
        const raw = checklistData as Record<string, any>;
        setChecklist(CHECKLIST_ITEMS.map(item => {
          const mapKey = CHECKLIST_FIELD_MAP[item.id] || item.id + 'Complete';
          return { ...item, completed: raw[mapKey] === true };
        }));
      }
      if (Array.isArray(exportsData)) {
        setExportHistory(exportsData.slice(0, 10));
      }
      if (projectData) {
        setCoverImageUrl(projectData.coverImage || null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      showToast('Failed to load publishing data', 'error');
    });
  }, [projectId, showToast]);

  // Load front matter
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/publishing/front-matter?projectId=${projectId}`).then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setFrontMatter(data);
        } else {
          setFrontMatter(FRONT_MATTER_DEFAULTS.map(i => ({ ...i })));
        }
      })
      .catch(() => setFrontMatter(FRONT_MATTER_DEFAULTS.map(i => ({ ...i }))));
  }, [projectId]);

  // Load back matter
  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/publishing/back-matter?projectId=${projectId}`).then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setBackMatter(data);
        } else {
          setBackMatter(BACK_MATTER_DEFAULTS.map(i => ({ ...i })));
        }
      })
      .catch(() => setBackMatter(BACK_MATTER_DEFAULTS.map(i => ({ ...i }))));
  }, [projectId]);

  // ─── Auto-save with debounce ───
  const autoSaveMetadata = useCallback(async (data: PublishingMetadata) => {
    if (!projectId) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/publishing/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (res.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('unsaved');
        showToast('Failed to save metadata', 'error');
      }
    } catch {
      setSaveStatus('unsaved');
      showToast('Failed to save metadata', 'error');
    }
  }, [projectId, showToast]);

  const debouncedSave = useCallback((data: PublishingMetadata) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus('unsaved');
    debounceRef.current = setTimeout(() => {
      autoSaveMetadata(data);
    }, 300);
  }, [autoSaveMetadata]);

  const updateMetadataField = (field: keyof PublishingMetadata, value: string) => {
    setMetadata(prev => {
      const updated = { ...prev, [field]: value };
      debouncedSave(updated);
      return updated;
    });
  };

  // ─── Front Matter Auto-save ───
  const autoSaveFrontMatter = useCallback(async (items: FrontMatterItem[]) => {
    if (!projectId) return;
    try {
      await fetch('/api/publishing/front-matter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, items }),
      });
    } catch {
      showToast('Failed to save front matter', 'error');
    }
  }, [projectId, showToast]);

  const updateFrontMatter = useCallback((index: number, field: 'enabled' | 'content', value: boolean | string) => {
    setFrontMatter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!projectId || frontMatter.length === 0) return;
    const timer = setTimeout(() => {
      autoSaveFrontMatter(frontMatter);
    }, 300);
    return () => clearTimeout(timer);
  }, [frontMatter, projectId, autoSaveFrontMatter]);

  // ─── Back Matter Auto-save ───
  const autoSaveBackMatter = useCallback(async (items: BackMatterItem[]) => {
    if (!projectId) return;
    try {
      await fetch('/api/publishing/back-matter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, items }),
      });
    } catch {
      showToast('Failed to save back matter', 'error');
    }
  }, [projectId, showToast]);

  const updateBackMatter = useCallback((index: number, field: 'enabled' | 'content', value: boolean | string) => {
    setBackMatter(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!projectId || backMatter.length === 0) return;
    const timer = setTimeout(() => {
      autoSaveBackMatter(backMatter);
    }, 300);
    return () => clearTimeout(timer);
  }, [backMatter, projectId, autoSaveBackMatter]);

  // ─── Cover handlers ───
  const handleCoverUpload = useCallback(async (file: File) => {
    if (!projectId) return;
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      const res = await fetch('/api/upload/cover', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setCoverImageUrl(data.url || data.coverImageUrl);
        showToast('Cover uploaded successfully', 'success');
      } else {
        showToast('Failed to upload cover', 'error');
      }
    } catch {
      showToast('Failed to upload cover', 'error');
    } finally {
      setCoverUploading(false);
    }
  }, [projectId, showToast]);

  const handleCoverRemove = useCallback(async () => {
    if (!projectId) return;
    try {
      await fetch(`/api/projects/${projectId}/cover`, { method: 'DELETE' });
      setCoverImageUrl(null);
      showToast('Cover removed', 'success');
    } catch {
      showToast('Failed to remove cover', 'error');
    }
  }, [projectId, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleCoverUpload(file);
    }
  }, [handleCoverUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  // ─── AI Generation ───
  const handleAiGenerate = useCallback(async () => {
    if (!projectId) return;
    setAiGenLoading(true);
    setAiGenResult('');
    try {
      const res = await fetch('/api/publishing/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, type: aiGenType, context: metadata.longDescription || synopsis }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiGenResult(data.text || data.content || '');
      } else {
        setAiGenResult('Failed to generate. Please try again.');
      }
    } catch {
      setAiGenResult('Failed to generate. Please try again.');
    } finally {
      setAiGenLoading(false);
    }
  }, [projectId, aiGenType, metadata.longDescription, synopsis]);

  const applyAiResult = useCallback((field: string) => {
    if (!aiGenResult) return;
    if (field === 'synopsis') setSynopsis(aiGenResult);
    else if (field === 'blurb') setBlurb(aiGenResult);
    else if (field === 'amazonDescription') updateMetadataField('amazonDescription', aiGenResult);
    else if (field === 'tagline') updateMetadataField('tagline', aiGenResult);
    else if (field === 'logline') updateMetadataField('logline', aiGenResult);
    setAiGenModal({ field: '', open: false });
    setAiGenResult('');
    showToast('Generated content applied', 'success');
  }, [aiGenResult, updateMetadataField, showToast]);

  // ─── Export handlers ───
  // ─── Synopsis/Blurb Auto-save ───
  const autoSaveSynopsisBlurb = useCallback(async (s: string, b: string) => {
    if (!projectId) return;
    try {
      await fetch('/api/publishing/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, synopsis: s, blurb: b }),
      });
    } catch {
      showToast('Failed to save synopsis/blurb', 'error');
    }
  }, [projectId, showToast]);

  const synopsisDebounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!projectId) return;
    if (synopsisDebounceRef.current) clearTimeout(synopsisDebounceRef.current);
    synopsisDebounceRef.current = setTimeout(() => {
      autoSaveSynopsisBlurb(synopsis, blurb);
    }, 500);
    return () => {
      if (synopsisDebounceRef.current) clearTimeout(synopsisDebounceRef.current);
    };
  }, [synopsis, blurb, projectId, autoSaveSynopsisBlurb]);

  const handleExport = useCallback(async () => {
    if (!projectId) return;
    setExportProgress('Preparing your export...');
    setExportResult(null);
    setExportError(null);
    try {
      const res = await fetch('/api/publishing/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, format: exportFormat, includeScenes: exportIncludeScenes }),
      });
      if (res.ok) {
        const data = await res.json();
        setExportResult(data);
        setExportProgress('Export complete!');
        setTimeout(() => setExportProgress(null), 3000);
        // Refresh history
        const histRes = await fetch(`/api/publishing/export?projectId=${projectId}`);
        if (histRes.ok) {
          const hist = await histRes.json();
          setExportHistory(Array.isArray(hist) ? hist.slice(0, 10) : []);
        }
      } else {
        const err = await res.text();
        setExportError(err || 'Export failed');
        setExportProgress(null);
      }
    } catch {
      setExportError('Export failed. Please try again.');
      setExportProgress(null);
    }
  }, [projectId, exportFormat, exportIncludeScenes]);

  const handleDeleteExport = useCallback(async (id: string) => {
    try {
      await fetch(`/api/publishing/export/${id}`, { method: 'DELETE' });
      setExportHistory(prev => prev.filter(e => e.id !== id));
      showToast('Export deleted', 'success');
    } catch {
      showToast('Failed to delete export', 'error');
    }
  }, [showToast]);

  // ─── Checklist handlers ───
  // Handles toggling individual checklist items and syncing with the server
  const toggleChecklistItem = useCallback(async (id: string) => {
    const item = checklist.find(c => c.id === id);
    if (!item) return;
    const newVal = !item.completed;
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: newVal } : c));
    try {
      const fieldName = CHECKLIST_FIELD_MAP[id];
      await fetch('/api/publishing/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, [fieldName]: newVal }),
      });
    } catch {
      setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !newVal } : c));
      showToast('Failed to update checklist', 'error');
    }
  }, [projectId, checklist, showToast]);

  const checklistScore = useMemo(() => checklist.filter(c => c.completed).length, [checklist]);

  // ─── No project state ───
  if (!selectedProject) {
    return (
      <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px' }}>
        <PageHeader title="Publishing Center" subtitle="Prepare your manuscript for the world" />
        {projects.length === 0 ? (
          <EmptyState icon={BookOpen} title="No projects yet" desc="Create a novel to start preparing for publication" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {projects.map((p) => (
              <Card key={p.id} hover onClick={() => { setSelectedProject(p); router.push(`/dashboard/publishing/${p.id}`); }}>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{p.chapters.length} chapters</div>
                  <div style={{ marginTop: 10 }}><GlassButton small onClick={() => { setSelectedProject(p); router.push(`/dashboard/publishing/${p.id}`); }}>Open Publishing</GlassButton></div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const p = selectedProject;

  return (
    <div style={{ background: colors.darkBg, minHeight: '100vh', padding: '24px 28px 48px', position: 'relative' }}>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <PageHeader title={`Publishing Center: ${p.title}`}
        subtitle="Prepare your manuscript for publication"
      />

      {/* Publishing Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <MetricCard icon={FileText} label="Metadata Fields" value={Object.values(metadata).filter(v => v && v.length > 0).length.toString() + '/24'} color="gold" />
        <MetricCard icon={BookMarked} label="Front Matter" value={frontMatter.filter(f => f.enabled).length + '/9'} sub={`${frontMatter.filter(f => f.enabled && f.content.length > 0).length} with content`} color="amber" />
        <MetricCard icon={Layers} label="Back Matter" value={backMatter.filter(b => b.enabled).length + '/7'} sub={`${backMatter.filter(b => b.enabled && b.content.length > 0).length} with content`} color="teal" />
        <MetricCard icon={CheckCircle2} label="Readiness" value={checklistScore + '/9'} color={checklistScore >= 7 ? 'teal' : checklistScore >= 4 ? 'gold' : 'red'} />
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                border: `1px solid ${isActive ? colors.goldBorder : colors.border}`,
                background: isActive ? 'rgba(201,169,110,0.10)' : '#161616',
                color: isActive ? colors.gold : '#8E8E93',
                transition: 'all .15s',
              }}
            >
              <Icon style={{ width: 12, height: 12 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Content ─── */}
      {tab === 'metadata' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <SectionHeader title="Book Details" />
                <SaveIndicator status={saveStatus} />
              </div>
              {loading ? <LoadingSkeleton /> : (
                <>
                  <FormField label="Book Title">
                    <Input value={metadata.bookTitle} onChange={(v) => updateMetadataField('bookTitle', v)} placeholder="Enter your book title" />
                  </FormField>
                  <FormField label="Subtitle">
                    <Input value={metadata.subtitle} onChange={(v) => updateMetadataField('subtitle', v)} placeholder="Optional subtitle" />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Series">
                      <Input value={metadata.series} onChange={(v) => updateMetadataField('series', v)} placeholder="Series name" />
                    </FormField>
                    <FormField label="Series Number">
                      <Input value={metadata.seriesNumber} onChange={(v) => updateMetadataField('seriesNumber', v)} placeholder="e.g., 1" />
                    </FormField>
                  </div>
                  <FormField label="Author Name">
                    <Input value={metadata.authorName} onChange={(v) => updateMetadataField('authorName', v)} placeholder="Your author name" />
                  </FormField>
                  <FormField label="Publisher">
                    <Input value={metadata.publisher} onChange={(v) => updateMetadataField('publisher', v)} placeholder="Self-published or imprint name" />
                  </FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FormField label="Language">
                      <Select value={metadata.language} onChange={(v) => updateMetadataField('language', v)} options={LANGUAGE_OPTIONS} placeholder="Select language" />
                    </FormField>
                    <FormField label="Genre">
                      <Select value={metadata.genre} onChange={(v) => { updateMetadataField('genre', v); updateMetadataField('subgenre', ''); }} options={GENRE_OPTIONS} placeholder="Select genre" />
                    </FormField>
                  </div>
                  {metadata.genre && SUBGENRE_OPTIONS[metadata.genre] && (
                    <FormField label="Subgenre">
                      <Select value={metadata.subgenre} onChange={(v) => updateMetadataField('subgenre', v)} options={SUBGENRE_OPTIONS[metadata.genre]} placeholder="Select subgenre" />
                    </FormField>
                  )}
                  <FormField label="Keywords">
                    <Input value={metadata.keywords} onChange={(v) => updateMetadataField('keywords', v)} placeholder="Comma-separated keywords" />
                  </FormField>
                  <FieldHint text="Keywords help readers discover your book. Use 5-10 relevant terms." />
                </>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <SectionHeader title="Targeting & Rights" />
              </div>
              {loading ? <LoadingSkeleton /> : (
                <>
                  <FormField label="Target Audience">
                    <Select value={metadata.targetAudience} onChange={(v) => updateMetadataField('targetAudience', v)} options={TARGET_AUDIENCES} placeholder="Select target audience" />
                  </FormField>
                  <FormField label="Age Range">
                    <Select value={metadata.ageRange} onChange={(v) => updateMetadataField('ageRange', v)} options={['0-3', '4-8', '9-12', '13-17', '18-25', '25-40', '40-60', '60+']} placeholder="Select age range" />
                  </FormField>
                  <FieldHint text="Age range helps retailers categorize your book correctly" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                    <FormField label="ISBN">
                      <Input value={metadata.isbn} onChange={(v) => updateMetadataField('isbn', v)} placeholder="ISBN if assigned" />
                    </FormField>
                    <FormField label="Copyright Year">
                      <Input value={metadata.copyrightYear} onChange={(v) => updateMetadataField('copyrightYear', v)} placeholder={new Date().getFullYear().toString()} />
                    </FormField>
                  </div>
                  <FieldHint text="ISBN can be added later before publication" />
                  <div style={{ marginTop: 14 }}>
                    <FormField label="Copyright Holder">
                      <Input value={metadata.copyrightHolder} onChange={(v) => updateMetadataField('copyrightHolder', v)} placeholder="Copyright holder name" />
                    </FormField>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Descriptions" />
              {loading ? <LoadingCard rows={3} /> : (
                <>
                  <FormField label="Short Description">
                    <Input value={metadata.shortDescription} onChange={(v) => updateMetadataField('shortDescription', v)} placeholder="Brief description (2-3 sentences)" multiline rows={3} />
                  </FormField>
                  <CharacterCount text={metadata.shortDescription} max={500} />
                  <FieldHint text="Used in book listings, search results, and catalogs" />
                  <div style={{ marginTop: 16 }}>
                    <FormField label="Long Description">
                      <Input value={metadata.longDescription} onChange={(v) => updateMetadataField('longDescription', v)} placeholder="Full description with plot highlights" multiline rows={5} />
                    </FormField>
                    <CharacterCount text={metadata.longDescription} max={5000} />
                    <FieldHint text="Appears on retailer product pages and used as AI generation context" />
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Marketing Copy" />
              {loading ? <LoadingCard rows={4} /> : (
                <>
                  <FormField label="Logline">
                    <Input value={metadata.logline} onChange={(v) => updateMetadataField('logline', v)} placeholder="One-sentence summary of your story" multiline rows={2} />
                  </FormField>
                  <CharacterCount text={metadata.logline} max={300} />
                  <div style={{ marginTop: 14 }}>
                    <FormField label="Tagline">
                      <Input value={metadata.tagline} onChange={(v) => updateMetadataField('tagline', v)} placeholder="Memorable hook phrase" />
                    </FormField>
                    <CharacterCount text={metadata.tagline} max={200} />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <FormField label="Blurb">
                      <Input value={metadata.blurb} onChange={(v) => updateMetadataField('blurb', v)} placeholder="Back cover blurb" multiline rows={3} />
                    </FormField>
                    <CharacterCount text={metadata.blurb} max={2000} />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <FormField label="Amazon Description">
                      <Input value={metadata.amazonDescription} onChange={(v) => updateMetadataField('amazonDescription', v)} placeholder="KDP-optimized book description" multiline rows={4} />
                    </FormField>
                    <CharacterCount text={metadata.amazonDescription} max={4000} />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <FormField label="Goodreads Description">
                      <Input value={metadata.goodreadsDescription} onChange={(v) => updateMetadataField('goodreadsDescription', v)} placeholder="Goodreads book description" multiline rows={4} />
                    </FormField>
                    <CharacterCount text={metadata.goodreadsDescription} max={4000} />
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Author Info" />
              {loading ? <LoadingCard rows={2} /> : (
                <>
                  <FormField label="Author Bio">
                    <Input value={metadata.authorBio} onChange={(v) => updateMetadataField('authorBio', v)} placeholder="Short author biography" multiline rows={4} />
                  </FormField>
                  <CharacterCount text={metadata.authorBio} max={2000} />
                  <FieldHint text="Include your writing background, awards, and genre specialties" />
                  <div style={{ marginTop: 14 }}>
                    <FormField label="Author Website">
                      <Input value={metadata.authorWebsite} onChange={(v) => updateMetadataField('authorWebsite', v)} placeholder="https://yoursite.com" />
                    </FormField>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'frontmatter' && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: colors.muted }}>
              <BookMarked style={{ width: 16, height: 16, color: colors.gold, flexShrink: 0 }} />
              Front matter appears at the beginning of your book, before the main content. Toggle sections on or off and customize their content.
            </div>
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {frontMatter.map((item, index) => (
              <Card key={item.key}>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{item.label}</span>
                    <Toggle enabled={item.enabled} onChange={(v) => updateFrontMatter(index, 'enabled', v)} />
                  </div>
                  {item.enabled && (
                    <>
                      <FormField label="Content">
                        <Input value={item.content} onChange={(v) => updateFrontMatter(index, 'content', v)} multiline rows={4} placeholder={`Enter ${item.label.toLowerCase()} content...`} />
                      </FormField>
                      <CharacterCount text={item.content} max={5000} />
                    </>
                  )}
                  {!item.enabled && (
                    <p style={{ fontSize: 10, color: '#636366', fontStyle: 'italic', marginTop: 8 }}>
                      This section will be excluded from your book
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'backmatter' && (
        <div>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: colors.muted }}>
              <Layers style={{ width: 16, height: 16, color: colors.gold, flexShrink: 0 }} />
              Back matter appears at the end of your book, after the main content. Use these sections to engage readers and promote your other work.
            </div>
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {backMatter.map((item, index) => (
              <Card key={item.key}>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{item.label}</span>
                    <Toggle enabled={item.enabled} onChange={(v) => updateBackMatter(index, 'enabled', v)} />
                  </div>
                  {item.enabled && (
                    <>
                      <FormField label="Content">
                        <Input value={item.content} onChange={(v) => updateBackMatter(index, 'content', v)} multiline rows={4} placeholder={`Enter ${item.label.toLowerCase()} content...`} />
                      </FormField>
                      <CharacterCount text={item.content} max={5000} />
                    </>
                  )}
                  {!item.enabled && (
                    <p style={{ fontSize: 10, color: '#636366', fontStyle: 'italic', marginTop: 8 }}>
                      This section will be excluded from your book
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'cover' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Book Cover Image" />
              <div style={{ marginTop: 16 }}>
                {coverImageUrl ? (
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 200, height: 300, borderRadius: 12, overflow: 'hidden',
                      border: `1px solid ${colors.border}`,
                      background: `url(${coverImageUrl}) center/cover`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      flexShrink: 0,
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={handleCoverRemove}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', border: `1px solid rgba(248,113,113,0.2)`,
                          background: 'rgba(248,113,113,0.08)', color: '#F87171',
                        }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                        Remove Cover
                      </button>
                      <label style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        cursor: 'pointer', border: `1px solid ${colors.goldBorder}`,
                        background: 'rgba(201,169,110,0.08)', color: colors.gold,
                      }}>
                        <Upload style={{ width: 13, height: 13 }} />
                        Replace Cover
                        <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                      </label>
                      <Divider />
                      <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.5 }}>
                        <strong style={{ color: '#aeaeb2' }}>Current cover</strong><br />
                        Aspect ratio: 2:3 (recommended)<br />
                        Format: JPG, PNG, or WebP
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setCoverDragOver(true); }}
                    onDragLeave={() => setCoverDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${coverDragOver ? colors.gold : colors.border}`,
                      borderRadius: 16, padding: '48px 24px', textAlign: 'center',
                      cursor: 'pointer', transition: 'border-color .2s, background .2s',
                      background: coverDragOver ? 'rgba(201,169,110,0.05)' : 'transparent',
                    }}
                  >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                    {coverUploading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <Loader2 style={{ width: 32, height: 32, color: colors.gold, animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: 12, color: colors.muted }}>Uploading cover...</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <UploadCloud style={{ width: 40, height: 40, color: colors.muted }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>Drop your cover image here</span>
                        <span style={{ fontSize: 11, color: colors.muted }}>or click to browse · PNG, JPG, WebP</span>
                        <span style={{ fontSize: 9, color: '#636366' }}>Recommended: 1600 x 2400 px, min 1400 px wide</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Cover Specifications" />
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#161616', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Amazon KDP</div>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.6 }}>
                    Min 1000 px on longest side · 300 DPI · RGB color<br />
                    Formats: JPG, TIFF, PNG<br />
                    Preferred: 1600 x 2400 pixels
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#161616', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>Apple Books</div>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.6 }}>
                    1400 x 2100 px minimum · 72+ DPI<br />
                    Formats: JPG, PNG<br />
                    Preferred: 2400 x 3600 pixels
                  </div>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#161616', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7', marginBottom: 4 }}>IngramSpark</div>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.6 }}>
                    300 DPI · CMYK preferred · 12.5 mb max<br />
                    Formats: JPG, PDF<br />
                    Preferred: 2550 x 3825 pixels
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === 'synopsis' && (
        <div>
          {/* AI Context Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
            <Card>
              <div style={{ padding: 20 }}>
                <SectionHeader title="AI Generation Context" />
                <p style={{ fontSize: 10, color: colors.muted, marginBottom: 12, lineHeight: 1.5 }}>
                  Provide context about your story to help the AI generate better content. This will be sent alongside each generation request.
                </p>
                <FormField label="Story Context">
                  <Input value={metadata.longDescription || metadata.shortDescription} onChange={() => {}} placeholder="Your book description will be used as context" multiline rows={3} disabled />
                </FormField>
                <FieldHint text="Edit the long description in the Metadata tab to update the AI context" />
              </div>
            </Card>

            <Card>
              <div style={{ padding: 20 }}>
                <SectionHeader title="Writing Tips" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.6, padding: '10px 12px', borderRadius: 8, background: '#161616', border: `1px solid ${colors.border}` }}>
                    <strong style={{ color: colors.gold }}>Synopsis</strong><br />
                    Summarize your entire plot including the ending. Used by agents and publishers.
                  </div>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.6, padding: '10px 12px', borderRadius: 8, background: '#161616', border: `1px solid ${colors.border}` }}>
                    <strong style={{ color: colors.gold }}>Blurb</strong><br />
                    Hook readers with conflict and stakes. Tease, don't spoil. Used on back covers.
                  </div>
                  <div style={{ fontSize: 10, color: colors.muted, lineHeight: 1.6, padding: '10px 12px', borderRadius: 8, background: '#161616', border: `1px solid ${colors.border}` }}>
                    <strong style={{ color: colors.gold }}>Amazon Description</strong><br />
                    Lead with genre and comp titles. Use short paragraphs. End with a call to action.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Card>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SectionHeader title="Synopsis" />
                  <button onClick={() => { setAiGenType('synopsis'); setAiGenModal({ field: 'synopsis', open: true }); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', border: `1px solid ${colors.goldBorder}`,
                      background: 'rgba(201,169,110,0.08)', color: colors.gold,
                    }}
                  >
                    <Sparkles style={{ width: 12, height: 12 }} />
                    Generate with AI
                  </button>
                </div>
                <FormField label="">
                  <Input value={synopsis} onChange={setSynopsis} placeholder="Write your synopsis here..." multiline rows={8} />
                </FormField>
                <CharacterCount text={synopsis} max={5000} />
              </div>
            </Card>

            <Card>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SectionHeader title="Blurb" />
                  <button onClick={() => { setAiGenType('blurb'); setAiGenModal({ field: 'blurb', open: true }); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', border: `1px solid ${colors.goldBorder}`,
                      background: 'rgba(201,169,110,0.08)', color: colors.gold,
                    }}
                  >
                    <Sparkles style={{ width: 12, height: 12 }} />
                    Generate with AI
                  </button>
                </div>
                <FormField label="">
                  <Input value={blurb} onChange={setBlurb} placeholder="Write your blurb here..." multiline rows={5} />
                </FormField>
                <CharacterCount text={blurb} max={2000} />
              </div>
            </Card>

            <Card>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SectionHeader title="Amazon Description" />
                  <button onClick={() => { setAiGenType('amazon'); setAiGenModal({ field: 'amazonDescription', open: true }); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', border: `1px solid ${colors.goldBorder}`,
                      background: 'rgba(201,169,110,0.08)', color: colors.gold,
                    }}
                  >
                    <Sparkles style={{ width: 12, height: 12 }} />
                    Generate with AI
                  </button>
                </div>
                <FormField label="">
                  <Input value={metadata.amazonDescription} onChange={(v) => updateMetadataField('amazonDescription', v)} placeholder="KDP-optimized description" multiline rows={5} />
                </FormField>
                <CharacterCount text={metadata.amazonDescription} max={4000} />
              </div>
            </Card>

            <Card>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SectionHeader title="Tagline" />
                  <button onClick={() => { setAiGenType('tagline'); setAiGenModal({ field: 'tagline', open: true }); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', border: `1px solid ${colors.goldBorder}`,
                      background: 'rgba(201,169,110,0.08)', color: colors.gold,
                    }}
                  >
                    <Sparkles style={{ width: 12, height: 12 }} />
                    Generate with AI
                  </button>
                </div>
                <FormField label="">
                  <Input value={metadata.tagline} onChange={(v) => updateMetadataField('tagline', v)} placeholder="A memorable hook for your book" multiline rows={2} />
                </FormField>
                <CharacterCount text={metadata.tagline} max={200} />
                <FieldHint text="A tagline should be short, memorable, and evocative — think movie poster" />
              </div>
            </Card>

            <Card>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SectionHeader title="Logline" />
                  <button onClick={() => { setAiGenType('logline'); setAiGenModal({ field: 'logline', open: true }); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                      cursor: 'pointer', border: `1px solid ${colors.goldBorder}`,
                      background: 'rgba(201,169,110,0.08)', color: colors.gold,
                    }}
                  >
                    <Sparkles style={{ width: 12, height: 12 }} />
                    Generate with AI
                  </button>
                </div>
                <FormField label="">
                  <Input value={metadata.logline} onChange={(v) => updateMetadataField('logline', v)} placeholder="One-sentence summary of your story" multiline rows={2} />
                </FormField>
                <CharacterCount text={metadata.logline} max={300} />
                <FieldHint text="A logline captures the essence: protagonist, goal, conflict, and stakes" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'export' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Export Your Book" />
              <div style={{ marginTop: 16 }}>
                <FormField label="Format">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {EXPORT_FORMATS.map(f => (
                      <button key={f.value} onClick={() => setExportFormat(f.value)}
                        style={{
                          padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', transition: 'all .15s',
                          border: `1px solid ${exportFormat === f.value ? colors.goldBorder : colors.border}`,
                          background: exportFormat === f.value ? 'rgba(201,169,110,0.10)' : '#161616',
                          color: exportFormat === f.value ? colors.gold : '#8E8E93',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#aeaeb2' }}>
                    <input type="checkbox" checked={exportIncludeScenes} onChange={(e) => setExportIncludeScenes(e.target.checked)}
                      style={{ accentColor: colors.gold }} />
                    Include Scenes structure
                  </label>
                  <FieldHint text="Exports scene headings and structure within each chapter" />
                <FieldHint text="Larger manuscripts may take longer to export" />
                </FormField>
                <Divider />
                <button onClick={handleExport} disabled={exportProgress === 'Preparing your export...'}
                  style={{
                    width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: exportProgress === 'Preparing your export...' ? 'wait' : 'pointer', border: 'none',
                    background: colors.gold, color: '#1a0f00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: exportProgress ? 0.7 : 1,
                    marginTop: 8,
                  }}
                >
                  {exportProgress ? (
                    <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> {exportProgress}</>
                  ) : (
                    <><Download style={{ width: 14, height: 14 }} /> Export</>
                  )}
                </button>
                {exportResult && (
                  <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Check style={{ width: 14, height: 14, color: '#34D399' }} />
                      <span style={{ fontSize: 12, color: '#34D399', fontWeight: 500 }}>Export Complete</span>
                    </div>
                    <a href={exportResult.fileUrl} download
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: colors.gold, color: '#1a0f00', textDecoration: 'none',
                      }}
                    >
                      <Download style={{ width: 13, height: 13 }} />
                      Download {exportResult.format.toUpperCase()}
                    </a>
                  </div>
                )}
                {exportError && (
                  <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle style={{ width: 14, height: 14, color: '#F87171' }} />
                    <span style={{ fontSize: 12, color: '#F87171' }}>{exportError}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Export History" />
              {exportHistory.length === 0 ? (
                <EmptyState icon={Download} title="No exports yet" desc="Your export history will appear here" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {exportHistory.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      background: '#161616', border: `1px solid ${colors.border}`,
                    }}>
                      <File style={{ width: 16, height: 16, color: colors.gold }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#F5F5F7', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusBadge status={item.status} />
                          <span style={{ fontSize: 10, color: colors.muted }}>{item.format.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                          {item.fileSize > 0 ? ` · ${(item.fileSize / 1024).toFixed(1)} KB` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {item.fileUrl && (
                          <a href={item.fileUrl} download
                            style={{
                              padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500,
                              background: 'rgba(201,169,110,0.10)', color: colors.gold,
                              border: `1px solid ${colors.goldBorder}`, cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            <Download style={{ width: 11, height: 11 }} />
                          </a>
                        )}
                        <button onClick={() => handleDeleteExport(item.id)}
                          style={{
                            padding: '6px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500,
                            background: 'rgba(248,113,113,0.08)', color: '#F87171',
                            border: '1px solid rgba(248,113,113,0.15)', cursor: 'pointer',
                          }}
                        >
                          <Trash2 style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'checklist' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Card>
            <div style={{ padding: 24 }}>
              <SectionHeader title="Readiness Checklist" />
              <div style={{ marginTop: 16 }}>
                {checklist.map((item) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 0', borderBottom: `1px solid ${colors.border}`,
                  }}>
                    <button onClick={() => toggleChecklistItem(item.id)}
                      style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all .15s',
                        background: item.completed ? '#34D399' : '#161616',
                        border: `1px solid ${item.completed ? '#34D399' : colors.border}`,
                        color: item.completed ? '#1a0f00' : 'transparent',
                      }}
                    >
                      {item.completed && <Check style={{ width: 12, height: 12 }} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: item.completed ? '#34D399' : '#F5F5F7',
                        textDecoration: item.completed ? 'line-through' : 'none',
                      }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 24 }}>
              <CircularProgress score={checklistScore} maxScore={CHECKLIST_ITEMS.length} />
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#aeaeb2', fontWeight: 500 }}>Overall Progress</span>
                  <span style={{ fontSize: 11, color: colors.gold, fontWeight: 600 }}>{Math.round((checklistScore / CHECKLIST_ITEMS.length) * 100)}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: 'linear-gradient(90deg, #C9A96E, #34D399)',
                    transition: 'width .6s ease',
                    width: `${(checklistScore / CHECKLIST_ITEMS.length) * 100}%`,
                  }} />
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <SectionHeader title="Progress Details" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {checklist.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 11,
                      color: item.completed ? '#34D399' : '#636366',
                      padding: '6px 0',
                    }}>
                      {item.completed ? (
                        <CheckCircle2 style={{ width: 12, height: 12 }} />
                      ) : (
                        <Circle style={{ width: 12, height: 12 }} />
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              {checklistScore === CHECKLIST_ITEMS.length && (
                <div style={{ marginTop: 20, padding: 12, borderRadius: 10, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', textAlign: 'center' }}>
                  <CheckCircle2 style={{ width: 20, height: 20, color: '#34D399', marginBottom: 6 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#34D399' }}>All Ready!</div>
                  <div style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>Your book is ready to publish</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ─── AI Generation Modal ─── */}
      <AnimatePresence>
        {aiGenModal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998 }}
              onClick={() => setAiGenModal({ field: '', open: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 480, maxWidth: '90vw', maxHeight: '80vh',
                background: colors.cardBg, border: `1px solid ${colors.border}`,
                borderRadius: 16, zIndex: 999, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles style={{ width: 14, height: 14, color: colors.gold }} />
                  Generate with AI
                </span>
                <button onClick={() => setAiGenModal({ field: '', open: false })}
                  style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none',
                    background: '#161616', color: '#8E8E93', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
                <FormField label="Type">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['blurb', 'amazon', 'logline', 'tagline', 'synopsis'].map(t => (
                      <button key={t} onClick={() => setAiGenType(t)}
                        style={{
                          padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                          cursor: 'pointer', transition: 'all .15s',
                          border: `1px solid ${aiGenType === t ? colors.goldBorder : colors.border}`,
                          background: aiGenType === t ? 'rgba(201,169,110,0.10)' : '#161616',
                          color: aiGenType === t ? colors.gold : '#8E8E93',
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </FormField>
                <button onClick={handleAiGenerate} disabled={aiGenLoading}
                  style={{
                    width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: aiGenLoading ? 'wait' : 'pointer', border: 'none',
                    background: colors.gold, color: '#1a0f00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: aiGenLoading ? 0.7 : 1, marginTop: 8,
                  }}
                >
                  {aiGenLoading ? (
                    <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Generating...</>
                  ) : (
                    <><Sparkles style={{ width: 14, height: 14 }} /> Generate</>
                  )}
                </button>
                {aiGenResult && (
                  <div style={{ marginTop: 16 }}>
                    <FormField label="Result">
                      <div style={{
                        padding: '10px 12px', borderRadius: 10,
                        background: '#161616', border: `1px solid ${colors.border}`,
                        color: '#F5F5F7', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                        maxHeight: 200, overflowY: 'auto',
                      }}>
                        {aiGenResult}
                      </div>
                    </FormField>
                    <button onClick={() => applyAiResult(aiGenModal.field)}
                      style={{
                        width: '100%', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        cursor: 'pointer', border: 'none',
                        background: colors.gold, color: '#1a0f00',
                      }}
                    >
                      <Check style={{ width: 12, height: 12, display: 'inline', marginRight: 6 }} />
                      Apply to {aiGenModal.field.charAt(0).toUpperCase() + aiGenModal.field.slice(1)}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
