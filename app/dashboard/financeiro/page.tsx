'use client';

import { useState } from 'react';
import { useFilters } from '@/lib/filters-context';

type Tab = 'marketing' | 'lancamentos';

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState<Tab>('marketing');

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-6 py-3 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'marketing'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Marketing
        </button>
        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`px-6 py-3 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'lancamentos'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Lançamentos
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'marketing' && <MarketingTab />}
        {activeTab === 'lancamentos' && <LancamentosTab />}
      </div>
    </div>
  );
}

function BigNumber({ label, value, prefix = '' }: { label: string; value: number | string; prefix?: string }) {
  const formatValue = () => {
    if (typeof value === 'string') return value;
    if (prefix === 'R$ ') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    }
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xl lg:text-2xl font-bold mt-1">{formatValue()}</p>
    </div>
  );
}

function MarketingTab() {
  const bigNumbers = {
    vgvProduto: 125000000,
    vgvEstoque: 89000000,
    vgvRealizado: 36000000,
    metaVendas: 150000000,
    vendasRealizadas: 42,
    investimentoMkt: 1250000,
    investimentoStand: 450000,
    investimentoProduto: 890000,
    estoqueUnidades: 156,
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
        <BigNumber label="VGV Produto" value={bigNumbers.vgvProduto} prefix="R$ " />
        <BigNumber label="VGV Estoque" value={bigNumbers.vgvEstoque} prefix="R$ " />
        <BigNumber label="VGV Realizado" value={bigNumbers.vgvRealizado} prefix="R$ " />
        <BigNumber label="Meta Vendas" value={bigNumbers.metaVendas} prefix="R$ " />
        <BigNumber label="Vendas Realizadas" value={bigNumbers.vendasRealizadas} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigNumber label="Investimento MKT" value={bigNumbers.investimentoMkt} prefix="R$ " />
        <BigNumber label="Investimento Stand" value={bigNumbers.investimentoStand} prefix="R$ " />
        <BigNumber label="Investimento Produto" value={bigNumbers.investimentoProduto} prefix="R$ " />
        <BigNumber label="Estoque Unidades" value={bigNumbers.estoqueUnidades} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Origem x Investimento</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">[Gráfico de Barras]</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Planejado x Realizado - Empreendimentos</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">[Gráfico]</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Leads</h3>
          <div className="grid grid-cols-2 gap-4">
            <BigNumber label="Leads" value={2847} />
            <BigNumber label="Visitas ON" value={1456} />
            <BigNumber label="Visitas OFF" value="-" />
            <BigNumber label="Conversão" value="51%" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Evolução: Leads x Investimento</h3>
          <div className="h-48 flex items-center justify-center text-muted-foreground">[Gráfico de Linha]</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DescritivoCard title="Previsão (Orçamentos)" />
        <DescritivoCard title="Realizado (Lançamentos)" />
      </div>
    </div>
  );
}

function DescritivoCard({ title }: { title: string }) {
  const items = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    descricao: `Item ${i + 1} - ${title}`,
    valor: Math.random() * 100000,
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
            <span className="text-sm">{item.descricao}</span>
            <span className="font-medium">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-border">
        <button className="px-3 py-1 text-sm hover:bg-muted rounded">&lt;</button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button key={page} className={`px-3 py-1 text-sm rounded ${page === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
            {page}
          </button>
        ))}
        <button className="px-3 py-1 text-sm hover:bg-muted rounded">&gt;</button>
      </div>
    </div>
  );
}

function LancamentosTab() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lançamentos</h2>
        <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
          + Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground uppercase">Basal Publicidade</p>
          <p className="text-2xl font-bold mt-2">R$ 1.250.000,00</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground uppercase">Basal Manut. Stand</p>
          <p className="text-2xl font-bold mt-2">R$ 450.000,00</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground uppercase">Basal Produtos</p>
          <p className="text-2xl font-bold mt-2">R$ 890.000,00</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Histórico de Lançamentos do Mês</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Data</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Cidade</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Empreendimento</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Tipo</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Categoria</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Descrição</th>
              <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50">
              <td className="py-3 px-4 text-sm">22/05/2026</td>
              <td className="py-3 px-4 text-sm">Campinas</td>
              <td className="py-3 px-4 text-sm">Casa da Mata</td>
              <td className="py-3 px-4 text-sm">Publicidade</td>
              <td className="py-3 px-4 text-sm">Mídia On</td>
              <td className="py-3 px-4 text-sm">Campanha Google Ads</td>
              <td className="py-3 px-4 text-sm text-right font-medium">R$ 15.000,00</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-border">
          <button className="px-3 py-1 text-sm hover:bg-muted rounded">&lt;</button>
          {[1, 2, 3].map((page) => (
            <button key={page} className={`px-3 py-1 text-sm rounded ${page === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
              {page}
            </button>
          ))}
          <button className="px-3 py-1 text-sm hover:bg-muted rounded">&gt;</button>
        </div>
      </div>

      {showModal && <NovoLancamentoModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function NovoLancamentoModal({ onClose }: { onClose: () => void }) {
  const [tipo, setTipo] = useState<string>('');

  const tipos = ['Publicidade', 'Manutenção de Stand', 'Produtos'] as const;
  const categorias: Record<string, string[]> = {
    Publicidade: ['Agência Off', 'Agência On', 'Promoção', 'Produção Gráfica', 'Produção de Comunicação Visual', 'Produção Audio Visual', 'Eventos', 'Reuniões Mensais Imobs', 'Mídia On', 'Mídia Off'],
    'Manutenção de Stand': ['Desmobilização', 'Manutenção', 'Casa Decorada'],
    Produtos: ['Produtos Gerais'],
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Novo Lançamento</h2>
        </div>
        <form className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option value="">Selecione...</option>
              <option>Campinas</option>
              <option>Rio de Janeiro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empreendimento</label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option value="">Selecione...</option>
              <option>Casa da Mata</option>
              <option>Ares</option>
              <option>Verter</option>
              <option>Gávea</option>
              <option>Ar Ipanema</option>
              <option>Insigna Peninsula</option>
              <option>A Noite</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background">
              <option value="">Selecione...</option>
              {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select disabled={!tipo} className="w-full px-3 py-2 border border-input rounded-md bg-background disabled:opacity-50">
              <option value="">Selecione...</option>
              {tipo && categorias[tipo]?.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição (Opcional)</label>
            <textarea className="w-full px-3 py-2 border border-input rounded-md bg-background" rows={3} placeholder="Adicione uma descrição..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor R$</label>
            <input type="number" step="0.01" placeholder="0,00" className="w-full px-3 py-2 border border-input rounded-md bg-background" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Salvar Lançamento</button>
          </div>
        </form>
      </div>
    </div>
  );
}
