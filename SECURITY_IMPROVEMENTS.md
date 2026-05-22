# Melhorias de Segurança e Performance Implementadas

## Resumo das Alterações

Este documento detalha todas as correções de segurança, falhas e delays implementadas no sistema Dashboard Mkt.

## 1. Migração para PostgreSQL Direto

### 1.1 Remoção de Dependência Supabase
**Arquivos:** `package.json`, `lib/supabase.ts`
- Removida dependência `@supabase/supabase-js`
- Substituída por conexão direta PostgreSQL usando `pg`
- `lib/supabase.ts` agora exporta funções de `lib/db.ts` para compatibilidade

### 1.2 Configuração PostgreSQL
**Arquivo:** `lib/db.ts`
- Criado pool de conexões PostgreSQL
- Configuração via variáveis de ambiente (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL)
- Logging automático de queries com tempo de execução
- Tratamento de erros e reconexão automática

### 1.3 Atualização de Variáveis de Ambiente
**Arquivo:** `.env.example`
- Substituídas variáveis do Supabase por variáveis PostgreSQL
- Novas variáveis: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL

### 1.4 Reescrita de Endpoints API
**Arquivos:** `app/api/investment/route.ts`, `app/api/metrics/route.ts`
- Queries SQL diretas em vez de ORM Supabase
- Uso de parâmetros parametrizados para prevenir SQL injection
- Manutenção de paginação e validação existentes
- Performance melhorada com queries otimizadas

## 2. Segurança Crítica

### 2.1 Validação de Input com Zod
**Arquivos:** `app/api/investment/route.ts`, `app/api/metrics/route.ts`
- Implementado validação rigorosa de parâmetros de query
- Validação de formato de data (YYYY-MM-DD)
- Validação de paginação (page, limit)
- Retorno de erros detalhados para debugging

### 2.2 Headers de Segurança
**Arquivo:** `next.config.js`
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options (SAMEORIGIN)
- X-Content-Type-Options (nosniff)
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy (CSP) - atualizado para PostgreSQL
- X-DNS-Prefetch-Control

