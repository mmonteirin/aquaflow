// Sample/demo data for the Swimming Competition Management System (AquaFlow).
// Emulating production-ready database tables.

export type Status =
  | "Planejamento"
  | "Inscrições abertas"
  | "Inscrições encerradas"
  | "Em andamento"
  | "Encerrada"
  | "Homologada";

export interface Competition {
  id: string;
  nome: string;
  sigla: string;
  tipo: "Nacional" | "Estadual" | "Regional" | "Copa" | "Circuito" | "Festival";
  dataInicio: string;
  dataFim: string;
  cidade: string;
  estado: string;
  pais: string;
  piscina: "25m" | "50m";
  raias: number;
  status: Status;
  atletas: number;
  clubes: number;
  regulamentoUrl?: string;
  sessoes?: number;
}

export interface ClubDocument {
  id: string;
  nome: string;
  tipo: "Estatuto" | "Contrato" | "Ata" | "Certidão";
  dataEnvio: string;
  status: "Homologado" | "Em Análise" | "Recusado";
}

export interface Club {
  id: string;
  nome: string;
  sigla: string;
  tipo: "Clube" | "Federação" | "Academia" | "Equipe";
  federacao: string;
  cidade: string;
  estado: string;
  pais: string;
  atletas: number;
  situacao: "Ativo" | "Pendente" | "Suspenso";
  anuidadeStatus: "Pago" | "Pendente" | "Atrasado";
  anuidadeVencimento: string;
  anuidadeValor: number;
  documentos: ClubDocument[];
}

export interface AthleteTransfer {
  data: string;
  origem: string;
  destino: string;
  taxa: number;
  status: "Homologado" | "Em Processamento";
}

export interface AthleteHistoryResult {
  data: string;
  competicao: string;
  prova: string;
  tempo: string;
  colocacao: number;
  pontos: number;
}

export interface AthleteTimelineEvent {
  data: string;
  titulo: string;
  descricao: string;
  iconType: "registro" | "transferencia" | "recorde" | "competicao";
}

export interface Athlete {
  id: string;
  nome: string;
  sexo: "M" | "F";
  nascimento: string;
  nacionalidade: string;
  clube: string;
  registro: string;
  categoria: string;
  status: "Ativo" | "Inativo" | "Suspenso";
  foto: string;
  clubesAnteriores: string[];
  transferencias: AthleteTransfer[];
  resultadosHistoricos: AthleteHistoryResult[];
  timeline: AthleteTimelineEvent[];
}

export interface Result {
  colocacao: number;
  atleta: string;
  clube: string;
  tempo: string;
  status: "Aprovado" | "DQ" | "Pendente";
  prova: string;
  reacao?: string;
  split50m?: string;
}

export interface Official {
  id: string;
  nome: string;
  funcao: string;
  federacao: string;
  competicao: string;
  formacao: string[];
  certificacoes: string[];
  clinicas: string[];
  escalas: { competicao: string; prova: string; posicao: string }[];
  avaliacoes: number;
  atuacaoAnual: number;
  nivel: "Regional" | "Nacional" | "Internacional FINA";
  elegivel: boolean;
}

export interface Protest {
  id: string;
  competicao: string;
  prova: string;
  clube: string;
  atleta: string;
  data: string;
  status: "Aberto" | "Em análise" | "Julgado" | "Deferido" | "Indeferido";
  descricao: string;
  anexos: string[];
  custo: number;
  resolucao?: string;
}

export interface FinancialTransaction {
  id: string;
  tipo: "Anuidade Clube" | "Taxa Inscrição" | "Anuidade Atleta" | "Taxa Protesto" | "Multa";
  origem: string;
  data: string;
  valor: number;
  status: "Pago" | "Pendente" | "Cancelado";
}

export interface AuditLog {
  id: string;
  data: string;
  usuario: string;
  perfil: string;
  acao: string;
  ip: string;
}

