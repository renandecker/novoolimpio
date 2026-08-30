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
    perfil: () => api.get<AlunoPerfil>('/api/aluno/perfil').then((r) => r.data),
    dashboard: () => api.get<DashboardData>('/api/aluno/dashboard').then((r) => r.data),
    matriculas: () => api.get<Matricula[]>('/api/aluno/matriculas').then((r) => r.data),
    boletim: () => api.get<Boletim[]>('/api/aluno/boletim').then((r) => r.data),
    boletimDetalhe: (matriculaId: number) => api.get<Boletim>(`/api/aluno/boletim/${matriculaId}`).then((r) => r.data),
    frequencia: (matriculaId: number) => api.get<Frequencia>(`/api/aluno/frequencia/${matriculaId}`).then((r) => r.data),
};

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
