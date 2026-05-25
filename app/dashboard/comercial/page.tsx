'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  HardHat, 
  Footprints,
  ArrowRight,
  RefreshCw,
  Download,
  Plus,
  Settings,
  ChevronDown,
  ChevronRight,
  Warehouse,
  TrendingUp,
  Home,
  Zap
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
  {
    href: '/dashboard/comercial/metas',
    title: 'Metas e Vendas',
    description: 'Acompanhamento de metas vs realizado por projeto',
    icon: Target,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    href: '/dashboard/comercial/pipeline',
    title: 'Pipeline',
    description: 'Funil de vendas e oportunidades',
    icon: HardHat,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    href: '/dashboard/comercial/visitas',
    title: 'Visitas',
    description: 'Agendamentos e visitas realizadas',
    icon: Footprints,
    color: 'bg-amber-100 text-amber-600',
  },
];

const kpiData = [
  {
    icon: Target,
    label: 'Meta Anual (VGV)',
    value: 'R$ 232.296.998,00',
    subLabel: 'VP',
    subValue: '129 unidades no total',
    iconColor: 'text-[#61072E]',
    iconBg: 'bg-[#61072E]/10',
  },
  {
    icon: Warehouse,
    label: 'VGV em Estoque',
    value: 'R$ 0,00',
    subLabel: 'Sienge API',
    subValue: '',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    icon: TrendingUp,
    label: 'Realizado (VGV)',
    value: 'R$ 85.389.157,15',
    subLabel: 'VP',
    subValue: '36,8% da meta de VGV',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    icon: Home,
    label: 'Unidades Vendidas',
    value: '44 / 129',
    subLabel: '',
    subValue: '',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    icon: Zap,
    label: 'VSO Geral',
    value: '72%',
    subLabel: '',
    subValue: 'Velocidade de Vendas sobre Oferta',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-50',
  },
];

const citiesData = [
  {
    name: 'São Paulo',
    projectsCount: 6,
    isExpanded: true,
    projects: [
      { name: 'Ipanema', unid: 24, vgv: '32.366.494,00', meIa1: 6, vendas1: 22, vgvMeIa1: '8.092.124,00', vgvRealizado1: '40.580.392,44', meIa2: 3, vendas2: 1, vgvMeIa2: '4.046.062,00', vgvRealizado2: '1.780.007,00' },
      { name: 'Indigo', unid: 17, vgv: '71.867.296,00', meIa1: 1, vendas1: 1, vgvMeIa1: '4.233.370,00', vgvRealizado1: '4.980.000,00', meIa2: 1, vendas2: 2, vgvMeIa2: '4.233.370,00', vgvRealizado2: '7.758.063,17' },
      { name: 'Verter', unid: 5, vgv: '12.134.735,00', meIa1: 1, vendas1: 4, vgvMeIa1: '2.420.845,00', vgvRealizado1: '8.816.500,00', meIa2: 1, vendas2: 1, vgvMeIa2: '2.420.845,00', vgvRealizado2: '2.250.000,00' },
      { name: 'Casa da Mata', unid: 35, vgv: '67.175.516,00', meIa1: 2, vendas1: 2, vgvMeIa1: '4.071.244,00', vgvRealizado1: '4.250.000,00', meIa2: 5, vendas2: 1, vgvMeIa2: '10.178.109,00', vgvRealizado2: '2.215.000,00' },
      { name: 'Nefus', unid: 1, vgv: '1.429.733,00', meIa1: 1, vendas1: 1, vgvMeIa1: '1.428.733,00', vgvRealizado1: '1.340.000,00', meIa2: '-', vendas2: '-', vgvMeIa2: '-', vgvRealizado2: '-' },
      { name: 'Ares', unid: 4, vgv: '8.950.723,00', meIa1: 1, vendas1: 4, vgvMeIa1: '1.737.680,00', vgvRealizado1: '6.520.000,00', meIa2: 2, vendas2: 1, vgvMeIa2: '3.475.360,00', vgvRealizado2: '1.703.350,00' },
    ],
    totals: { unid: 86, vgv: '191.996.487,00', meIa1: 12, vendas1: 34, vgvMeIa1: '21.985.096,00', vgvRealizado1: '66.486.892,44', meIa2: 12, vendas2: 6, vgvMeIa2: '24.353.846,00', vgvRealizado2: '15.706.420,17' },
  },
  {
    name: 'Rio de Janeiro',
    projectsCount: 2,
    isExpanded: false,
    projects: [
      { name: 'Gávea', unid: 35, vgv: '32.536.680,00', meIa1: 3, vendas1: '-', vgvMeIa1: '2.788.858,00', vgvRealizado1: '-', meIa2: 4, vendas2: '-', vgvMeIa2: '3.716.478,00', vgvRealizado2: '-' },
      { name: 'A Notre', unid: 8, vgv: '7.763.821,00', meIa1: 2, vendas1: 1, vgvMeIa1: '1.840.955,00', vgvRealizado1: '768.010,13', meIa2: 2, vendas2: 3, vgvMeIa2: '1.840.955,00', vgvRealizado2: '2.427.834,41' },
    ],
    totals: { unid: 43, vgv: '40.300.511,00', meIa1: 5, vendas1: 1, vgvMeIa1: '4.729.813,00', vgvRealizado1: '768.010,13', meIa2: 6, vendas2: 3, vgvMeIa2: '5.557.433,00', vgvRealizado2: '2.427.834,41' },
  },
];