export const competitions: Competition[] = [
  {
    id: "1",
    nome: "Campeonato Brasileiro Absoluto - Troféu Brasil",
    sigla: "TROFEUBR",
    tipo: "Nacional",
    dataInicio: "2026-07-12",
    dataFim: "2026-07-17",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    pais: "Brasil",
    piscina: "50m",
    raias: 8,
    status: "Inscrições abertas",
    atletas: 612,
    clubes: 48,
    sessoes: 10,
    regulamentoUrl: "/docs/regulamento_trofeu_brasil.pdf",
  },
  {
    id: "2",
    nome: "Troféu José Finkel - Camp. Brasileiro",
    sigla: "FINKEL",
    tipo: "Nacional",
    dataInicio: "2026-08-20",
    dataFim: "2026-08-24",
    cidade: "São Paulo",
    estado: "SP",
    pais: "Brasil",
    piscina: "25m",
    raias: 8,
    status: "Planejamento",
    atletas: 540,
    clubes: 41,
    sessoes: 8,
  },
  {
    id: "3",
    nome: "Copa Norte-Nordeste de Clubes",
    sigla: "CNN",
    tipo: "Regional",
    dataInicio: "2026-09-08",
    dataFim: "2026-09-10",
    cidade: "Recife",
    estado: "PE",
    pais: "Brasil",
    piscina: "50m",
    raias: 8,
    status: "Em andamento",
    atletas: 320,
    clubes: 27,
    sessoes: 6,
  },
  {
    id: "4",
    nome: "Campeonato Estadual Paulista",
    sigla: "PAULISTA",
    tipo: "Estadual",
    dataInicio: "2026-11-14",
    dataFim: "2026-11-16",
    cidade: "Santos",
    estado: "SP",
    pais: "Brasil",
    piscina: "25m",
    raias: 8,
    status: "Homologada",
    atletas: 410,
    clubes: 29,
    sessoes: 4,
  },
  {
    id: "5",
    nome: "Circuito Nacional de Velocidade",
    sigla: "CIRCUITO_VEL",
    tipo: "Circuito",
    dataInicio: "2026-12-05",
    dataFim: "2026-12-06",
    cidade: "Curitiba",
    estado: "PR",
    pais: "Brasil",
    piscina: "25m",
    raias: 8,
    status: "Planejamento",
    atletas: 180,
    clubes: 15,
    sessoes: 4,
  },
];

