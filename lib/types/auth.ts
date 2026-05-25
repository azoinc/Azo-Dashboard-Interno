// Tipos de autenticação e roles

export type UserRole = 'master' | 'admin' | 'diretoria';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  ativo: boolean;
}

export interface UserCreateInput {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface UserUpdateInput {
  displayName?: string;
  role?: UserRole;
  ativo?: boolean;
}

// Permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  master: ['*'], // Acesso total
  admin: [
    'dashboard:view',
    'financeiro:view',
    'marketing:view',
    'lancamentos:view',
    'lancamentos:create',
    'comercial:view',
    'institucional:view',
    'timeline:view',
  ],
  diretoria: [
    'financeiro:view',
    'marketing:view',
    'comercial:view',
  ],
};

// Cidades e empreendimentos
export const CIDADES = ['Campinas', 'Rio de Janeiro'] as const;
export type Cidade = (typeof CIDADES)[number];

export const EMPREENDIMENTOS_POR_CIDADE: Record<Cidade, string[]> = {
  Campinas: ['Casa da Mata', 'Ares', 'Verter'],
  'Rio de Janeiro': ['Gávea', 'Ar Ipanema', 'Insigna Peninsula', 'A Noite'],
};

// Filtros globais
export interface GlobalFilters {
  ano: number;
  mes: number;
  cidade: Cidade | 'todas';
  empreendimento: string | 'todos';
}

// Tipos de lançamento
export type TipoLancamento = 'Publicidade' | 'Manutenção de Stand' | 'Produtos';

export const CATEGORIAS_POR_TIPO: Record<TipoLancamento, string[]> = {
  Publicidade: [
    'Agência Off',
    'Agência On',
    'Promoção',
    'Produção Gráfica',
    'Produção de Comunicação Visual',
    'Produção Audio Visual',
    'Eventos',
    'Reuniões Mensais Imobs',
    'Mídia On',
    'Mídia Off',
  ],
  'Manutenção de Stand': ['Desmobilização', 'Manutenção', 'Casa Decorada'],
  Produtos: ['Produtos Gerais'],
};

export interface Lancamento {
  id: string;
  data: string;
  cidade: Cidade;
  empreendimento: string;
  tipo: TipoLancamento;
  categoria: string;
  descricao?: string;
  valor: number;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}