function KPICard({ kpi }: { kpi: typeof kpiData[0] }) {
  const Icon = kpi.icon;
  return (
    <Card className="bg-white border border-slate-100 hover:border-[#61072E]/20 hover:shadow-md transition-all duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${kpi.iconBg} shrink-0`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${kpi.iconColor}`} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{kpi.label}</p>
            <p className="text-sm sm:text-lg font-bold text-slate-800 mt-0.5 truncate">{kpi.value}</p>
            {kpi.subValue && (
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{kpi.subValue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectRow({ project, isTotal = false }: { project: any, isTotal?: boolean }) {
  return (
    <tr className={`${isTotal ? 'bg-muted/50 font-medium' : 'hover:bg-muted/30'} border-b border-border/50 last:border-0`}>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
        {isTotal ? <span className="font-semibold">{project.name}</span> : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#61072E]" />
            <span className="truncate max-w-[80px] sm:max-w-[120px]">{project.name}</span>
          </div>
        )}
      </td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{project.unid}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap">{project.vgv}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{project.meIa1}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{project.vendas1}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden sm:table-cell">{project.vgvMeIa1}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden lg:table-cell">{project.vgvRealizado1}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{project.meIa2}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{project.vendas2}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden sm:table-cell">{project.vgvMeIa2}</td>
      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden lg:table-cell">{project.vgvRealizado2}</td>
    </tr>
  );
}

function CitySection({ city, isExpanded, onToggle }: { city: typeof citiesData[0], isExpanded: boolean, onToggle: () => void }) {
  return (
    <>
      <tr 
        className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-b border-border"
        onClick={onToggle}
      >
        <td colSpan={11} className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="font-semibold text-sm sm:text-base">{city.name}</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs">{city.projectsCount} projetos</Badge>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <>
          {city.projects.map((project, idx) => (
            <ProjectRow key={idx} project={project} />
          ))}
          <ProjectRow project={{ ...city.totals, name: city.name }} isTotal />
        </>
      )}
    </>
  );
}

export default function ComercialPage() {
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({
    'São Paulo': true,
    'Rio de Janeiro': false,
  });

  const toggleCity = (cityName: string) => {
    setExpandedCities(prev => ({ ...prev, [cityName]: !prev[cityName] }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Comercial</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Insira os dados comerciais para <span className="font-medium">Todos os meses de 2026</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Sincronizar Supabase</span>
            <span className="sm:hidden">Sincronizar</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Importar Planilha</span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button size="sm" className="bg-[#61072E] hover:bg-[#61072E]/90 text-white text-xs sm:text-sm h-8 sm:h-9">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Novo Lançamento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className="group bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-[#61072E]/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base sm:text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{item.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[#61072E] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Meta de Vendas Section */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#61072E]/10">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#61072E]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Meta de Vendas - Projetos Ativos</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Visão anual distribuída por trimestres e praças
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Configurar Metas
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Empreendimento
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Unid
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  VGV (R$)
                </th>
                <th colSpan={4} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-[#61072E] uppercase tracking-wider border-l border-border">
                  1º TRI
                </th>
                <th colSpan={4} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-[#61072E] uppercase tracking-wider border-l border-border">
                  2º TRI
                </th>
              </tr>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-2 sm:px-4 py-1.5 sm:py-2" colSpan={3} />
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground border-l border-border">ME-IA</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">Vendas</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden sm:table-cell">VGV ME-IA</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden lg:table-cell">VGV Realizado</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground border-l border-border">ME-IA</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">Vendas</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden sm:table-cell">VGV ME-IA</th>
                <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden lg:table-cell">VGV Realizado</th>
              </tr>
            </thead>
            <tbody>
              {citiesData.map((city) => (
                <CitySection 
                  key={city.name} 
                  city={city} 
                  isExpanded={expandedCities[city.name] ?? false}
                  onToggle={() => toggleCity(city.name)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
