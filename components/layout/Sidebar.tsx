'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { X } from 'lucide-react';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
  permission?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar / Drawer - Fixa na lateral esquerda */}
      <aside 
        className={`
          bg-card border-r border-border flex flex-col h-screen
          fixed left-0 top-0 z-50 w-[280px]
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64 lg:fixed lg:z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo - com botão fechar no mobile */}
        <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="block" onClick={onClose}>
            <h1 className="text-lg lg:text-xl font-bold">Financeiro Azo</h1>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-1">
        {menuItems.filter(canAccess).map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg transition-colors text-sm lg:text-base ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="text-lg lg:text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>

            {/* Submenu */}
            {item.children && isActive(item.href) && (
              <div className="ml-8 lg:ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 lg:px-4 py-2 rounded-lg transition-colors text-xs lg:text-sm ${
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
      <div className="p-3 lg:p-4 border-t border-border">
        <Link
          href="/dashboard/perfil"
          onClick={onClose}
          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
            pathname === '/dashboard/perfil'
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted'
          }`}
        >
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center text-base lg:text-lg shrink-0">
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
        </Link>
      </div>
    </aside>
    </>
  );
}
