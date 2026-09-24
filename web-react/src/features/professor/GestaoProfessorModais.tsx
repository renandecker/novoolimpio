import type {ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';

// Espelha o dialog "informacoes" (widgetVar) de
// extracted_aceso/src/main/webapp/view/gestaoProfessor/gestaoProfessor.xhtml:
// dados da turma + professor (com contatos), dias de aula e alunos
// (com contatos do aluno e do contratante).
export interface TurmaDiaAula {
    data: string;
    diaSemana: string;
    turno: string;
}

export interface TurmaAlunoInfo {
    matriculaId: number;
    aluno: string;
    cpf: string;
    telefone: string;
    celular: string;
    contratante: string;
    contratanteCpf: string;
    contratanteTelefone: string;
    contratanteCelular: string;
}

export interface TurmaInformacoes {
    turmaId: number;
    professor: string;
    professorTelefone: string;
    professorCelular: string;
    professorEmail: string;
    unidade: string;
    sala: string;
    grupo: string;
    curso: string;
    componenteCurricular: string;
    status: string;
    diasAula: TurmaDiaAula[];
    alunos: TurmaAlunoInfo[];
}

const apiError = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

function ModalFrame({titulo, onClose, children}: { titulo: string; onClose: () => void; children: ReactNode }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <h2>{titulo}</h2>
                {children}
                <div className="modal-actions form-footer">
                    <button type="button" className="btn-form-back btnyellow" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

function Carregando() {
    return <p className="master-detail-empty">Carregando...</p>;
}

function Erro({mensagem}: { mensagem: string }) {
    return <p className="form-erro">Erro ao carregar os dados: {mensagem}</p>;
}

interface TabelaColuna {
    key: string;
    label: string;
    render?: (row: Record<string, unknown>) => ReactNode;
}

function TabelaDados({colunas, linhas, vazio}: { colunas: TabelaColuna[]; linhas: Record<string, unknown>[]; vazio: string }) {
    return (
        <table className="lote-table">
            <thead>
            <tr>
                {colunas.map((coluna) => (
                    <th key={coluna.key}>{coluna.label}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {linhas.length === 0 ? (
                <tr>
                    <td colSpan={colunas.length}>{vazio}</td>
                </tr>
            ) : (
                linhas.map((linha, idx) => (
                    <tr key={String(linha.id ?? linha.matriculaId ?? idx)}>
                        {colunas.map((coluna) => (
                            <td key={coluna.key}>
                                {coluna.render ? coluna.render(linha) : String(linha[coluna.key] ?? '')}
                            </td>
                        ))}
                    </tr>
                ))
            )}
            </tbody>
        </table>
    );
}

function Campo({rotulo, valor}: { rotulo: string; valor: ReactNode }) {
    return (
        <label className="form-field">
            <span className="form-label">{rotulo}</span>
            <input className="form-input" value={String(valor ?? '')} readOnly />
        </label>
    );
}

export function InformacoesConteudo({turmaId}: { turmaId: number }) {
    const q = useQuery({
        queryKey: ['gestao-professor', 'informacoes', turmaId],
        queryFn: async () => (await api.get<TurmaInformacoes>(`/api/professor/gestao-professor/turmas/${turmaId}/informacoes`)).data,
    });

    if (q.isLoading) return <Carregando />;
    if (q.isError || !q.data) return <Erro mensagem={apiError(q.error)} />;

    const info = q.data;

    return (
        <>
            <div className="form-grid">
                <Campo rotulo="Unidade" valor={info.unidade || '—'} />
                <Campo rotulo="Sala" valor={info.sala || '—'} />
                <Campo rotulo="Grupo" valor={info.grupo} />
                <Campo rotulo="Curso" valor={info.curso} />
                <Campo rotulo="Status" valor={info.status} />
            </div>

            <h3>Professor</h3>
            <TabelaDados
                vazio="Nenhum professor vinculado."
                colunas={[
                    {key: 'professor', label: 'Professor'},
                    {key: 'professorTelefone', label: 'Telefone'},
                    {key: 'professorCelular', label: 'Celular'},
                    {key: 'professorEmail', label: 'E-mail'},
                ]}
                linhas={[info as unknown as Record<string, unknown>]}
            />

            <h3>Dias de aula</h3>
            <TabelaDados
                vazio="Nenhum dia de aula encontrado."
                colunas={[
                    {key: 'data', label: 'Dia'},
                    {key: 'diaSemana', label: 'Dia da semana'},
                    {key: 'turno', label: 'Turno'},
                ]}
                linhas={(info.diasAula ?? []) as unknown as Record<string, unknown>[]}
            />

            <h3>Alunos</h3>
            <TabelaDados
                vazio="Nenhum aluno matriculado."
                colunas={[
                    {key: 'aluno', label: 'Aluno'},
                    {key: 'cpf', label: 'CPF Aluno'},
                    {key: 'telefone', label: 'Telefone Aluno'},
                    {key: 'celular', label: 'Celular Aluno'},
                    {key: 'contratante', label: 'Contratante'},
                    {key: 'contratanteCpf', label: 'CPF Contratante'},
                    {key: 'contratanteTelefone', label: 'Telefone Contratante'},
                    {key: 'contratanteCelular', label: 'Celular Contratante'},
                ]}
                linhas={(info.alunos ?? []) as unknown as Record<string, unknown>[]}
            />
        </>
    );
}

export function InformacoesModal({turmaId, onClose}: { turmaId: number; onClose: () => void }) {
    const q = useQuery({
        queryKey: ['gestao-professor', 'informacoes', turmaId],
        queryFn: async () => (await api.get<TurmaInformacoes>(`/api/professor/gestao-professor/turmas/${turmaId}/informacoes`)).data,
    });

    if (q.isLoading) return <ModalFrame titulo="Informações da Turma" onClose={onClose}><Carregando /></ModalFrame>;
    if (q.isError || !q.data) return <ModalFrame titulo="Informações da Turma" onClose={onClose}><Erro mensagem={apiError(q.error)} /></ModalFrame>;

    const info = q.data;

    return (
        <ModalFrame titulo={`Informações da Turma ${info.turmaId} - ${info.componenteCurricular}`} onClose={onClose}>
            <InformacoesConteudo turmaId={turmaId} />
        </ModalFrame>
    );
}