export const clubs: Club[] = [
  {
    id: "1",
    nome: "Minas Tênis Clube",
    sigla: "MTC",
    tipo: "Clube",
    federacao: "FAM-MG",
    cidade: "Belo Horizonte",
    estado: "MG",
    pais: "Brasil",
    atletas: 84,
    situacao: "Ativo",
    anuidadeStatus: "Pago",
    anuidadeVencimento: "2027-01-31",
    anuidadeValor: 1500,
    documentos: [
      {
        id: "doc-1",
        nome: "Estatuto Social 2026",
        tipo: "Estatuto",
        dataEnvio: "2026-01-15",
        status: "Homologado",
      },
      {
        id: "doc-2",
        nome: "Certidão de Regularidade",
        tipo: "Certidão",
        dataEnvio: "2026-05-10",
        status: "Homologado",
      },
    ],
  },
  {
    id: "2",
    nome: "SESI-SP",
    sigla: "SESI",
    tipo: "Clube",
    federacao: "FAP-SP",
    cidade: "São Paulo",
    estado: "SP",
    pais: "Brasil",
    atletas: 76,
    situacao: "Ativo",
    anuidadeStatus: "Pago",
    anuidadeVencimento: "2026-12-31",
    anuidadeValor: 1500,
    documentos: [
      {
        id: "doc-3",
        nome: "Ata de Eleição Diretoria",
        tipo: "Ata",
        dataEnvio: "2025-11-20",
        status: "Homologado",
      },
    ],
  },
  {
    id: "3",
    nome: "Clube de Regatas do Flamengo",
    sigla: "FLA",
    tipo: "Clube",
    federacao: "FARJ-RJ",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    pais: "Brasil",
    atletas: 71,
    situacao: "Ativo",
    anuidadeStatus: "Pago",
    anuidadeVencimento: "2026-11-30",
    anuidadeValor: 1500,
    documentos: [
      {
        id: "doc-4",
        nome: "Contrato de Afiliação",
        tipo: "Contrato",
        dataEnvio: "2026-02-14",
        status: "Homologado",
      },
    ],
  },
  {
    id: "4",
    nome: "Esporte Clube Pinheiros",
    sigla: "PIN",
    tipo: "Clube",
    federacao: "FAP-SP",
    cidade: "São Paulo",
    estado: "SP",
    pais: "Brasil",
    atletas: 68,
    situacao: "Ativo",
    anuidadeStatus: "Pendente",
    anuidadeVencimento: "2026-06-30",
    anuidadeValor: 1500,
    documentos: [
      {
        id: "doc-5",
        nome: "Estatuto Vigente",
        tipo: "Estatuto",
        dataEnvio: "2026-06-01",
        status: "Em Análise",
      },
    ],
  },
  {
    id: "5",
    nome: "Grêmio Náutico União",
    sigla: "GNU",
    tipo: "Clube",
    federacao: "FGDA-RS",
    cidade: "Porto Alegre",
    estado: "RS",
    pais: "Brasil",
    atletas: 52,
    situacao: "Suspenso",
    anuidadeStatus: "Atrasado",
    anuidadeVencimento: "2026-03-31",
    anuidadeValor: 1500,
    documentos: [
      {
        id: "doc-6",
        nome: "Demonstrativo 2025",
        tipo: "Ata",
        dataEnvio: "2026-03-10",
        status: "Recusado",
      },
    ],
  },
  {
    id: "6",
    nome: "Associação Aquática Praia Clube",
    sigla: "PRC",
    tipo: "Academia",
    federacao: "FAM-MG",
    cidade: "Uberlândia",
    estado: "MG",
    pais: "Brasil",
    atletas: 47,
    situacao: "Ativo",
    anuidadeStatus: "Pago",
    anuidadeVencimento: "2026-10-15",
    anuidadeValor: 1200,
    documentos: [],
  },
];

