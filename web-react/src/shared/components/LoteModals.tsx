import {useState} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';
import {api} from './api';
import {Wizard} from './Wizard';

export interface ModeloEmail {
    id: number;
    descricao: string;
    assunto: string;
    mensagem: string;
}

export interface AlunoLote {
    contratoId: number;
    aluno: string;
    contratante: string;
    email: string | null;
}

export interface SituacaoOption {
    value: string;
    label: string;
}

export const SITUACOES_NAP: SituacaoOption[] = [
    {value: 'DISPONIVEL', label: 'Disponível'},
    {value: 'AGENDADO', label: 'Agendado'},
    {value: 'AGENDADO_SEM_RETORNO', label: 'Agendado sem retorno'},
    {value: 'COMUNICADO', label: 'Comunicado'},
    {value: 'CONTRATO_RECORENTE', label: 'Contrato recorrente'},
    {value: 'PRIORITARIO', label: 'Prioritário'},
    {value: 'PRIORITARIO_ATRASADO', label: 'Prioritário atrasado'},
    {value: 'RETORNO', label: 'Retorno'},
    {value: 'SEM_RETORNO', label: 'Sem retorno'},
];

export const SITUACOES_COBRANCA: SituacaoOption[] = [
    {value: 'NUNCA_CONTATADO', label: 'Nunca contatado'},
    {value: 'AGENDADO', label: 'Agendado'},
    {value: 'AGENDADO_ATRASADO', label: 'Agendado atrasado'},
    {value: 'CONTATADO_HOJE', label: 'Contatado hoje'},
    {value: 'CONTATO_PENDENTE', label: 'Contato pendente'},
    {value: 'CONTATO_RECORRENTE', label: 'Contato recorrente'},
    {value: 'PRIORITARIO', label: 'Prioritário'},
    {value: 'PRIORITARIO_ATRASADO', label: 'Prioritário atrasado'},
];

interface LoteApiProps {
    basePath: string;
    etapaKey: 'etapasNapId' | 'etapasCobrancaId';
    etapaId: number;
    situacoes: SituacaoOption[];
}

interface Resumo {
    processados: number;
    semEmail: number;
    assunto?: string;
}

const apiError = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

