# Dashboard de Marketing

Dashboard de marketing em Next.js com TypeScript, alimentado por PostgreSQL/Supabase.

## Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Charts**: Recharts
- **Backend**: API Routes do Next.js
- **Database**: PostgreSQL via Supabase
- **State Management**: Zustand

## Estrutura do Projeto

```
dashboard-mkt/
├── app/
│   ├── api/
│   │   ├── metrics/route.ts          # API para métricas agregadas
│   │   └── investment/route.ts      # API para dados de investimento
│   ├── dashboard/
│   │   └── page.tsx                  # Página principal do dashboard
│   ├── globals.css                   # Estilos globais
│   ├── layout.tsx                    # Layout raiz
│   └── page.tsx                      # Redireciona para /dashboard
├── components/
│   ├── dashboard/                    # Componentes do dashboard
│   │   ├── HeroSection.tsx
│   │   ├── KPICards.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── EvolutionChart.tsx
│   │   ├── EmpNav.tsx
│   │   ├── CalendarFilter.tsx
│   │   └── PerformanceTable.tsx
│   └── ui/                           # Componentes shadcn/ui
│       ├── card.tsx
│       └── button.tsx
├── lib/
│   ├── supabase.ts                   # Cliente Supabase
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Funções auxiliares
├── database/
│   └── create_investment_table.sql   # SQL para criar tabela de investimento
├── .env.example                      # Exemplo de variáveis de ambiente
└── .gitignore                        # Arquivos ignorados no Git
```

## Configuração

### 1. Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em Settings > API
3. Copie a URL e a anon key
4. Substitua no arquivo `.env.local`

### 3. Criar Tabela de Investimento

Execute o SQL em `database/create_investment_table.sql` no SQL Editor do Supabase:

```sql
-- Criar tabela de investimento
CREATE TABLE IF NOT EXISTS investimento (
  id SERIAL PRIMARY KEY,
  empreendimento VARCHAR(100) NOT NULL,
  mes_ref DATE NOT NULL,
  valor DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(empreendimento, mes_ref)
);
```

### 4. Mapeamento de Status

O dashboard usa o seguinte mapeamento de `status_atual` para métricas:

- **Descartes**: `status_atual = 'Descartado'`
- **Em Atendimento**: `status_atual IN ('Em Atendimento', '2º Tentativa', '3º Tentativa', '4º Tentativa', 'Aguardando Atendimento do do')`
- **Agendamento**: `status_atual LIKE '%Agendamento%'`
- **Visita**: `status_atual = 'Visitou'`
- **Venda**: `status_atual = 'Vendido'`

## Instalação

```bash
npm install
```

## Executar em Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Build para Produção

```bash
npm run build
npm start
```

## Deploy no Vercel

1. Crie um repositório no GitHub
2. Conecte o projeto ao Vercel
3. Adicione as variáveis de ambiente no Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático ao fazer push no GitHub

## API Endpoints

### GET /api/metrics

Retorna métricas agregadas de leads.

**Query Params:**
- `empreendimento`: Filtrar por empreendimento (opcional, padrão: 'all')
- `data_inicio`: Data início do período (opcional)
- `data_fim`: Data fim do período (opcional)

### GET /api/investment

Retorna dados de investimento.

**Query Params:**
- `empreendimento`: Filtrar por empreendimento (opcional, padrão: 'all')
- `data_inicio`: Data início do período (opcional)
- `data_fim`: Data fim do período (opcional)

## Componentes do Dashboard

- **HeroSection**: Total de leads e blobs visuais
- **KPICards**: Grid de cards com KPIs principais
- **FunnelChart**: Funil de conversão
- **EvolutionChart**: Gráfico de evolução mensal
- **EmpNav**: Navegação por empreendimento
- **CalendarFilter**: Filtro de período
- **PerformanceTable**: Tabela comparativa

## Próximos Passos

- [ ] Integrar dados de investimento do Google Sheets
- [ ] Adicionar view de detalhe por empreendimento
- [ ] Implementar view de Jornada de Captação
- [ ] Adicionar KPIs de Performance com benchmarks
- [ ] Implementar cache para melhorar performance
- [ ] Adicionar loading states e skeletons