export const athletes: Athlete[] = [
  {
    id: "1",
    nome: "João Silva",
    sexo: "M",
    nascimento: "2002-03-11",
    nacionalidade: "Brasil",
    clube: "Minas Tênis Clube",
    registro: "MG-10234",
    categoria: "Sênior",
    status: "Ativo",
    foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: ["Flamengo", "Praia Clube"],
    transferencias: [
      {
        data: "2025-01-10",
        origem: "Flamengo",
        destino: "Minas Tênis Clube",
        taxa: 250,
        status: "Homologado",
      },
      {
        data: "2023-04-12",
        origem: "Praia Clube",
        destino: "Flamengo",
        taxa: 200,
        status: "Homologado",
      },
    ],
    resultadosHistoricos: [
      {
        data: "2026-04-13",
        competicao: "Troféu Brasil",
        prova: "100m Livre",
        tempo: "00:48.21",
        colocacao: 1,
        pontos: 910,
      },
      {
        data: "2026-04-15",
        competicao: "Troféu Brasil",
        prova: "50m Livre",
        tempo: "00:21.45",
        colocacao: 1,
        pontos: 935,
      },
    ],
    timeline: [
      {
        data: "2026-04-15",
        titulo: "Recorde Brasileiro Estabelecido",
        descricao: "Bateu o recorde nacional dos 50m Livre com o tempo de 21.45s",
        iconType: "recorde",
      },
      {
        data: "2025-01-10",
        titulo: "Transferência de Clube",
        descricao: "Transferido oficialmente do Flamengo para o Minas Tênis Clube",
        iconType: "transferencia",
      },
      {
        data: "2021-03-01",
        titulo: "Primeiro Registro Nacional",
        descricao: "Inscrição homologada pela Confederação Brasileira de Desportos Aquáticos",
        iconType: "registro",
      },
    ],
  },
  {
    id: "2",
    nome: "Pedro Alencar",
    sexo: "M",
    nascimento: "2004-07-22",
    nacionalidade: "Brasil",
    clube: "SESI-SP",
    registro: "SP-20891",
    categoria: "Sênior",
    status: "Ativo",
    foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: [],
    transferencias: [],
    resultadosHistoricos: [
      {
        data: "2026-04-14",
        competicao: "Troféu Brasil",
        prova: "200m Medley",
        tempo: "01:58.34",
        colocacao: 1,
        pontos: 885,
      },
    ],
    timeline: [
      {
        data: "2026-04-14",
        titulo: "Recorde Sul-Americano",
        descricao: "Registrou 1:58.34 nos 200m Medley no Troféu Brasil",
        iconType: "recorde",
      },
      {
        data: "2022-02-15",
        titulo: "Registro Profissional",
        descricao: "Cadastrado no SESI-SP sob chancela da FAP",
        iconType: "registro",
      },
    ],
  },
  {
    id: "3",
    nome: "Lucas Ferreira",
    sexo: "M",
    nascimento: "2001-12-05",
    nacionalidade: "Brasil",
    clube: "Clube de Regatas do Flamengo",
    registro: "RJ-30122",
    categoria: "Sênior",
    status: "Ativo",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: ["Minas Tênis Clube"],
    transferencias: [
      {
        data: "2024-08-01",
        origem: "Minas Tênis Clube",
        destino: "Clube de Regatas do Flamengo",
        taxa: 300,
        status: "Homologado",
      },
    ],
    resultadosHistoricos: [
      {
        data: "2026-03-09",
        competicao: "Copa Norte-Nordeste",
        prova: "100m Costas",
        tempo: "00:53.12",
        colocacao: 1,
        pontos: 870,
      },
    ],
    timeline: [
      {
        data: "2026-03-09",
        titulo: "Recorde do Campeonato",
        descricao: "Bateu o recorde da Copa N-NE nos 100m Costas (53.12s)",
        iconType: "recorde",
      },
      {
        data: "2024-08-01",
        titulo: "Troca de Clube",
        descricao: "Transacionado para o Flamengo",
        iconType: "transferencia",
      },
    ],
  },
  {
    id: "4",
    nome: "Gustavo Lima",
    sexo: "M",
    nascimento: "2005-09-18",
    nacionalidade: "Brasil",
    clube: "Esporte Clube Pinheiros",
    registro: "SP-20455",
    categoria: "Sênior",
    status: "Ativo",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: [],
    transferencias: [],
    resultadosHistoricos: [],
    timeline: [
      {
        data: "2023-01-20",
        titulo: "Filiação à FAP",
        descricao: "Cadastro homologado",
        iconType: "registro",
      },
    ],
  },
  {
    id: "5",
    nome: "Mariana Costa",
    sexo: "F",
    nascimento: "2007-01-30",
    nacionalidade: "Brasil",
    clube: "Minas Tênis Clube",
    registro: "MG-10987",
    categoria: "Júnior",
    status: "Ativo",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: [],
    transferencias: [],
    resultadosHistoricos: [
      {
        data: "2026-04-14",
        competicao: "Troféu Brasil",
        prova: "100m Borboleta",
        tempo: "00:57.45",
        colocacao: 1,
        pontos: 895,
      },
    ],
    timeline: [
      {
        data: "2026-04-14",
        titulo: "Recorde de Categoria",
        descricao: "Bateu o recorde Júnior de 100m Borboleta",
        iconType: "recorde",
      },
      {
        data: "2024-03-01",
        titulo: "Registro Atleta",
        descricao: "Registrada pela FAM-MG",
        iconType: "registro",
      },
    ],
  },
  {
    id: "6",
    nome: "Ana Beatriz",
    sexo: "F",
    nascimento: "2008-06-14",
    nacionalidade: "Brasil",
    clube: "Grêmio Náutico União",
    registro: "RS-40231",
    categoria: "Júnior",
    status: "Suspenso",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: [],
    transferencias: [],
    resultadosHistoricos: [],
    timeline: [
      {
        data: "2026-05-01",
        titulo: "Suspensão Administrativa",
        descricao: "Suspensão temporária devido a falta de exame médico atualizado",
        iconType: "registro",
      },
    ],
  },
  {
    id: "7",
    nome: "Camila Rocha",
    sexo: "F",
    nascimento: "2002-11-09",
    nacionalidade: "Brasil",
    clube: "Associação Aquática Praia Clube",
    registro: "MG-10772",
    categoria: "Sênior",
    status: "Ativo",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    clubesAnteriores: [],
    transferencias: [],
    resultadosHistoricos: [
      {
        data: "2026-02-15",
        competicao: "Estadual Mineiro",
        prova: "200m Peito",
        tempo: "02:24.88",
        colocacao: 1,
        pontos: 882,
      },
    ],
    timeline: [
      {
        data: "2026-02-15",
        titulo: "Recorde da Competição",
        descricao: "Bateu o recorde do Estadual Mineiro nos 200m Peito",
        iconType: "recorde",
      },
    ],
  },
];

