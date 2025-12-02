-- Create tables
CREATE TABLE IF NOT EXISTS vagas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  empresa TEXT NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id UUID NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cv_url TEXT,
  cv_texto TEXT,
  score INTEGER,
  resumo TEXT[],
  fit_cultural TEXT,
  status TEXT DEFAULT 'Novas Candidaturas',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Vagas públicas" ON vagas FOR SELECT USING (true);
CREATE POLICY "Candidatos privados" ON candidatos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Candidatos insert" ON candidatos FOR INSERT WITH CHECK (true);
CREATE POLICY "Candidatos update" ON candidatos FOR UPDATE USING (auth.role() = 'authenticated');

-- Seed data
INSERT INTO vagas (titulo, descricao, empresa, requirements) VALUES
('Desenvolvedor Fullstack', 'React/Node.js para plataforma e-commerce', 'TechChina BR', ARRAY['5+ anos experiência web', 'TypeScript, PostgreSQL']),
('Analista de Vendas B2B', 'Vendas para empresas chinesas', 'GlobalTrade Asia', ARRAY['Experiência B2B', 'Inglês fluente']),
('Analista RH Bilíngue', 'Gestão de talentos China-Brasil', 'HRFlow China', ARRAY['Fluente português e inglês', 'Experiência com sistemas de RH']);
