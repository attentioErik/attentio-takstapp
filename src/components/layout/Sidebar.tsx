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
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, coming: false },
  { href: '/reports', label: 'Rapporter', icon: FileText, coming: false },
  { href: '/templates', label: 'Maler', icon: BookTemplate, coming: true },
  { href: '/settings', label: 'Innstillinger', icon: Settings, coming: false },
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
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 flex-shrink-0">
        <motion.div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-sidebar-foreground whitespace-nowrap overflow-hidden"
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
            className="h-8 w-8 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.coming && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)));
          const showDraftBadge = item.href === '/reports' && draftCount > 0;

          const itemContent = (
            <motion.div
              whileHover={item.coming ? {} : { x: collapsed ? 0 : 2 }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                item.coming
                  ? 'opacity-50 cursor-not-allowed text-sidebar-foreground'
                  : isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer'
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
              {!collapsed && item.coming && (
                <span className="ml-auto text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5 whitespace-nowrap">
                  Kommer
                </span>
              )}
              {showDraftBadge && !collapsed && !item.coming && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'ml-auto text-xs',
                    isActive
                      ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                      : 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                >
                  {draftCount}
                </Badge>
              )}
            </motion.div>
          );

          if (item.coming) {
            return <div key={item.href}>{itemContent}</div>;
          }

          return (
            <Link key={item.href} href={item.href}>
              {itemContent}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Bottom: theme + user */}
      <div className="p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className={cn(
            'flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition-colors',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer'
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                <p className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">{mockUser.name}</p>
                <p className="text-xs text-sidebar-foreground/60 whitespace-nowrap">{mockUser.company}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <LogOut className="w-4 h-4 text-sidebar-foreground/50 ml-auto flex-shrink-0" />
          )}
        </div>
      </div>
    </motion.aside>
  );
}