export const results: Result[] = [
  {
    colocacao: 1,
    atleta: "João Silva",
    clube: "Minas Tênis Clube",
    tempo: "00:51.23",
    status: "Aprovado",
    prova: "100m Livre",
    reacao: "0.64",
    split50m: "24.81",
  },
  {
    colocacao: 2,
    atleta: "Pedro Alencar",
    clube: "SESI-SP",
    tempo: "00:51.87",
    status: "Aprovado",
    prova: "100m Livre",
    reacao: "0.71",
    split50m: "25.02",
  },
  {
    colocacao: 3,
    atleta: "Lucas Ferreira",
    clube: "Clube de Regatas do Flamengo",
    tempo: "00:52.10",
    status: "Aprovado",
    prova: "100m Livre",
    reacao: "0.68",
    split50m: "25.20",
  },
  {
    colocacao: 4,
    atleta: "Gustavo Lima",
    clube: "Esporte Clube Pinheiros",
    tempo: "00:52.45",
    status: "Aprovado",
    prova: "100m Livre",
    reacao: "0.67",
    split50m: "25.44",
  },
  {
    colocacao: 5,
    atleta: "Rafael Souza",
    clube: "Grêmio Náutico União",
    tempo: "00:52.98",
    status: "DQ",
    prova: "100m Livre",
    reacao: "0.73",
    split50m: "25.61",
  },
];

export const participationByClub = [
  { name: "Minas TC", value: 35 },
  { name: "SESI-SP", value: 25 },
  { name: "Flamengo", value: 20 },
  { name: "Pinheiros", value: 10 },
  { name: "Outros", value: 10 },
];

export const enrollmentByCategory = [
  { categoria: "Infantil", inscricoes: 320 },
  { categoria: "Juvenil", inscricoes: 480 },
  { categoria: "Júnior", inscricoes: 540 },
  { categoria: "Sênior", inscricoes: 720 },
];

export const enrollmentTrend = [
  { mes: "Jan", inscricoes: 120 },
  { mes: "Fev", inscricoes: 260 },
  { mes: "Mar", inscricoes: 410 },
  { mes: "Abr", inscricoes: 680 },
  { mes: "Mai", inscricoes: 940 },
  { mes: "Jun", inscricoes: 1248 },
];

