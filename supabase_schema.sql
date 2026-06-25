-- ===========================================================================
-- AquaFlow — Schema de Banco de Dados PostgreSQL (Supabase)
-- ===========================================================================
-- Este arquivo descreve a modelagem de tabelas, chaves estrangeiras, índices,
-- Row Level Security (RLS) e triggers reativos do ecossistema aquático.
-- ===========================================================================

-- 1. EXTENSÕES & SETUP
create extension if not exists "uuid-ossp";

-- 2. TABELAS DE DOMÍNIO

-- Federações estaduais/nacionais
create table public.federacoes (
    id uuid primary key default uuid_generate_v4(),
    nome varchar(255) not null,
    sigla varchar(10) not null unique,
    estado char(2) not null,
    status varchar(50) default 'Ativo' check (status in ('Ativo', 'Suspenso', 'Inativo')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clubes/Academias/Equipes
create table public.clubes (
    id uuid primary key default uuid_generate_v4(),
    nome varchar(255) not null,
    sigla varchar(10) not null unique,
    tipo varchar(50) not null check (tipo in ('Clube', 'Federação', 'Academia', 'Equipe')),
    federacao_id uuid references public.federacoes(id),
    cidade varchar(150),
    estado char(2),
    situacao varchar(50) default 'Ativo' check (situacao in ('Ativo', 'Pendente', 'Suspenso')),
    anuidade_status varchar(50) default 'Pendente' check (anuidade_status in ('Pago', 'Pendente', 'Atrasado')),
    anuidade_vencimento date,
    anuidade_valor decimal(12, 2) not null default 1500.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cadastro Único de Atletas
create table public.atletas (
    id uuid primary key default uuid_generate_v4(),
    nome varchar(255) not null,
    sexo char(1) not null check (sexo in ('M', 'F')),
    nascimento date not null,
    nacionalidade varchar(100) default 'Brasil',
    clube_id uuid references public.clubes(id),
    registro varchar(50) not null unique,
    categoria varchar(50),
    status varchar(50) default 'Ativo' check (status in ('Ativo', 'Inativo', 'Suspenso')),
    foto_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Oficiais de Arbitragem
create table public.arbitros (
    id uuid primary key default uuid_generate_v4(),
    nome varchar(255) not null,
    funcao_principal varchar(100) not null,
    federacao_id uuid references public.federacoes(id),
    formacao text[],
    certificacoes text[],
    clinicas text[],
    nivel varchar(50) default 'Regional' check (nivel in ('Regional', 'Nacional', 'Internacional FINA')),
    elegivel boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Competições
create table public.competicoes (
    id uuid primary key default uuid_generate_v4(),
    nome varchar(255) not null,
    sigla varchar(50) not null unique,
    tipo varchar(50) not null check (tipo in ('Nacional', 'Estadual', 'Regional', 'Copa', 'Circuito', 'Festival')),
    data_inicio date not null,
    data_fim date not null,
    cidade varchar(150),
    estado char(2),
    piscina varchar(20) not null check (piscina in ('25m', '50m')),
    raias integer not null default 8,
    status varchar(50) default 'Planejamento' check (status in ('Planejamento', 'Inscrições abertas', 'Inscrições encerradas', 'Em andamento', 'Encerrada', 'Homologada')),
    regulamento_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Provas das Competições
create table public.provas (
    id uuid primary key default uuid_generate_v4(),
    competicao_id uuid references public.competicoes(id) on delete cascade,
    estilo varchar(50) not null check (estilo in ('Livre', 'Costas', 'Peito', 'Borboleta', 'Medley', 'Revezamento')),
    distancia varchar(50) not null,
    sexo char(1) not null check (sexo in ('M', 'F', 'Misto')),
    categoria varchar(50) not null,
    fase varchar(50) default 'Final Direta' check (fase in ('Eliminatórias', 'Semifinais', 'Finais', 'Final Direta')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inscrições em Provas
create table public.inscricoes (
    id uuid primary key default uuid_generate_v4(),
    atleta_id uuid references public.atletas(id) on delete cascade,
    prova_id uuid references public.provas(id) on delete cascade,
    tempo_inscricao interval not null,
    piscina_inscricao varchar(20) check (piscina_inscricao in ('25m', '50m')),
    paga boolean default false,
    indice_atingido boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(atleta_id, prova_id)
);

-- Balizamento (Séries/Raias)
create table public.balizamentos (
    id uuid primary key default uuid_generate_v4(),
    prova_id uuid references public.provas(id) on delete cascade,
    atleta_id uuid references public.atletas(id) on delete cascade,
    serie integer not null,
    raia integer not null check (raia between 1 and 10),
    status varchar(50) default 'Confirmado' check (status in ('Confirmado', 'Scratch', 'DNS')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cronometragem Eletrônica (Toques das placas)
create table public.cronometragens (
    id uuid primary key default uuid_generate_v4(),
    balizamento_id uuid references public.balizamentos(id) on delete cascade,
    reacao decimal(5,2),
    split_50m interval,
    split_100m interval,
    tempo_toque interval not null,
    early_takeoff decimal(5,2),
    contingencia_manual boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Resultados Homologados
create table public.resultados (
    id uuid primary key default uuid_generate_v4(),
    prova_id uuid references public.provas(id) on delete cascade,
    atleta_id uuid references public.atletas(id) on delete cascade,
    tempo_final interval not null,
    reacao decimal(5,2),
    colocacao integer,
    pontos_fina integer,
    status varchar(50) default 'Aprovado' check (status in ('Aprovado', 'DQ', 'Pendente')),
    recorde_quebrado varchar(20), -- WR, AR, BR, ER, CR
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela Oficial de Recordes
create table public.recordes (
    id uuid primary key default uuid_generate_v4(),
    prova varchar(100) not null,
    tempo interval not null,
    atleta varchar(255) not null,
    clube varchar(255),
    tipo varchar(50) not null check (tipo in ('Mundial', 'Sul-Americano', 'Brasileiro', 'Estadual', 'Competição')),
    data_marca date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Módulo de Protestos
create table public.protestos (
    id uuid primary key default uuid_generate_v4(),
    competicao_id uuid references public.competicoes(id) on delete cascade,
    prova_id uuid references public.provas(id) on delete cascade,
    clube_id uuid references public.clubes(id),
    atleta_id uuid references public.atletas(id),
    data_protesto date not null,
    status varchar(50) default 'Aberto' check (status in ('Aberto', 'Em análise', 'Julgado', 'Deferido', 'Indeferido')),
    descricao text not null,
    anexos text[],
    custo decimal(12,2) default 500.00,
    resolucao text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transações Financeiras (Anuidades/Taxas)
create table public.financeiro_transacoes (
    id uuid primary key default uuid_generate_v4(),
    tipo varchar(50) not null check (tipo in ('Anuidade Clube', 'Taxa Inscrição', 'Anuidade Atleta', 'Taxa Protesto', 'Multa')),
    origem_nome varchar(255) not null,
    data_transacao date not null,
    valor decimal(12,2) not null,
    status varchar(50) default 'Pendente' check (status in ('Pago', 'Pendente', 'Cancelado')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Logs de Auditoria de Segurança
create table public.auditoria_logs (
    id uuid primary key default uuid_generate_v4(),
    usuario_email varchar(255) not null,
    perfil varchar(50) not null,
    acao text not null,
    ip_origem inet,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ===========================================================================
-- 3. TRIGGERS & FUNÇÕES DE AUTOMAÇÃO
-- ===========================================================================

-- A. Cálculo Automático de Categoria
create or replace function public.fn_calcular_categoria()
returns trigger as $$
declare
    idade integer;
begin
    idade := extract(year from now()) - extract(year from new.nascimento);
    if idade <= 8 then
        new.categoria := 'Pré-Mirim';
    elsif idade <= 10 then
        new.categoria := 'Mirim';
    elsif idade <= 12 then
        new.categoria := 'Petiz';
    elsif idade <= 14 then
        new.categoria := 'Infantil';
    elsif idade <= 16 then
        new.categoria := 'Juvenil';
    elsif idade <= 18 then
        new.categoria := 'Júnior';
    else
        new.categoria := 'Sênior';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_calcular_categoria
before insert or update of nascimento on public.atletas
for each row execute function public.fn_calcular_categoria();


-- B. Auditoria Geral
create or replace function public.fn_registrar_auditoria()
returns trigger as $$
begin
    insert into public.auditoria_logs (usuario_email, perfil, acao, ip_origem)
    values (
        coalesce(current_setting('request.jwt.claim.email', true), 'sistema@aquaflow.app'),
        coalesce(current_setting('request.jwt.claim.role', true), 'Serviço'),
        TG_OP || ' na tabela ' || TG_TABLE_NAME || ' - ID: ' || coalesce(new.id::text, old.id::text),
        inet_client_addr()
    );
    return new;
end;
$$ language plpgsql;

create trigger tr_auditoria_atletas
after insert or update or delete on public.atletas
for each row execute function public.fn_registrar_auditoria();

create trigger tr_auditoria_resultados
after insert or update or delete on public.resultados
for each row execute function public.fn_registrar_auditoria();


-- ===========================================================================
-- 4. VIEWS & MATERIALIZED VIEWS (ANALYTICS)
-- ===========================================================================

-- Ranking Nacional de Nadadores por prova/sexo/piscina
create or replace view public.v_ranking_nacional as
select 
    dense_rank() over (partition by p.estilo, p.distancia, a.sexo, cp.piscina order by r.tempo_final asc) as posicao,
    a.nome as atleta,
    a.registro,
    a.sexo,
    a.categoria,
    cl.nome as clube,
    f.sigla as federacao,
    p.estilo,
    p.distancia,
    cp.piscina,
    r.tempo_final as tempo,
    r.pontos_fina
from public.resultados r
join public.atletas a on r.atleta_id = a.id
join public.clubes cl on a.clube_id = cl.id
join public.federacoes f on cl.federacao_id = f.id
join public.provas p on r.prova_id = p.id
join public.competicoes cp on p.competicao_id = cp.id
where r.status = 'Aprovado';

-- Materialized View para estatísticas de receitas
create materialized view public.mv_financeiro_dashboard as
select 
    tipo,
    status,
    sum(valor) as valor_total,
    count(*) as total_transacoes,
    date_trunc('month', data_transacao) as mes
from public.financeiro_transacoes
group by tipo, status, date_trunc('month', data_transacao);


-- ===========================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================================================

-- Habilitação RLS
alter table public.atletas enable row level security;
alter table public.clubes enable row level security;
alter table public.resultados enable row level security;
alter table public.protestos enable row level security;
alter table public.financeiro_transacoes enable row level security;

-- A. Políticas para ATLETAS (Leitura pública, escrita apenas admin/fed)
create policy "Atletas são visíveis para qualquer usuário cadastrado ou público"
on public.atletas for select
using (true);

create policy "Atletas podem ser criados/atualizados apenas por confederações ou federações"
on public.atletas for all
using (
    auth.role() in ('authenticated') 
    and (current_setting('request.jwt.claim.role', true) in ('Super Admin', 'Confederação', 'Federação'))
);

-- B. Políticas para RESULTADOS (Leitura pública, inserção árbitro/admin)
create policy "Resultados são públicos"
on public.resultados for select
using (true);

create policy "Resultados inseridos apenas por árbitros ou admins"
on public.resultados for all
using (
    auth.role() in ('authenticated')
    and (current_setting('request.jwt.claim.role', true) in ('Super Admin', 'Federação', 'Árbitro'))
);

-- C. Políticas para FINANCEIRO (Apenas gestores e proprietário do clube)
create policy "Gestores podem ver todas as transações"
on public.financeiro_transacoes for select
using (
    current_setting('request.jwt.claim.role', true) in ('Super Admin', 'Confederação', 'Federação')
);

create policy "Clubes podem visualizar suas próprias cobranças de anuidades"
on public.financeiro_transacoes for select
using (
    current_setting('request.jwt.claim.role', true) = 'Clube' 
    and origem_nome = (select nome from public.clubes where id::text = current_setting('request.jwt.claim.club_id', true))
);