### 2.3 Rate Limiting
**Arquivos:** `lib/rate-limit.ts`, `app/api/investment/route.ts`, `app/api/metrics/route.ts`
- Implementado rate limiting em memória
- Limite de 100 requisições por minuto por IP
- Headers informativos (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Cleanup automático de entradas expiradas

### 2.4 Prevenção de SQL Injection
**Arquivos:** `app/api/investment/route.ts`, `app/api/metrics/route.ts`
- Todas as queries usam parâmetros parametrizados ($1, $2, etc.)
- Validação de input com Zod antes de construir queries
- Sanitização automática pelo driver PostgreSQL

## 3. Performance

### 3.1 Paginação
**Arquivos:** `app/api/investment/route.ts`, `app/api/metrics/route.ts`
- Implementado paginação em todos os endpoints
- Parâmetros `page` e `limit` validados
- Limite máximo de 100 itens por página (investment) e 500 (metrics)
- Retorno de metadados de paginação (total, totalPages)
- Queries COUNT separadas para melhor performance

### 3.2 Debounce no Dashboard
**Arquivo:** `app/dashboard/page.tsx`
- Implementado debounce de 500ms nos filtros
- Evita múltiplas requisições simultâneas
- Melhora experiência do usuário

### 3.3 Pool de Conexões
**Arquivo:** `lib/db.ts`
- Pool de conexões com máximo de 20 clientes
- Timeout de conexão: 2 segundos
- Timeout de idle: 30 segundos
- Reutilização eficiente de conexões

## 4. Qualidade de Código

### 4.1 Tipagem TypeScript
**Arquivos:** `app/api/metrics/route.ts`, `app/dashboard/page.tsx`
- Removido uso de `any`
- Interfaces definidas para Lead, Metrics, ProcessedMetrics
- Tipagem estrita em toda a aplicação

### 4.2 Tratamento de Erro
**Arquivos:** `app/api/investment/route.ts`, `app/api/metrics/route.ts`
- Mensagens de erro genéricas para não vazar informações
- Status codes apropriados (400, 429, 500, 503)
- Logging de erros no console
- Tratamento de erros de conexão PostgreSQL

### 4.3 Organização de Status
**Arquivo:** `app/api/metrics/route.ts`
- Constante `STATUS_CATEGORIES` centralizada
- Facilita manutenção e adição de novos status
- Código mais legível

## 5. Dependências

### 5.1 PostgreSQL
- Adicionado pacote `pg` para conexão PostgreSQL
- Adicionado `@types/pg` para suporte TypeScript
- Removido `@supabase/supabase-js`

### 5.2 Zod
- Mantido pacote `zod` para validação de schemas

## Próximos Passos Recomendados

### Autenticação
- Implementar NextAuth.js ou sistema próprio
- Criar sistema de login/logout
- Proteger rotas privadas
- Implementar autenticação PostgreSQL

### Monitoramento
- Implementar logging estruturado (ex: Pino, Winston)
- Adicionar monitoramento de performance (ex: Vercel Analytics)
- Configurar alertas para erros de conexão
- Monitorar pool de conexões

### Cache
- Implementar Redis ou cache PostgreSQL
- Cache de respostas de API
- Cache de componentes estáticos
- Considerar materialized views para queries complexas

### Testes
- Adicionar testes unitários para queries SQL
- Testes de integração para APIs
- Testes E2E para fluxos críticos
- Testes de carga para pool de conexões

### CI/CD
- Configurar GitHub Actions
- Scans de vulnerabilidade automáticos
- Testes automatizados no pipeline
- Migração automática de banco de dados

### Banco de Dados
- Implementar migrations (ex: node-pg-migrate, dbmate)
- Criar índices para otimizar queries
- Configurar backup automático
- Implementar replicação para alta disponibilidade

## Variáveis de Ambiente Necessárias

Certifique-se de configurar as seguintes variáveis de ambiente:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dashboard
DB_USER=postgres
DB_PASSWORD=your-password-here
DB_SSL=false
```

Opcionais (apenas se necessário para migração):
```env
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account-email
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key
```

## Estrutura do Banco de Dados

### Tabela Leads
```sql
CREATE TABLE Leads (
  id_cv VARCHAR PRIMARY KEY,
  nome VARCHAR,
  status_atual VARCHAR,
  data_criacao_cv DATE,
  hora_criacao_cv TIME,
  data_cancelamento DATE,
  hora_cancelamento TIME,
  motivo_cancelamento VARCHAR,
  submotivo_cancelamento VARCHAR,
  descricao_motivo_cancelamento TEXT,
  update_at TIMESTAMP,
  corretor VARCHAR,
  empreendimento VARCHAR,
  origem VARCHAR,
  midia VARCHAR
);
```

### Tabela investimento
```sql
CREATE TABLE investimento (
  id SERIAL PRIMARY KEY,
  empreendimento VARCHAR(100) NOT NULL,
  mes_ref DATE NOT NULL,
  valor DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(empreendimento, mes_ref)
);
```

## Notas Importantes

- O rate limiting atual é em memória e não persiste entre reinicializações
- Para produção, considere usar Redis ou Upstash para rate limiting distribuído
- O pool de conexões PostgreSQL deve ser monitorado em produção
- Considere usar connection string completa para SSL em produção
- O CSP pode precisar de ajustes dependendo de serviços externos utilizados
- Considere implementar autenticação antes de colocar em produção
- Queries SQL são construídas dinamicamente mas com parâmetros seguros
- Para ambientes de produção, use SSL (DB_SSL=true)

## Migração de Dados

Se você estava usando Supabase anteriormente:

1. Exporte seus dados do Supabase
2. Configure seu banco PostgreSQL local ou em nuvem
3. Execute o script de criação de tabelas
4. Importe os dados exportados
5. Atualize as variáveis de ambiente
6. Teste os endpoints para garantir funcionamento

## Performance Tips

- Crie índices nas colunas usadas em WHERE e JOIN
- Use EXPLAIN ANALYZE para otimizar queries lentas
- Considere particionamento para tabelas grandes
- Configure appropriate work_mem e shared_buffers no PostgreSQL
- Use VACUUM ANALYZE regularmente para manter estatísticas atualizadas