export const events = [
  { estilo: "Livre", distancias: ["50m", "100m", "200m", "400m", "800m", "1500m"] },
  { estilo: "Costas", distancias: ["50m", "100m", "200m"] },
  { estilo: "Peito", distancias: ["50m", "100m", "200m"] },
  { estilo: "Borboleta", distancias: ["50m", "100m", "200m"] },
  { estilo: "Medley", distancias: ["200m", "400m"] },
  { estilo: "Revezamento", distancias: ["4x100 Livre", "4x200 Livre", "4x100 Medley"] },
];

export const records = [
  {
    prova: "50m Livre",
    atleta: "João Silva",
    clube: "Minas TC",
    tempo: "21.45",
    tipo: "Nacional",
    data: "2026-04-13",
  },
  {
    prova: "100m Costas",
    atleta: "Lucas Ferreira",
    clube: "Flamengo",
    tempo: "53.12",
    tipo: "Estadual",
    data: "2026-03-09",
  },
  {
    prova: "200m Peito",
    atleta: "Camila Rocha",
    clube: "Praia Clube",
    tempo: "2:24.88",
    tipo: "Competição",
    data: "2026-02-15",
  },
  {
    prova: "200m Medley",
    atleta: "Pedro Alencar",
    clube: "SESI-SP",
    tempo: "1:58.34",
    tipo: "Continental",
    data: "2026-04-14",
  },
  {
    prova: "100m Borboleta",
    atleta: "Caeleb Dressel",
    clube: "USA",
    tempo: "49.45",
    tipo: "Mundial",
    data: "2021-07-31",
  },
];

export const protests: Protest[] = [
  {
    id: "P-001",
    competicao: "Copa Norte-Nordeste",
    prova: "100m Livre",
    clube: "Clube de Regatas do Flamengo",
    atleta: "Rafael Souza",
    status: "Em análise",
    data: "2026-03-09",
    descricao:
      "Alegação de mau funcionamento da placa de toque na raia 5. Vídeo de apoio mostra toque simultâneo com raia 4.",
    anexos: ["chegada_video.mp4", "foto_toque_raia5.jpg"],
    custo: 500,
  },
  {
    id: "P-002",
    competicao: "Campeonato Absoluto",
    prova: "200m Medley",
    clube: "SESI-SP",
    atleta: "Pedro Alencar",
    status: "Deferido",
    data: "2026-04-14",
    descricao:
      "Contestação da desclassificação por pernada de golfinho no nado peito. Juiz de vídeo confirmou movimento legal.",
    anexos: ["filmagem_subaquatica.mp4"],
    custo: 500,
    resolucao: "Desclassificação anulada. Tempo oficial homologado: 1:58.34.",
  },
  {
    id: "P-003",
    competicao: "Estadual Mineiro",
    prova: "50m Costas",
    clube: "Associação Aquática Praia Clube",
    atleta: "Diego Martins",
    status: "Indeferido",
    data: "2026-02-15",
    descricao:
      "Alegação de largada falsa na raia 3. O sensor da placa marcou tempo de reação legal de +0.58s.",
    anexos: ["largada_oficial.mp4"],
    custo: 500,
    resolucao: "Largada confirmada regular de acordo com os dados do painel Colorado.",
  },
  {
    id: "P-004",
    competicao: "Open de Verão",
    prova: "4x100 Medley",
    clube: "Esporte Clube Pinheiros",
    atleta: "Equipe A",
    status: "Aberto",
    data: "2026-01-19",
    descricao: "Erro de digitação no tempo do terceiro nadador no boletim oficial.",
    anexos: [],
    custo: 500,
  },
];

