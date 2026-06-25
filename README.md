# 🏊 AquaFlow

**AquaFlow** é um sistema completo de gestão de competições aquáticas (natação), desenvolvido para auxiliar federações, clubes e oficiais na organização e administração de eventos desportivos aquáticos.

---

## 📋 Sumário

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Módulos Principais](#módulos-principais)
- [Banco de Dados](#banco-de-dados)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## ✨ Características

### 📊 Gestão de Competições
- Criação e gerenciamento de competições (Nacional, Estadual, Regional, Copa, Circuito, Festival)
- Definição de provas e fases (Eliminatórias, Semifinais, Finais)
- Controle de status de competição (Planejamento, Inscrições abertas/encerradas, Em andamento, Encerrada, Homologada)
- Suporte para piscinas de 25m e 50m

### 👥 Cadastro de Atletas
- Registro centralizado de atletas com documentação
- Categorias e classificações por gênero
- Histórico de participações e resultados
- Foto do atleta e rastreamento de status

### 🏛️ Gerenciamento de Clubes
- Cadastro de clubes, academias e equipes
- Associação com federações estaduais
- Gestão de anuidade e status de regularização
- Informações de localização

### 🏅 Arbitragem
- Registro de árbitros com formações e certificações
- Níveis de elegibilidade (Regional, Nacional, Internacional FINA)
- Controle de clínicas e atualizações profissionais

### 📝 Inscrições e Resultados
- Sistema de inscrição em provas
- Registro de resultados e tempos
- Cálculo de rankings e estatísticas
- Proteção de resultados com sistema de proteção/impugnação

### 📈 Relatórios e Análises
- Estatísticas de competições
- Rankings de atletas
- Recordes estabelecidos
- Análise de desempenho

### 🎙️ Funcionalidades Operacionais
- Cronometragem de provas
- Sala de chamada (call room)
- Transmissão de eventos
- Arbitragem em tempo real
- Balizamento de piscina
- Protestos e impugnações

### 💰 Gestão Financeira
- Controle de receitas e despesas
- Gerenciamento de taxas de inscrição
- Status de pagamento de anuidades
- Relatórios financeiros

### ⚙️ Configurações
- Gerenciamento de permissões por função (RBAC)
- Configurações gerais do sistema
- Preferências de interface

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18+** - UI interativa
- **TanStack Router** - Roteamento tipo-seguro
- **TanStack Start** - Meta-framework para SSR
- **TanStack Query** - Gerenciamento de estado e cache
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização responsiva
- **Radix UI** - Componentes acessíveis
- **shadcn/ui** - Biblioteca de componentes UI

### Backend
- **Vite** - Build tool e dev server
- **Node.js / Bun** - Runtime JavaScript
- **SSR** - Server-Side Rendering com TanStack Start

### Banco de Dados
- **PostgreSQL** (Supabase) - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança em nível de linha
- **Triggers Reativos** - Automação de operações

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Bun** - Package manager rápido

---

## 📦 Pré-requisitos

- **Node.js 18+** ou **Bun 1.0+**
- **PostgreSQL 14+** (ou Supabase)
- **Git**

---

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/AquaFlow.git
cd AquaFlow
```

### 2. Instale as dependências
```bash
# Com npm
npm install

# Ou com Bun (recomendado)
bun install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:
```env
# Supabase
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Outras configurações
VITE_API_URL=http://localhost:5173
```

---

## ⚙️ Configuração

### Banco de Dados

1. **Crie um projeto Supabase** ou configure PostgreSQL localmente
2. **Execute o schema SQL**:
   ```bash
   psql -U seu_usuario -d seu_banco -f supabase_schema.sql
   ```
   
   Ou no Supabase, execute o conteúdo de `supabase_schema.sql` no SQL Editor.

3. **Tabelas principais**:
   - `federacoes` - Federações estaduais
   - `clubes` - Clubes e equipes
   - `atletas` - Cadastro de atletas
   - `arbitros` - Árbitros e oficiais
   - `competicoes` - Competições
   - `provas` - Provas das competições
   - `inscricoes` - Inscrições em provas
   - `resultados` - Resultados de provas
   - E mais (veja `supabase_schema.sql`)

---

## 📱 Como Executar

### Desenvolvimento
```bash
# Com npm
npm run dev

# Com Bun
bun run dev
```
A aplicação estará disponível em `http://localhost:5173`

### Build para Produção
```bash
# Com npm
npm run build

# Com Bun
bun run build
```

### Preview da Build
```bash
npm run preview
```

### Lint e Formatação
```bash
# Verificar linting
npm run lint

# Formatar código
npm run format
```

---

## 📁 Estrutura do Projeto

```
AquaFlow/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── layout/         # Componentes de layout
│   │   ├── ui/             # Componentes Radix UI/shadcn
│   │   └── DataTable.tsx   # Tabela de dados principal
│   ├── routes/             # Rotas da aplicação (TanStack Router)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilitários e helpers
│   │   ├── rbac.tsx       # Controle de acesso baseado em papel
│   │   ├── nav.ts         # Configuração de navegação
│   │   └── data.ts        # Dados mockados/utilitários
│   ├── styles.css          # Estilos globais
│   ├── router.tsx          # Configuração do router
│   ├── server.ts           # Servidor SSR
│   └── start.ts            # Entry point da aplicação
├── public/                 # Arquivos estáticos
├── eslint.config.js        # Configuração ESLint
├── tsconfig.json           # Configuração TypeScript
├── vite.config.ts          # Configuração Vite
├── tailwind.config.js      # Configuração Tailwind CSS
├── package.json            # Dependências e scripts
└── supabase_schema.sql     # Schema do banco de dados
```

---

## 🎯 Módulos Principais

### 📊 Dashboard
- Visualização geral de competições ativas
- Estatísticas de participação
- Alertas e notificações importantes

### 🏊 Competições
- **Gerenciar Competições** - CRUD de competições
- **Provas** - Gestão de provas por competição
- **Inscrições** - Controle de participantes

### 👤 Cadastros
- **Atletas** - Registro e gestão de atletas
- **Clubes** - Informações de federações e clubes
- **Árbitros** - Cadastro de oficiais

### 🏅 Operações
- **Cronometragem** - Interface para cronometradores
- **Sala de Chamada** - Call room para competição
- **Transmissão** - Interface de transmissão
- **Arbitragem** - Controle de árbitros em tempo real

### 📈 Análise e Relatórios
- **Resultados** - Visualização de resultados das provas
- **Rankings** - Classificação de atletas
- **Recordes** - Histórico de recordes
- **Estatísticas** - Análise de desempenho
- **Relatórios** - Geração de relatórios personalizados

### 💼 Administração
- **Configurações** - Ajustes do sistema
- **Financeiro** - Gestão de receitas e despesas
- **Arbitragem** - Gerenciamento de árbitros
- **Protestos** - Sistema de impugnações

---

## 🗄️ Banco de Dados

### Principais Entidades

| Tabela | Descrição |
|--------|-----------|
| `federacoes` | Federações estaduais/nacionais |
| `clubes` | Clubes, academias e equipes |
| `atletas` | Cadastro centralizado de atletas |
| `arbitros` | Árbitros e oficiais da competição |
| `competicoes` | Competições aquáticas |
| `provas` | Provas individuais de competições |
| `inscricoes` | Participações de atletas em provas |
| `resultados` | Resultados e tempos das provas |
| `usuarios` | Usuários do sistema |
| `logs_arbitragem` | Histórico de decisões arbitrais |

### Segurança
- **Row Level Security (RLS)** ativado
- **Policies** de controle de acesso
- **Triggers** para auditoria

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use **TypeScript** rigorosamente
- Mantenha componentes pequenos e reutilizáveis
- Escreva testes para novas funcionalidades
- Siga o guia de estilo do ESLint

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

Para questões, bugs ou sugestões, abra uma [issue no GitHub](https://github.com/seu-usuario/AquaFlow/issues).

---

## 🏊 Desenvolvido para a comunidade aquática

**AquaFlow** foi criado para simplificar a gestão de competições aquáticas e contribuir para o desenvolvimento do esporte no Brasil.

---

**Última atualização:** 2026-06-25
# aquaflow
