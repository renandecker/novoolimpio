import {api} from '../../shared/services/api';

// Client da biblioteca para o ALUNO LOGADO (mobile).
// Todas as consultas pessoais usam o idUsuario da sessão, ou seja, o aluno
// enxerga e opera apenas os próprios dados (o JWT já é enviado
// automaticamente pelo interceptor do `api`).

export type ObraResumo = {
    id: number;
    titulo: string;
    subtitulo?: string | null;
    autores?: string | null;
    editora?: string | null;
    isbn?: string | null;
    edicao?: string | null;
    anoPublicacao?: number | null;
    categoria?: string | null;
    genero?: string | null;
    idioma?: string | null;
    sinopse?: string | null;
    capaUrl?: string | null;
    statusDisplay?: string | null;
};

export type ExemplarResumo = {
    id: number;
    codigoBarras?: string | null;
    tombo?: string | null;
    obra?: ObraResumo | null;
    status?: string | null;
    localizacao?: string | null;
    estante?: string | null;
    corredor?: string | null;
    prateleira?: string | null;
};

export type EmprestimoFisico = {
    id: number;
    exemplar?: ExemplarResumo | null;
    usuarioId?: number | null;
    dataRetirada?: string | null;
    dataPrevistaDevolucao?: string | null;
    dataEfetivaDevolucao?: string | null;
    quantidadeRenovacoes?: number | null;
    status?: string | null;
    observacoes?: string | null;
};

export type ReservaFisica = {
    id: number;
    usuarioId?: number | null;
    obra?: ObraResumo | null;
    dataSolicitacao?: string | null;
    posicaoFila?: number | null;
    status?: string | null;
    dataDisponibilizacao?: string | null;
    dataLimiteRetirada?: string | null;
    dataCancelamento?: string | null;
    motivoCancelamento?: string | null;
};

export type MultaFisica = {
    id: number;
    emprestimo?: EmprestimoFisico | null;
    usuarioId?: number | null;
    diasAtraso?: number | null;
    valorPorDia?: number | null;
    valorTotal?: number | null;
    motivo?: string | null;
    statusPagamento?: string | null;
    dataPagamento?: string | null;
    formaPagamento?: string | null;
    observacoes?: string | null;
};

export type ProvedorVirtual = {
    id: number;
    nome?: string | null;
    descricao?: string | null;
    urlApi?: string | null;
    suportaLti?: boolean | null;
    suportaSso?: boolean | null;
    publicoAlvo?: string | null;
    areaConhecimento?: string | null;
    logoUrl?: string | null;
    documentacaoUrl?: string | null;
    statusDisplay?: string | null;
};

export type LivroVirtual = {
    id: number;
    titulo: string;
    subtitulo?: string | null;
    autores?: string | null;
    editora?: string | null;
    isbn?: string | null;
    anoPublicacao?: number | null;
    categoria?: string | null;
    formatosDisponiveis?: string[] | null;
    tamanhoArquivoMb?: number | null;
    urlRecurso?: string | null;
    previewUrl?: string | null;
    provedor?: ProvedorVirtual | null;
    statusDisplay?: string | null;
};

export type EmprestimoVirtual = {
    id: number;
    usuarioId?: number | null;
    livroDigital?: LivroVirtual | null;
    dataInicio?: string | null;
    dataExpiracao?: string | null;
    tipoAcesso?: string | null;
    status?: string | null;
    progressoLeitura?: number | null;
    ultimaPaginaLida?: number | null;
};

function requireUsuarioId(usuarioId?: number | null): number {
    if (usuarioId === undefined || usuarioId === null) {
        throw new Error('Sessão sem usuário identificado. Faça login novamente.');
    }
    return usuarioId;
}

export const bibliotecaAlunoApi = {
    // ---- Biblioteca física (usuário logado) ----
    minhasReservas: (usuarioId?: number | null) =>
        api.get<ReservaFisica[]>(`/api/biblioteca/reserva/usuario/${requireUsuarioId(usuarioId)}`).then(r => r.data ?? []),
    meusEmprestimosAtivos: (usuarioId?: number | null) =>
        api.get<EmprestimoFisico[]>(`/api/biblioteca/emprestimo/usuario/${requireUsuarioId(usuarioId)}/ativos`).then(r => r.data ?? []),
    minhasMultas: (usuarioId?: number | null) =>
        api.get<MultaFisica[]>(`/api/biblioteca/multa/usuario/${requireUsuarioId(usuarioId)}`).then(r => r.data ?? []),
    buscarObras: (termo: string) =>
        api.get<ObraResumo[]>('/api/biblioteca/obra/busca/titulo', {params: {q: termo}}).then(r => r.data ?? []),
    reservarObra: (usuarioId: number | null | undefined, obraId: number) =>
        api.post(`/api/biblioteca/reserva`, {usuarioId: requireUsuarioId(usuarioId), obraId}).then(r => r.data),
    cancelarReserva: (reservaId: number, motivo?: string) =>
        api.put(`/api/biblioteca/reserva/${reservaId}/cancelar`, null, {params: motivo ? {motivo} : {}}).then(r => r.data),

    // ---- Biblioteca virtual (usuário logado) ----
    provedoresAtivos: () =>
        api.get<ProvedorVirtual[]>('/api/biblioteca-virtual/provedor/ativos').then(r => r.data ?? []),
    buscarLivrosVirtuais: (termo: string) =>
        api.get<LivroVirtual[]>('/api/biblioteca-virtual/livro-digital/busca/titulo', {params: {q: termo}}).then(r => r.data ?? []),
    meusEmprestimosVirtuaisAtivos: (usuarioId?: number | null) =>
        api.get<EmprestimoVirtual[]>(`/api/biblioteca-virtual/emprestimo-digital/usuario/${requireUsuarioId(usuarioId)}/ativos`).then(r => r.data ?? []),
};

export function formatarDataHora(valor?: string | null): string {
    if (!valor) return '-';
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    return d.toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export function formatarDataCurta(valor?: string | null): string {
    if (!valor) return '-';
    const d = new Date(valor.length <= 10 ? `${valor}T12:00:00` : valor);
    if (Number.isNaN(d.getTime())) return String(valor);
    return d.toLocaleDateString('pt-BR');
}

export function formatarMoeda(valor?: number | null): string {
    if (valor === null || valor === undefined) return '-';
    return Number(valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}