export const officials: Official[] = [
  {
    id: "1",
    nome: "Carlos Mendes",
    funcao: "Árbitro Geral",
    federacao: "CBDA",
    competicao: "Campeonato Absoluto",
    formacao: ["Educação Física", "Curso Oficial FINA 2024"],
    certificacoes: ["Árbitro FINA Nível 3", "Juiz de Partida CBDA"],
    clinicas: ["Reciclagem FINA 2025", "Clínica Anti-Doping 2026"],
    escalas: [
      { competicao: "Troféu Brasil", prova: "100m Livre M. (Finais)", posicao: "Árbitro Geral" },
      {
        competicao: "Troféu Brasil",
        prova: "50m Borboleta F. (Eliminatórias)",
        posicao: "Árbitro de Partida",
      },
    ],
    avaliacoes: 9.8,
    atuacaoAnual: 14,
    nivel: "Internacional FINA",
    elegivel: true,
  },
  {
    id: "2",
    nome: "Roberta Dias",
    funcao: "Starter",
    federacao: "FAP-SP",
    competicao: "Troféu Finkel",
    formacao: ["Curso Regional de Arbitragem"],
    certificacoes: ["Starter Nacional CBDA"],
    clinicas: ["Reciclagem FAP 2026"],
    escalas: [
      { competicao: "Troféu Finkel", prova: "100m Peito F. (Série 3)", posicao: "Juiz de Largada" },
    ],
    avaliacoes: 9.2,
    atuacaoAnual: 8,
    nivel: "Nacional",
    elegivel: true,
  },
  {
    id: "3",
    nome: "Marcos Tavares",
    funcao: "Juiz de Nado",
    federacao: "FARJ-RJ",
    competicao: "Copa Norte-Nordeste",
    formacao: ["Curso de Regras FINA"],
    certificacoes: ["Juiz de Linha FARJ"],
    clinicas: ["Workshop Vídeo-Arbitragem 2025"],
    escalas: [],
    avaliacoes: 8.9,
    atuacaoAnual: 6,
    nivel: "Regional",
    elegivel: true,
  },
  {
    id: "4",
    nome: "Helena Cruz",
    funcao: "Inspetor de Voltas",
    federacao: "FAM-MG",
    competicao: "Estadual Mineiro",
    formacao: ["Curso Estadual de Cronometragem"],
    certificacoes: ["Juiz de Cronometragem FAM"],
    clinicas: [],
    escalas: [],
    avaliacoes: 9.0,
    atuacaoAnual: 11,
    nivel: "Regional",
    elegivel: true,
  },
  {
    id: "5",
    nome: "Paulo Reis",
    funcao: "Supervisor de Vídeo",
    federacao: "CBDA",
    competicao: "Campeonato Absoluto",
    formacao: ["Tecnologia da Informação", "Curso FINA Avançado"],
    certificacoes: ["Supervisor VAR Aquático", "Árbitro Nacional"],
    clinicas: ["Congresso de Arbitragem CBDA 2026"],
    escalas: [],
    avaliacoes: 9.5,
    atuacaoAnual: 12,
    nivel: "Nacional",
    elegivel: true,
  },
];

export const rankings = [
  {
    pos: 1,
    atleta: "João Silva",
    clube: "Minas Tênis Clube",
    prova: "100m Livre",
    tempo: "00:48.21",
    pontos: 910,
    sexo: "M",
    categoria: "Sênior",
    federacao: "FAM-MG",
  },
  {
    pos: 2,
    atleta: "Pedro Alencar",
    clube: "SESI-SP",
    prova: "200m Medley",
    tempo: "01:58.34",
    pontos: 885,
    sexo: "M",
    categoria: "Sênior",
    federacao: "FAP-SP",
  },
  {
    pos: 3,
    atleta: "Mariana Costa",
    clube: "Minas Tênis Clube",
    prova: "100m Borboleta",
    tempo: "00:57.45",
    pontos: 895,
    sexo: "F",
    categoria: "Júnior",
    federacao: "FAM-MG",
  },
  {
    pos: 4,
    atleta: "Lucas Ferreira",
    clube: "Clube de Regatas do Flamengo",
    prova: "100m Costas",
    tempo: "00:53.12",
    pontos: 870,
    sexo: "M",
    categoria: "Sênior",
    federacao: "FARJ-RJ",
  },
  {
    pos: 5,
    atleta: "Camila Rocha",
    clube: "Associação Aquática Praia Clube",
    prova: "200m Peito",
    tempo: "02:24.88",
    pontos: 882,
    sexo: "F",
    categoria: "Sênior",
    federacao: "FAM-MG",
  },
];

