export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--novel-bg)',
      color: 'var(--novel-text)',
    }}>
      {children}
    </div>
  );
}
