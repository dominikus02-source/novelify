import { Hero } from '@/components/novelify/hero';
import { AuthRedirect } from '@/components/novelify/auth-redirect';

export default function Home() {
  return (
    <>
      <AuthRedirect />
      <Hero />
    </>
  );
}
