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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_investimento_empreendimento ON investimento(empreendimento);
CREATE INDEX IF NOT EXISTS idx_investimento_mes_ref ON investimento(mes_ref);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investimento_updated_at BEFORE UPDATE ON investimento
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
