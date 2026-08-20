import {api} from './api';

export type AlunoPerfil = {
    username: string;
    nome: string;
    nomeSocial: string;
    cpf: string;
    rg: string;
    dataNascimento: string | null;
    email: string;
    telefone: string;
    celular: string;
    foto: string;
    nomePai: string;
    nomeMae: string;
    nomeReferencia: string;
    telefoneReferencia: string;
    facebook: string;
    twitter: string;
    telefoneComercial: string;
    genero: string;
    etnia: string;
    escolaridade: string;
    estadoCivil: string;
};

export type Matricula = {
    id: number;
    curso: string;
    componente: string;
    unidade: string;
    turma: number | null;
    periodo: string;
    ano: number | null;
    status: string | null;
    data: string | null;
    mediaFinal: number | null;
    percentualPresenca: number | null;
    qtdeAula: number | null;
    qtdeAulaFeita: number | null;
    qtdeAulaPresente: number | null;
    qtdeAulaMeiaPresente: number | null;
    qtdeFalta: number | null;
    qtdeAulaAtrasado: number | null;
    professor: string;
};

export type BoletimResumo = {
    matricula: Matricula;
    media: number | null;
    status: string;
    frequenciaPerc: number | null;
};

export type DashboardData = {
    matriculas: Matricula[];
    boletins: BoletimResumo[];
};

export type Avaliacao = { ordem: number | null; nota: number | null; conceito: string };

export type GrauNota = {
    id: number;
    idGrauNota: number;
    nome: string;
    numeroNota: number | null;
    peso: number | null;
    nota: number | null;
    avaliacoes: Avaliacao[];
};

export type Grau = {
    id: number;
    descricao: string;
    notaMaxima: number | null;
    mediaSemExame: number | null;
    mediaFinal: number | null;
    frequenciaMinima: number | null;
    notas: GrauNota[];
};

export type Boletim = {
    matricula: Matricula;
    graus: Grau[];
    media: number | null;
    status: string;
    frequenciaPerc: number | null;
};

export type Ocorrencia = { data: string | null; presenca: string; presencaDescricao: string; componente: string };

export type Frequencia = {
    matricula: Matricula;
    ocorrencias: Ocorrencia[];
    aulasRealizadas: number;
    presentes: number;
    meias: number;
    ausentes: number;
    atestados: number;
    atrasos: number;
    semMarcacao: number;
    canceladas: number;
    prorrogadas: number;
    frequenciaPerc: number | null;
    ausenciaPerc: number | null;
};

export const alunoApi = {
    perfil: () => api.get<AlunoPerfil>('/api/aluno/perfil').then(r => r.data),
    dashboard: () => api.get<DashboardData>('/api/aluno/dashboard').then(r => r.data),
    matriculas: () => api.get<Matricula[]>('/api/aluno/matriculas').then(r => r.data),
    boletim: () => api.get<Boletim[]>('/api/aluno/boletim').then(r => r.data),
    boletimDetalhe: (matriculaId: number) => api.get<Boletim>(`/api/aluno/boletim/${matriculaId}`).then(r => r.data),
    frequencia: (matriculaId: number) => api.get<Frequencia>(`/api/aluno/frequencia/${matriculaId}`).then(r => r.data),
    financeiro: () => api.get<Financeiro>('/api/aluno/financeiro').then(r => r.data),
    chamadas: () => api.get<AulaAluno[]>('/api/aluno/chamadas').then(r => r.data),
    avaliacoes: () => api.get<AvaliacaoAluno[]>('/api/aluno/avaliacoes').then(r => r.data),
};

export type ResumoFinanceiro = {
    situacao: string;
    diasAtraso: number | null;
    qtdParcelasAtrasadas: number | null;
    qtdParcelasRestantes: number | null;
    valorPendente: number | null;
};

export type Parcela = {
    id: number | null;
    contratoId: number | null;
    parcela: number | null;
    parcelaSequencia: number | null;
    multa: number | null;
    juros: number | null;
    desconto: number | null;
    dataVencimento: string | null;
    dataPagamento: string | null;
    dataCancelamento: string | null;
    valor: number | null;
    valorPago: number | null;
    tipoPagamento: string;
    reparcela: boolean;
    cancelamento: boolean;
    original: boolean;
    vendaProduto: boolean;
    multaLivro: boolean;
    descricao: string;
    descricaoCor: string;
    situacao: string;
    situacaoCor: string;
};

export type ContratoFinanceiro = {
    id: number | null;
    curso: string;
    unidade: string;
    unidadeResponsavel: string;
    status: string;
    qtdeReparcelamento: number | null;
    proximaParcelaSequencia: number | null;
    proximaParcelaData: string | null;
    proximaParcelaValor: number | null;
    ultimaParcelaSequencia: number | null;
    ultimaParcelaData: string | null;
    ultimaParcelaValor: number | null;
};

export type Financeiro = {
    resumo: ResumoFinanceiro;
    contratos: ContratoFinanceiro[];
    parcelasMes: Parcela[];
    parcelasMatricula: Parcela[];
    parcelasProdutos: Parcela[];
    parcelasCanceladas: Parcela[];
};

export function formatarMoeda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '-';
    return valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

export function formatarNota(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '-';
    return valor.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 2});
}

export function formatarPercentual(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '-';
    return `${valor.toLocaleString('pt-BR', {maximumFractionDigits: 1})}%`;
}

export function formatarData(valor: string | null | undefined): string {
    if (!valor) return '-';
    const [ano, mes, dia] = valor.split('T')[0].split('-');
    if (!ano || !mes || !dia) return valor;
    return `${dia}/${mes}/${ano}`;
}

export type AulaAluno = {
    id: number;
    nome: string;
    descricao: string;
    componente: string;
    turma: string;
    dataAssistida?: string;
};

export type AvaliacaoPergunta = {
    id: number;
    nome: string;
    descricao: string;
};

export type AvaliacaoResposta = {
    id: number;
    id_avaliacao_pergunta: number;
    resposta: string;
    nota: number | null;
    conceito: string | null;
};

export type AvaliacaoAluno = {
    id: number;
    id_avaliacao: number;
    id_avaliacao_pergunta: number;
    descricao_pergunta: string;
    resposta?: string;
    nota?: number;
    conceito?: string;
};
