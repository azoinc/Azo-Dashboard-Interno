'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Settings, ChevronDown, ChevronRight } from 'lucide-react';

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

export default function MetasPage() {
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({
    'São Paulo': true,
    'Rio de Janeiro': false,
  });

  const toggleCity = (cityName: string) => {
    setExpandedCities(prev => ({ ...prev, [cityName]: !prev[cityName] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#61072E]/10">
            <Target className="w-5 h-5 text-[#61072E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Metas e Vendas</h1>
            <p className="text-muted-foreground text-sm">
              Visão anual distribuída por trimestres e praças
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configurar Metas
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Empreendimento</th>
                <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Unid</th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">VGV (R$)</th>
                <th colSpan={4} className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-[#61072E] uppercase border-l border-border">1º TRI</th>
                <th colSpan={4} className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-[#61072E] uppercase border-l border-border">2º TRI</th>
              </tr>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-2 sm:px-4 py-2" colSpan={3} />
                <th className="px-2 sm:px-4 py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground border-l border-border">ME-IA</th>
                <th className="px-2 sm:px-4 py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">Vendas</th>
                <th className="px-2 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden sm:table-cell">VGV ME-IA</th>
                <th className="px-2 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden lg:table-cell">VGV Realizado</th>
                <th className="px-2 sm:px-4 py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground border-l border-border">ME-IA</th>
                <th className="px-2 sm:px-4 py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground">Vendas</th>
                <th className="px-2 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden sm:table-cell">VGV ME-IA</th>
                <th className="px-2 sm:px-4 py-2 text-right text-[10px] sm:text-xs font-medium text-muted-foreground hidden lg:table-cell">VGV Realizado</th>
              </tr>
            </thead>
            <tbody>
              {citiesData.map((city) => (
                <>
                  <tr 
                    key={city.name}
                    className="bg-muted/30 hover:bg-muted/50 cursor-pointer border-b border-border"
                    onClick={() => toggleCity(city.name)}
                  >
                    <td colSpan={11} className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedCities[city.name] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-semibold text-sm sm:text-base">{city.name}</span>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">{city.projectsCount} projetos</Badge>
                      </div>
                    </td>
                  </tr>
                  {expandedCities[city.name] && (
                    <>
                      {city.projects.map((project, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 border-b border-border/50 last:border-0">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#61072E]" />
                              <span className="truncate max-w-[100px] sm:max-w-[140px]">{project.name}</span>
                            </div>
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
                      ))}
                      <tr className="bg-muted/50 font-medium border-b border-border">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                          <span className="font-semibold">{city.name}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{city.totals.unid}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap">{city.totals.vgv}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{city.totals.meIa1}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{city.totals.vendas1}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden sm:table-cell">{city.totals.vgvMeIa1}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden lg:table-cell">{city.totals.vgvRealizado1}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{city.totals.meIa2}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">{city.totals.vendas2}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden sm:table-cell">{city.totals.vgvMeIa2}</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right whitespace-nowrap hidden lg:table-cell">{city.totals.vgvRealizado2}</td>
                      </tr>
                    </>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
