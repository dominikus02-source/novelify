export default function Loading() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8873A] border-t-transparent" />
    </div>
  );
}
