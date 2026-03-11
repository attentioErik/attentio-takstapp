'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onMenuOpen: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/reports': 'Rapporter',
  '/reports/new': 'Ny rapport',
  '/befaring': 'Befaring',
  '/befaring/ny': 'Ny befaring',
  '/templates': 'Maler',
  '/settings': 'Innstillinger',
};

export function Header({ isDark, onToggleTheme, onMenuOpen }: HeaderProps) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/reports/') && pathname.endsWith('/edit')) return 'Rediger rapport';
    if (pathname.startsWith('/reports/') && pathname.endsWith('/preview')) return 'Forhåndsvisning';
    if (pathname.startsWith('/reports/')) return 'Rapport';
    if (pathname.startsWith('/befaring/')) return 'Befaring';
    return 'Takstapp';
  };

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuOpen}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-foreground">{getTitle()}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle - mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="lg:hidden"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* New report button */}
        <Link href="/reports/new">
          <Button size="sm" className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ny rapport</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
