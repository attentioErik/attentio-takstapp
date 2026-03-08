import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Building2, Users, ArrowLeft } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  // Middleware handles protection, but double-check server-side
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Takstapp Admin</span>
          <nav className="flex items-center gap-4 ml-6">
            <Link
              href="/admin/users"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Brukere
            </Link>
          </nav>
          <Link
            href="/"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Til app
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
