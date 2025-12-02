# Fremc 365 ATS - Guia de Deploy

Este guia descreve como configurar e implantar o MVP do Fremc 365 ATS.

## Pré-requisitos

- Node.js 18+
- Conta no Supabase (para Banco de Dados e Auth)
- Chave de API da Perplexity (opcional, para IA)

## Configuração do Banco de Dados (Supabase)

1. Crie um novo projeto no Supabase.
2. Vá para o **SQL Editor** e execute o script contido em `supabase/schema.sql`.
   - Isso criará as tabelas `vagas` e `candidatos` e configurará as políticas de segurança (RLS).
3. Vá para **Storage** e crie um bucket público chamado `resumes`.
   - Configure as políticas para permitir upload público (ou autenticado se preferir).
4. Vá para **Authentication** -> **URL Configuration** e adicione a URL do seu site (ex: `https://seu-projeto.vercel.app/auth/callback`) nas "Redirect URLs".

## Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves (veja `env-example`):

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
PERPLEXITY_API_KEY=sua-chave-perplexity (opcional)
```

## Instalação e Execução Local

```bash
npm install
npm run dev
```

O projeto estará rodando em `http://localhost:3000`.

## Deploy em Produção (Vercel)

A maneira mais fácil de fazer o deploy é usando a integração com GitHub/GitLab.

### Opção 1: Via GitHub (Recomendado)

1.  **Push do Código**: Envie seu código para um repositório no GitHub.
2.  **Vercel Dashboard**:
    - Acesse [vercel.com](https://vercel.com) e faça login.
    - Clique em **"Add New..."** -> **"Project"**.
    - Selecione o repositório do GitHub.
3.  **Configuração**:
    - Em **Environment Variables**, adicione as mesmas variáveis do seu `.env.local`:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `PERPLEXITY_API_KEY` (se estiver usando IA)
4.  **Deploy**: Clique em **Deploy**.

### Opção 2: Via Vercel CLI

Se preferir fazer deploy direto do terminal:

1.  Instale a CLI: `npm i -g vercel`
2.  Rode o comando: `vercel`
3.  Siga as instruções no terminal (login, setup do projeto).
4.  Configure as variáveis de ambiente quando solicitado ou via dashboard depois.

### Pós-Deploy

- **Supabase Auth**: Lembre-se de adicionar a URL de produção (ex: `https://seu-app.vercel.app/auth/callback`) nas configurações de **Authentication -> URL Configuration -> Redirect URLs** no Supabase.

## Funcionalidades Principais

- **Candidatos**: Visualização de vagas, candidatura com upload de CV, dashboard de status.
- **Recrutadores**: Criação de vagas, Kanban de candidatos, visualização de perfil com análise de IA.
- **IA**: Análise automática de aderência do candidato à vaga (Mock ou Perplexity).
