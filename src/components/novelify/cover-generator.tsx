'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Upload, Trash2, Loader2, CheckCircle2,
  BookOpen, X, FileText, ArrowLeft, Download,
} from 'lucide-react';
import { useNovelifyStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

const KDP_RATIOS = [
  { label: '6×9 (Standard)', ratio: 2 / 3, desc: 'US trade paperback' },
  { label: '5.5×8.5 (Digest)', ratio: 0.647, desc: 'Small novel format' },
  { label: '8.5×11 (Large)', ratio: 0.773, desc: 'Large format / workbook' },
];

export function CoverGenerator() {
  const { selectedProject, setCurrentView } = useNovelifyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState('');
  const [savedCover, setSavedCover] = useState<string | null>(
    selectedProject?.coverImage || null
  );
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const handleFileSelect = useCallback((f: File) => {
    setError('');
    setUploaded(false);

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(f.type)) {
      setError('Please select a PNG, JPG, or WebP file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!file || !selectedProject) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('projectId', selectedProject.id);
      formData.append('file', file);
      const res = await fetch('/api/cover', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json();
      setSavedCover(data.imageUrl);
      setUploaded(true);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedProject) return;
    try {
      const res = await fetch(`/api/cover?projectId=${selectedProject.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedCover(null);
        setShowRemoveConfirm(false);
      }
    } catch {
      setError('Failed to remove cover');
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-full" style={{ background: 'rgba(200,135,58,0.1)' }}>
            <ImageIcon className="size-10" style={{ color: '#C8873A' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#F5F5F7' }}>Select a project first</h2>
          <p className="max-w-sm" style={{ color: '#8E8E93' }}>Choose a project from the dashboard to manage its cover</p>
          <Button onClick={() => setCurrentView('dashboard')}
            className="bg-amber hover:bg-amber/90 text-ink font-semibold shadow-md"
          >Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setCurrentView('project')}
            style={{ color: '#8E8E93', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          ><ArrowLeft className="size-5" /></button>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#F5F5F7' }}>Cover Art</h1>
            <p className="text-sm" style={{ color: '#8E8E93' }}>{selectedProject.title}</p>
          </div>
        </div>

        {/* Current cover */}
        {savedCover && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#111' }}
          >
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4" style={{ color: '#34D399' }} />
                <span className="text-sm font-medium" style={{ color: '#F5F5F7' }}>Current Cover</span>
              </div>
              <button onClick={() => setShowRemoveConfirm(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ color: '#F87171', border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; }}
              ><Trash2 className="size-3" /> Remove</button>
            </div>
            <div className="p-6 flex justify-center">
              <img src={savedCover} alt="Cover"
                className="rounded-lg shadow-lg max-h-96 object-contain"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </motion.div>
        )}

        {/* Upload area */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#111' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#F5F5F7' }}>
              {savedCover ? 'Replace Cover' : 'Upload Cover'}
            </h2>
            <p className="text-xs mt-1" style={{ color: '#8E8E93' }}>
              Design your cover in Canva or any image editor, then upload here. PNG, JPG, or WebP — max 10MB.
            </p>
          </div>

          {!preview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-12 cursor-pointer transition-all"
              style={{ minHeight: 240 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(200,135,58,0.1)' }}>
                <Upload className="size-7" style={{ color: '#C8873A' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#F5F5F7' }}>Drop your cover image here</p>
              <p className="text-xs mt-1" style={{ color: '#8E8E93' }}>or click to browse files</p>
              <div className="flex gap-2 mt-4">
                {KDP_RATIOS.map((r) => (
                  <span key={r.label} className="text-[10px] px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', color: '#636366', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <img src={preview} alt="Preview"
                  className="rounded-lg shadow-lg max-h-80 object-contain"
                  style={{ maxWidth: '100%' }}
                />
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => { setFile(null); setPreview(null); setError(''); }}
                  variant="outline" size="sm"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#8E8E93' }}
                ><X className="size-3.5" /> Cancel</Button>
                <Button onClick={handleUpload} disabled={uploading}
                  size="sm"
                  className="bg-amber hover:bg-amber/90 text-ink font-semibold"
                >
                  {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {uploading ? 'Uploading...' : 'Upload Cover'}
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-6 pb-4"
              >
                <p className="text-xs" style={{ color: '#F87171' }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            style={{ display: 'none' }}
          />
        </motion.div>

        {/* Design tips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-6 rounded-xl p-4" style={{ border: '1px solid rgba(200,135,58,0.15)', background: 'rgba(200,135,58,0.04)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: '#C8873A' }}>KDP Cover Guidelines</p>
          <ul className="text-xs space-y-1.5" style={{ color: '#8E8E93' }}>
            <li>• Use 300 DPI for print — 72 DPI is fine for ebook-only</li>
            <li>• Bleed: add 0.125" (3.2mm) on each side for print books</li>
            <li>• Keep text away from edges (minimum 0.5" / 12mm margin)</li>
            <li>• Spine width depends on page count — use KDP Cover Calculator</li>
            <li>• For best results: design at full wrap (front + spine + back)</li>
          </ul>
        </motion.div>

        {/* Remove confirm dialog */}
        <AnimatePresence>
          {showRemoveConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}
            >
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="rounded-xl p-6 w-full max-w-sm" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <h3 className="text-base font-semibold mb-2" style={{ color: '#F5F5F7' }}>Remove Cover?</h3>
                <p className="text-sm mb-5" style={{ color: '#8E8E93' }}>This will remove the cover image from this project. You can upload a new one anytime.</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowRemoveConfirm(false)}
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#8E8E93' }}
                  >Cancel</Button>
                  <Button size="sm" onClick={handleRemove}
                    style={{ background: '#F87171', color: '#fff', border: 'none' }}
                  >Remove</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