export const callRoom = [
  {
    atleta: "João Silva",
    clube: "Minas TC",
    prova: "100m Livre M. (Final)",
    serie: 1,
    raia: 4,
    status: "Presente",
    qrCodeId: "QR-ATH-001",
    traje: "Homologado",
    equipamento: "Aprovado",
  },
  {
    atleta: "Pedro Alencar",
    clube: "SESI-SP",
    prova: "100m Livre M. (Final)",
    serie: 1,
    raia: 5,
    status: "Presente",
    qrCodeId: "QR-ATH-002",
    traje: "Homologado",
    equipamento: "Aprovado",
  },
  {
    atleta: "Lucas Ferreira",
    clube: "Flamengo",
    prova: "100m Livre M. (Final)",
    serie: 1,
    raia: 3,
    status: "Aguardando",
    qrCodeId: "QR-ATH-003",
    traje: "Verificando",
    equipamento: "Pendente",
  },
  {
    atleta: "Gustavo Lima",
    clube: "Pinheiros",
    prova: "100m Livre M. (Final)",
    serie: 1,
    raia: 6,
    status: "Ausente",
    qrCodeId: "QR-ATH-004",
    traje: "Não Apresentado",
    equipamento: "Não Apresentado",
  },
];

export const financialTransactions: FinancialTransaction[] = [
  {
    id: "TX-1001",
    tipo: "Anuidade Clube",
    origem: "Minas Tênis Clube",
    data: "2026-01-10",
    valor: 1500,
    status: "Pago",
  },
  {
    id: "TX-1002",
    tipo: "Taxa Inscrição",
    origem: "SESI-SP - Troféu Brasil",
    data: "2026-06-02",
    valor: 380,
    status: "Pago",
  },
  {
    id: "TX-1003",
    tipo: "Anuidade Atleta",
    origem: "Gustavo Lima",
    data: "2026-01-20",
    valor: 150,
    status: "Pago",
  },
  {
    id: "TX-1004",
    tipo: "Taxa Protesto",
    origem: "Clube de Regatas do Flamengo",
    data: "2026-03-09",
    valor: 500,
    status: "Pago",
  },
  {
    id: "TX-1005",
    tipo: "Anuidade Clube",
    origem: "Esporte Clube Pinheiros",
    data: "2026-06-23",
    valor: 1500,
    status: "Pendente",
  },
  {
    id: "TX-1006",
    tipo: "Multa",
    origem: "Grêmio Náutico União - Atraso Reg.",
    data: "2026-04-01",
    valor: 250,
    status: "Pendente",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "LOG-5001",
    data: "2026-06-24 10:15:33",
    usuario: "admin@aquaflow.app",
    perfil: "Super Admin",
    acao: "Homologação do recorde 50m Livre de João Silva",
    ip: "186.221.43.12",
  },
  {
    id: "LOG-5002",
    data: "2026-06-24 09:44:12",
    usuario: "carlos.mendes@cbda.org.br",
    perfil: "Árbitro Geral",
    acao: "Julgamento deferido no protesto P-002",
    ip: "200.18.156.41",
  },
  {
    id: "LOG-5003",
    data: "2026-06-23 16:32:00",
    usuario: "secretaria.fap@fap.org.br",
    perfil: "Federação",
    acao: "Novo atleta registrado: Gustavo Lima",
    ip: "177.34.82.110",
  },
  {
    id: "LOG-5004",
    data: "2026-06-22 14:10:05",
    usuario: "financeiro@cbda.org.br",
    perfil: "Super Admin",
    acao: "Criação de fatura TX-1005 para EC Pinheiros",
    ip: "186.221.43.12",
  },
];
