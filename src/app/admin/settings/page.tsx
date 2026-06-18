'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, DollarSign, Clock, CalendarDays, Percent, Users, Ban } from 'lucide-react';

const GOLD = '#C9A96E';
const SURFACE = '#111111';
const TEXT = '#F5F5F7';
const MUTED = '#8E8E93';
const BORDER = 'rgba(255,255,255,0.06)';

const fields = [
  { key: 'standardCommissionRate', label: 'Standard Commission Rate', desc: 'Default commission rate for affiliates', icon: Percent, suffix: '%', min: 0, max: 100, step: 0.01, multiply: true },
  { key: 'topPartnerCommissionRate', label: 'Top Partner Commission Rate', desc: 'Higher rate for Top Partner affiliates', icon: Percent, suffix: '%', min: 0, max: 100, step: 0.01, multiply: true },
  { key: 'commissionDurationMonths', label: 'Commission Duration', desc: 'How many months commissions are paid', icon: CalendarDays, suffix: ' months', min: 0, max: 60, step: 1 },
  { key: 'cookieDurationDays', label: 'Cookie Duration', desc: 'Days referral cookie stays valid', icon: Clock, suffix: ' days', min: 1, max: 365, step: 1 },
  { key: 'minimumPayoutAmount', label: 'Minimum Payout', desc: 'Minimum balance to request payout', icon: DollarSign, suffix: ' USD', min: 0, max: 10000, step: 1 },
  { key: 'commissionHoldingDays', label: 'Commission Holding Days', desc: 'Days before commission is available', icon: Ban, suffix: ' days', min: 0, max: 90, step: 1 },
  { key: 'payoutCurrency', label: 'Payout Currency', desc: 'Currency for payouts', icon: DollarSign, suffix: '', type: 'select', options: ['USD', 'IDR'] },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/affiliate-settings')
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of fields) {
        let val = settings[f.key];
        if (f.multiply) val = Number(val) / 100;
        else if (f.type === 'select') val = String(val);
        else val = Number(val);
        payload[f.key] = val;
      }

      const res = await fetch('/api/admin/affiliate-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setSettings(updated);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const displayValue = (key: string, field: any) => {
    let val = settings[key];
    if (val === undefined || val === null) return '';
    if (field.multiply) return (Number(val) * 100).toFixed(1);
    return String(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: GOLD }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: TEXT, fontFamily: "'Playfair Display',serif", margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Affiliate program configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, #C9A96E, #E8C98A)',
            color: '#000', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity .2s',
          }}
        >
          {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${GOLD}1A`, border: `1px solid ${GOLD}33`, color: GOLD }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: TEXT, display: 'block', marginBottom: 2 }}>{f.label}</label>
                  <p style={{ fontSize: 11, color: MUTED, margin: '0 0 10px', lineHeight: 1.4 }}>{f.desc}</p>
                  {f.type === 'select' ? (
                    <select
                      value={settings.payoutCurrency || 'USD'}
                      onChange={(e) => handleChange('payoutCurrency', e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        background: '#0a0a0a', border: `1px solid ${BORDER}`,
                        color: TEXT, fontSize: 13, outline: 'none', cursor: 'pointer',
                      }}
                    >
                      {f.options?.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={displayValue(f.key, f)}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8,
                          background: '#0a0a0a', border: `1px solid ${BORDER}`,
                          color: TEXT, fontSize: 13, outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      {f.suffix && (
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: MUTED, pointerEvents: 'none' }}>{f.suffix}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
