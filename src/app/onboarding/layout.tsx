export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      color: '#F5F5F7',
    }}>
      {children}
    </div>
  );
}