export function LoteEmailModal({basePath, etapaKey, etapaId, situacoes, onClose}: LoteApiProps & { onClose: () => void }) {
    const [situacao, setSituacao] = useState(situacoes[0]?.value ?? '');
    const [q, setQ] = useState('');
    const [mensagemId, setMensagemId] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [enviado, setEnviado] = useState<Resumo | null>(null);
    const [error, setError] = useState('');

    const modelosQuery = useQuery({
        queryKey: [basePath, 'modelos-email'],
        queryFn: async () => (await api.get<ModeloEmail[]>(`${basePath}/modelos-email`)).data,
    });
    const modelos = modelosQuery.data ?? [];
    const modelo = modelos.find((m) => m.id === mensagemId) ?? null;

    const alunosQuery = useQuery({
        queryKey: [basePath, 'alunos', etapaKey, etapaId, situacao, q],
        queryFn: async () =>
            (
                await api.get<{ alunos: AlunoLote[]; total: number }>(`${basePath}/alunos`, {
                    params: {[etapaKey]: etapaId, situacao, tipo: 0, q},
                })
            ).data,
    });
    const alunos = alunosQuery.data?.alunos ?? [];

    const toggle = (contratoId: number) =>
        setSelected((prev) =>
            prev.includes(contratoId) ? prev.filter((id) => id !== contratoId) : [...prev, contratoId],
        );

    const toggleTodos = () =>
        setSelected((prev) => {
            const ids = alunos.map((a) => a.contratoId);
            const todosSelecionados = ids.every((id) => prev.includes(id));
            return todosSelecionados ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
        });

    const enviarMutation = useMutation({
        mutationFn: async () =>
            (
                await api.post<Resumo>(`${basePath}/email`, {
                    [etapaKey]: etapaId,
                    mensagemId,
                    contratoIds: selected,
                })
            ).data,
        onSuccess: (data) => setEnviado(data),
        onError: (err) => setError(apiError(err)),
    });

    const todasSelecionadas = alunos.length > 0 && alunos.every((a) => selected.includes(a.contratoId));

    const steps = [
        {
            key: 'mensagem',
            label: 'Mensagem',
            nextDisabled: !mensagemId,
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Modelo de e-mail</span>
                        {modelosQuery.isLoading ? (
                            <select className="form-input form-select" disabled>
                                <option>Carregando...</option>
                            </select>
                        ) : (
                            <select
                                className="form-input form-select"
                                value={mensagemId ?? ''}
                                onChange={(event) => setMensagemId(event.target.value ? Number(event.target.value) : null)}
                            >
                                <option value="">-- Selecione --</option>
                                {modelos.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.descricao}
                                    </option>
                                ))}
                            </select>
                        )}
                    </label>
                    <label className="form-field">
                        <span className="form-label">Assunto</span>
                        <input className="form-input" value={modelo?.assunto ?? ''} readOnly/>
                    </label>
                    <label className="form-field" style={{gridColumn: '1 / -1'}}>
                        <span className="form-label">Mensagem</span>
                        <textarea className="form-input" rows={8} value={modelo?.mensagem ?? ''} readOnly/>
                    </label>
                </div>
            ),
        },
        {
            key: 'alunos',
            label: 'Alunos',
            nextDisabled: selected.length === 0,
            content: (
                <div>
                    <div className="data-table-toolbar">
                        <label>
                            Situação
                            <select
                                className="form-input form-select"
                                value={situacao}
                                onChange={(event) => {
                                    setSituacao(event.target.value);
                                    setSelected([]);
                                }}
                            >
                                {situacoes.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Buscar aluno
                            <input
                                className="form-input"
                                value={q}
                                onChange={(event) => setQ(event.target.value)}
                                placeholder="Nome do aluno ou contratante"
                            />
                        </label>
                        <button type="button" className="btnblue" onClick={toggleTodos} disabled={alunos.length === 0}>
                            {todasSelecionadas ? 'Desmarcar todos' : 'Selecionar todos'}
                        </button>
                        <span className="data-table-notice">{selected.length} selecionado(s)</span>
                    </div>
                    {alunosQuery.isLoading ? (
                        <p>Carregando alunos...</p>
                    ) : alunos.length === 0 ? (
                        <p>Nenhum aluno encontrado para a situação selecionada.</p>
                    ) : (
                        <table className="lote-table">
                            <thead>
                            <tr>
                                <th></th>
                                <th>Aluno</th>
                                <th>Contratante</th>
                                <th>E-mail</th>
                            </tr>
                            </thead>
                            <tbody>
                            {alunos.map((aluno) => (
                                <tr key={aluno.contratoId}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(aluno.contratoId)}
                                            onChange={() => toggle(aluno.contratoId)}
                                        />
                                    </td>
                                    <td>{aluno.aluno}</td>
                                    <td>{aluno.contratante}</td>
                                    <td>{aluno.email ?? '—'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ),
        },
        {
            key: 'confirmacao',
            label: 'Confirmação',
            nextDisabled: !enviado,
            content: enviado ? (
                <p className="data-table-notice">
                    {enviado.processados} e-mail(s)
                    registrado(s){enviado.semEmail > 0 ? `, ${enviado.semEmail} aluno(s) sem e-mail cadastrado` : ''}.
                </p>
            ) : (
                <div>
                    <p>
                        Enviar <strong>{selected.length}</strong> e-mail(s) para a etapa usando o modelo{' '}
                        <strong>{modelo?.descricao}</strong>.
                    </p>
                    {error && <p className="data-table-notice">Falha: {error}</p>}
                    <button
                        type="button"
                        className="btn-primary btnstop"
                        disabled={enviarMutation.isPending}
                        onClick={() => enviarMutation.mutate()}
                    >
                        {enviarMutation.isPending ? 'Enviando...' : `Enviar e-mails (${selected.length})`}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">E-mail em lote</div>
                    <Wizard steps={steps} completeLabel="Concluir" onComplete={onClose}/>
                </div>
            </div>
        </div>
    );
}

export function LoteLigacaoModal({basePath, etapaKey, etapaId, situacoes, onClose}: LoteApiProps & { onClose: () => void }) {
    const [situacao, setSituacao] = useState(situacoes[0]?.value ?? '');
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const [resultado, setResultado] = useState<{ processados: number } | null>(null);
    const [error, setError] = useState('');

    const alunosQuery = useQuery({
        queryKey: [basePath, 'alunos', etapaKey, etapaId, situacao, q],
        queryFn: async () =>
            (
                await api.get<{ alunos: AlunoLote[]; total: number }>(`${basePath}/alunos`, {
                    params: {[etapaKey]: etapaId, situacao, tipo: 1, q},
                })
            ).data,
    });
    const alunos = alunosQuery.data?.alunos ?? [];

    const iniciarMutation = useMutation({
        mutationFn: async () =>
            (
                await api.post<{ processados: number }>(`${basePath}/ligacao`, {
                    [etapaKey]: etapaId,
                    contratoIds: selected,
                })
            ).data,
        onSuccess: (data) => setResultado(data),
        onError: (err) => setError(apiError(err)),
    });

    const toggle = (contratoId: number) =>
        setSelected((prev) =>
            prev.includes(contratoId) ? prev.filter((id) => id !== contratoId) : [...prev, contratoId],
        );

    const toggleTodos = () =>
        setSelected((prev) => {
            const ids = alunos.map((a) => a.contratoId);
            const todosSelecionados = ids.every((id) => prev.includes(id));
            return todosSelecionados ? prev.filter((id) => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
        });

    const todasSelecionadas = alunos.length > 0 && alunos.every((a) => selected.includes(a.contratoId));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Ligação em lote</div>
                    {resultado ? (
                        <p className="data-table-notice">{resultado.processados} ligação(ões) iniciada(s).</p>
                    ) : (
                        <div>
                            <div className="data-table-toolbar">
                                <label>
                                    Situação
                                    <select
                                        className="form-input form-select"
                                        value={situacao}
                                        onChange={(event) => {
                                            setSituacao(event.target.value);
                                            setSelected([]);
                                        }}
                                    >
                                        {situacoes.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Buscar aluno
                                    <input
                                        className="form-input"
                                        value={q}
                                        onChange={(event) => setQ(event.target.value)}
                                        placeholder="Nome do aluno ou contratante"
                                    />
                                </label>
                                <button type="button" className="btnblue" onClick={toggleTodos}
                                        disabled={alunos.length === 0}>
                                    {todasSelecionadas ? 'Desmarcar todos' : 'Selecionar todos'}
                                </button>
                                <span className="data-table-notice">{selected.length} selecionado(s)</span>
                            </div>
                            {alunosQuery.isLoading ? (
                                <p>Carregando alunos...</p>
                            ) : alunos.length === 0 ? (
                                <p>Nenhum aluno encontrado para a situação selecionada.</p>
                            ) : (
                                <table className="lote-table">
                                    <thead>
                                    <tr>
                                        <th></th>
                                        <th>Aluno</th>
                                        <th>Contratante</th>
                                        <th>E-mail</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {alunos.map((aluno) => (
                                        <tr key={aluno.contratoId}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(aluno.contratoId)}
                                                    onChange={() => toggle(aluno.contratoId)}
                                                />
                                            </td>
                                            <td>{aluno.aluno}</td>
                                            <td>{aluno.contratante}</td>
                                            <td>{aluno.email ?? '—'}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                            {error && <p className="data-table-notice">Falha: {error}</p>}
                            <button
                                type="button"
                                className="btn-primary btnstop"
                                disabled={iniciarMutation.isPending || selected.length === 0}
                                onClick={() => iniciarMutation.mutate()}
                            >
                                {iniciarMutation.isPending ? 'Iniciando...' : `Iniciar ligações (${selected.length})`}
                            </button>
                        </div>
                    )}
                    <div className="modal-actions form-footer">
                        <button type="button" className="btn-form-back" onClick={onClose}>
                            {resultado ? 'Concluir' : 'Cancelar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
