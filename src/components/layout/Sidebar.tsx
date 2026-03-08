'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  BookTemplate,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { mockUser, mockReports } from '@/lib/mock-data';
import { getInitials } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reports', label: 'Rapporter', icon: FileText },
  { href: '/templates', label: 'Maler', icon: BookTemplate },
  { href: '/settings', label: 'Innstillinger', icon: Settings },
];

interface SidebarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Sidebar({ isDark, onToggleTheme }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const draftCount = mockReports.filter((r) => r.status === 'draft').length;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-[var(--sidebar-background,#fff)] border-r border-[var(--sidebar-border)] overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 flex-shrink-0">
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden"
              >
                Takstapp
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-lg hover:bg-muted"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const showDraftBadge = item.href === '/reports' && draftCount > 0;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors cursor-pointer',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {showDraftBadge && !collapsed && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'ml-auto text-xs',
                      isActive ? 'bg-white/20 text-white' : 'bg-muted-foreground/20'
                    )}
                  >
                    {draftCount}
                  </Badge>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom: theme + user */}
      <div className="p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={cn(
            'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition-colors',
            'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {isDark ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {isDark ? 'Lyst tema' : 'Mørkt tema'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User */}
        <div className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5',
          'hover:bg-muted transition-colors cursor-pointer'
        )}>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(mockUser.name)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-foreground whitespace-nowrap">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{mockUser.company}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <LogOut className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0" />
          )}
        </div>
      </div>
    </motion.aside>
  );
}
