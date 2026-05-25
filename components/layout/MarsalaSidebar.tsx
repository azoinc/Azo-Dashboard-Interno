'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Receipt,
  Menu,
  X,
  Building2,
  MapPin,
  UserCircle,
  TrendingUp,
  LogOut,
  ShieldAlert,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Target,
  HardHat,
  Footprints,
} from 'lucide-react';

interface MarsalaSidebarProps {
  onBackToSelection?: () => void;
}

export function MarsalaSidebar({ onBackToSelection }: MarsalaSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommercialOpen, setIsCommercialOpen] = useState(true);
  const { user, isMaster, signOut } = useAuth();

  const isCommercialActive = pathname.startsWith('/dashboard/comercial');

  const menuItems = [
    { href: '/dashboard/marketing', label: 'Marketing', icon: LayoutDashboard },
    { href: '/dashboard/lancamentos', label: 'Lançamentos', icon: Receipt },
    {
      label: 'Comercial',
      icon: TrendingUp,
      isOpen: isCommercialOpen,
      onToggle: () => setIsCommercialOpen(!isCommercialOpen),
      isActive: isCommercialActive,
      children: [
        { href: '/dashboard/comercial/metas', label: 'Metas e vendas', icon: Target },
        { href: '/dashboard/comercial/pipeline', label: 'Pipeline', icon: HardHat },
        { href: '/dashboard/comercial/visitas', label: 'Visitas', icon: Footprints },
      ],
    },
    { href: '/dashboard/institucional', label: 'Institucional', icon: Building2 },
    { href: '/dashboard/timeline', label: 'Timeline', icon: TrendingUp },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#61072E] text-white flex flex-col h-screen
          fixed left-0 top-0 z-50 w-[280px]
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-64 lg:fixed lg:z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between md:justify-center border-b border-[#4a0523]">
          <div className="flex items-center space-x-2">
            {onBackToSelection && (
              <button
                onClick={onBackToSelection}
                className="p-1.5 mr-2 bg-[#4a0523] hover:bg-rose-900/50 text-white/70 hover:text-white rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#61072E]">
              A
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Marketing Azo</h1>
          </div>
          <button
            className="lg:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-[#4a0523]">
          <div className="flex items-center space-x-2 mb-2">
            <UserCircle size={16} className="text-white/70" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.email}</span>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {user?.role === 'master' ? 'Master' : user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-[#4a0523] hover:bg-rose-900/50 text-white/70 hover:text-rose-400 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <div key={item.label}>
                {'children' in item ? (
                  <>
                    <button
                      onClick={item.onToggle}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                        item.isActive
                          ? 'bg-[#4a0523]/80 text-emerald-400'
                          : 'hover:bg-[#4a0523] text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={20} className={item.isActive ? 'text-emerald-400' : ''} />
                        <span className={`font-medium ${item.isActive ? 'text-white' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {item.isOpen && (
                      <div className="pl-4 pr-2 py-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                isChildActive
                                  ? 'bg-emerald-500 text-[#61072E] shadow-md shadow-emerald-500/20'
                                  : 'hover:bg-[#4a0523] text-white/70 hover:text-emerald-400'
                              }`}
                            >
                              <ChildIcon size={18} />
                              <span className="font-medium text-sm">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-[#61072E] shadow-md shadow-emerald-500/20'
                        : 'hover:bg-[#4a0523] text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            );
          })}

          {isMaster() && (
            <Link
              href="/dashboard/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                pathname === '/dashboard/admin'
                  ? 'bg-emerald-500 text-[#61072E] shadow-md shadow-emerald-500/20'
                  : 'hover:bg-[#4a0523] text-white/70 hover:text-white'
              }`}
            >
              <ShieldAlert size={20} />
              <span className="font-medium">Admin</span>
            </Link>
          )}
        </nav>

        {/* Filtros */}
        <div className="p-5 border-t border-[#4a0523] bg-[#4a0523]/50">
          <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Filtros</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/70 mb-1 block">Ano</label>
                <select className="w-full bg-[#4a0523] border border-[#7a093a] text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/70 mb-1 block">Mês</label>
                <select className="w-full bg-[#4a0523] border border-[#7a093a] text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                  <option value="ALL">Todos os meses</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1 flex items-center">
                <MapPin size={12} className="mr-1" /> Cidade
              </label>
              <select className="w-full bg-[#4a0523] border border-[#7a093a] text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="ALL">Todas as Cidades</option>
                <option value="Rio de Janeiro">Rio de Janeiro</option>
                <option value="Campinas">Campinas</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1 flex items-center">
                <Building2 size={12} className="mr-1" /> Empreendimento
              </label>
              <select className="w-full bg-[#4a0523] border border-[#7a093a] text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="ALL">Todos os Empreendimentos</option>
                <option value="Gavea">Gávea</option>
                <option value="Ipanema">Ipanema</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#61072E] z-30 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-[#61072E]">
            A
          </div>
          <h1 className="text-lg font-bold text-white">Marketing Azo</h1>
        </div>
        <button
          className="p-2 text-white/70 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </>
  );
}
