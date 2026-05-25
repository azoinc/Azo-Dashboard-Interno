'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
  permission?: string;
  children?: MenuItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isMaster, hasPermission } = useAuth();

  const menuItems: MenuItem[] = [
    {
      href: '/dashboard/financeiro',
      label: 'Financeiro',
      icon: '💰',
      permission: 'financeiro:view',
    },
    {
      href: '/dashboard/financeiro/lancamentos',
      label: 'Lançamentos',
      icon: '📝',
      permission: 'lancamentos:view',
    },
    {
      href: '/dashboard/comercial',
      label: 'Comercial',
      icon: '🤝',
      permission: 'comercial:view',
      children: [
        { href: '/dashboard/comercial/meta-vendas', label: 'Meta e Vendas', icon: '🎯' },
        { href: '/dashboard/comercial/pipeline', label: 'Pipeline', icon: '📊' },
        { href: '/dashboard/comercial/visitas', label: 'Visitas', icon: '🚶' },
      ],
    },
    {
      href: '/dashboard/institucional',
      label: 'Institucional',
      icon: '🏢',
      permission: 'institucional:view',
    },
    {
      href: '/dashboard/timeline',
      label: 'Timeline',
      icon: '📅',
      permission: 'timeline:view',
    },
    ...(isMaster()
      ? [
          {
            href: '/dashboard/admin',
            label: 'Admin',
            icon: '⚙️',
          },
        ]
      : []),
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const canAccess = (item: MenuItem) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="block">
          <h1 className="text-xl font-bold">Financeiro Azo</h1>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.filter(canAccess).map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>

            {/* Submenu */}
            {item.children && isActive(item.href) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      pathname === child.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>{child.icon}</span>
                    <span>{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.displayName || user?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role === 'master' && 'Master of Universe'}
              {user?.role === 'admin' && 'Administrador'}
              {user?.role === 'diretoria' && 'Diretoria'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
