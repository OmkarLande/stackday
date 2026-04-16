import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Header } from '@/components/layout/header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header userName={session.name} email={session.email} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
