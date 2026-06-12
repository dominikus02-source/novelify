'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'AI Output Issue',
  'Mobile Issue',
  'Export Issue',
  'Billing Issue',
  'Confusing Flow',
  'General Feedback',
] as const;

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>('General Feedback');
  const [message, setMessage] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message: message.trim(), pageUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      toast.success('Feedback submitted. Thank you!');
      setOpen(false);
      setMessage('');
      setCategory('General Feedback');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Send Feedback"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 24,
          border: '1px solid rgba(201,169,110,0.25)',
          background: 'rgba(201,169,110,0.12)',
          backdropFilter: 'blur(8px)',
          color: '#E8C98A',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(201,169,110,0.22)';
          e.currentTarget.style.borderColor = 'rgba(201,169,110,0.40)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(201,169,110,0.12)';
          e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)';
        }}
      >
        <MessageCircle style={{ width: 16, height: 16 }} />
        Send Feedback
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              margin: 16,
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>
                Send Feedback
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#636366',
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#8E8E93',
                    marginBottom: 6,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: '#1a1a1a',
                    color: '#F5F5F7',
                    fontSize: 13,
                    outline: 'none',
                    appearance: 'auto',
                    cursor: 'pointer',
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#8E8E93',
                    marginBottom: 6,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  Message <span style={{ color: '#FF453A' }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, issue, or suggestion..."
                  rows={4}
                  maxLength={2000}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: '#1a1a1a',
                    color: '#F5F5F7',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }}
                />
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: 10,
                    color: message.length > 1900 ? '#FF453A' : '#636366',
                    marginTop: 4,
                  }}
                >
                  {message.length}/2000
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: submitting || !message.trim()
                    ? 'rgba(201,169,110,0.15)'
                    : 'linear-gradient(135deg, #C9A96E, #E8C98A)',
                  color: submitting || !message.trim() ? '#636366' : '#1a0f00',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: submitting || !message.trim() ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {submitting ? (
                  <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send style={{ width: 14, height: 14 }} />
                )}
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
