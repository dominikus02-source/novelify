export default function Loading() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--novel-bg)' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--novel-gold)] border-t-transparent" />
    </div>
  );
}
