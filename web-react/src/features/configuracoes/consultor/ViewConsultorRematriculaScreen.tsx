import {useCallback, useEffect, useMemo, useState} from 'react';
import {api} from '../../../shared/services/api';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import {Modal} from '../../../shared/components/Modal';
import {PermissionGate} from '../../../shared/services/permissions';
import type {ApiItem} from '../../../shared/types/types';
import '../../configuracoes/MatriculaWizard.css';

const TABS = [
    {key: 'contrato', label: 'Contrato'},
    {key: 'turmas', label: 'Turmas'},
    {key: 'material', label: 'Material'},
    {key: 'valores', label: 'Valores'},
] as const;

type TabKey = (typeof TABS)[number]['key'];

const CONTRATO_RESOURCE = '/api/view/educacao/listContratoRematricula';

type ContratoSelecionado = {
    id: number;
    pessoa_id?: number;
    pessoaId?: number;
    curriculo_id?: number;
    curriculoId?: number;
    unidade_id?: number;
    unidadeId?: number;
    aluno_nome?: string;
    aluno_cpf?: string;
    curso_nome?: string;
    curriculo_sucinto?: string;
    unidade_sucinto?: string;
    valor_parcelas?: number;
};

type OfertaTurma = {
    id: number;
    status?: string;
    componenteCurricular_descricao?: string;
    componente_curricular_descricao?: string;
    sala_descricao?: string;
    sala?: string;
    professor_descricao?: string;
    dataInicio?: string;
    dataFim?: string;
    vagas?: number;
    inscritos?: number;
    grupoId?: number;
};

type Grupo = {
    id: number;
    nome?: string;
    unidade_descricao?: string;
    curriculo_descricao?: string;
};

type MaterialItem = {
    key: string;
    controleEstoqueId?: number;
    produtoId?: number;
    nome?: string;
    descricao?: string;
    valor?: number;
    quantidadeCurso?: number;
    quantidadeCompra?: number;
    quantidadeEstoque?: number;
    quantidadeSolicitado?: number;
    imagem?: string;
    obrigatorio?: boolean;
};

type Parcela = {
    parcela: number;
    descricao: string;
    dataVencimento: string;
    valor: number;
};

type FormaPagamento = {
    id: number;
    vezes?: number;
    juros?: number | null;
    desconto?: number | null;
    ajuste?: boolean;
    percentualMinimo?: number | null;
    percentualMaximo?: number | null;
    ativo?: boolean;
    perfilId?: number | null;
};

const brDate = (value?: string): string => {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    return match ? `${match[2]}/${match[3]}/${match[1]}` : String(value);
};

const todayIso = (): string => {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const dia = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mes}-${dia}`;
};

const addMonths = (iso: string, months: number): string => {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-').map(Number);
    const dt = new Date(ano, mes - 1 + months, dia);
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${dt.getFullYear()}-${m}-${d}`;
};

const money = (value?: number | null): string => {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(n);
};

const idOf = (row: Record<string, unknown>, ...keys: string[]): number | undefined => {
    for (const key of keys) {
        const value = row[key];
        if (value !== null && value !== undefined && value !== '') return Number(value);
    }
    return undefined;
};

export default function ViewConsultorRematriculaScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>('contrato');
    const [contrato, setContrato] = useState<ContratoSelecionado | null>(null);

    const selecionarContrato = useCallback((item: ApiItem) => {
        const row = item as unknown as ContratoSelecionado;
        setContrato(row);
        setActiveTab('turmas');
    }, []);

    const goToTab = useCallback(
        async (tab: TabKey) => {
            if (tab !== 'contrato' && !contrato) {
                alert('Selecione um contrato na aba "Contrato" para continuar.');
                return;
            }
            setActiveTab(tab);
        },
        [contrato],
    );

    return (
        <PermissionGate permission="READ">
            <div className="wizard">
                <nav className="wizard-steps" role="navigation" aria-label="Etapas da rematrícula">
                    {TABS.map((tab, index) => {
                        const state = tab.key === activeTab
                            ? 'wizard-step wizard-step-active'
                            : index === 0
                                ? 'wizard-step wizard-step-done'
                                : 'wizard-step wizard-step-pending';
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                className={state}
                                onClick={() => goToTab(tab.key)}
                                aria-current={tab.key === activeTab ? 'step' : undefined}
                            >
                                <span className="wizard-step-number">{index + 1}</span>
                                <span className="wizard-step-label">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="wizard-content">
                    {activeTab === 'contrato' && (
                        <ContratoTab contrato={contrato} onSelecionar={selecionarContrato}/>
                    )}
                    {activeTab === 'turmas' && contrato && (
                        <TurmasTab contrato={contrato}/>
                    )}
                    {activeTab === 'material' && contrato && (
                        <MaterialTab contrato={contrato}/>
                    )}
                    {activeTab === 'valores' && contrato && (
                        <ValoresTab contrato={contrato}/>
                    )}
                </div>
            </div>
        </PermissionGate>
    );
}



function ContratoTab({contrato, onSelecionar}: {contrato: ContratoSelecionado | null; onSelecionar: (item: ApiItem) => void}) {
    const columns = useMemo<DataTableColumn[]>(() => [
        {key: 'aluno_nome', label: 'Aluno'},
        {key: 'aluno_cpf', label: 'CPF'},
        {key: 'curso_nome', label: 'Curso'},
        {key: 'curriculo_sucinto', label: 'Currículo'},
        {key: 'unidade_sucinto', label: 'Unidade'},
        {key: 'responsavel_nome', label: 'Responsável'},
        {key: 'ativo', label: 'Ativo'},
        {key: 'data', label: 'Data', render: (item) => brDate(String((item as Record<string, unknown>).data ?? ''))},
        {key: 'valor_parcelas', label: 'Valor', render: (item) => money(Number((item as Record<string, unknown>).valor_parcelas ?? 0))},
        {
            key: 'acoes',
            label: 'Ações',
            render: (item) => {
                const id = Number((item as Record<string, unknown>).id);
                const selecionado = contrato?.id === id;
                return (
                    <button
                        type="button"
                        className={`btn-action btn-select ${selecionado ? 'btngreen' : 'btnblue'}`}
                        title={selecionado ? 'Contrato selecionado' : 'Selecionar contrato para rematrícula'}
                        onClick={() => onSelecionar(item)}
                    >
                        {selecionado ? 'Selecionado' : 'Selecionar'}
                    </button>
                );
            },
        },
    ], [contrato, onSelecionar]);

    return (
        <div className="tab-content">
            <p className="step-description">
                Selecione o contrato que deseja rematricular. A listagem traz apenas contratos
                cujo currículo está marcado com <strong>possui rematrícula</strong>.
            </p>
            {contrato && (
                <div className="resumo-section">
                    <h4>Contrato selecionado</h4>
                    <p>
                        <strong>#{contrato.id}</strong> — {contrato.aluno_nome ?? '—'}
                        {contrato.curso_nome ? ` | ${contrato.curso_nome}` : ''}
                        {contrato.unidade_sucinto ? ` | ${contrato.unidade_sucinto}` : ''}
                    </p>
                </div>
            )}
            <DataTable
                path={CONTRATO_RESOURCE}
                columns={columns}
                maxMainColumns={columns.length}
                hideCreate={true}
                hideView={true}
                hideUpdate={true}
                hideDelete={true}
            />
        </div>
    );
}



function TurmasTab({contrato}: {contrato: ContratoSelecionado}) {
    const curriculoId = idOf(contrato as Record<string, unknown>, 'curriculo_id', 'curriculoId');
    const unidadeId = idOf(contrato as Record<string, unknown>, 'unidade_id', 'unidadeId');

    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [abertos, setAbertos] = useState<Record<number, boolean>>({});
    const [ofertasPorGrupo, setOfertasPorGrupo] = useState<Record<number, OfertaTurma[]>>({});
    const [selecionadas, setSelecionadas] = useState<OfertaTurma[]>([]);

    useEffect(() => {
        setSelecionadas([]);
        setOfertasPorGrupo({});
        setAbertos({});
    }, [contrato.id]);

    useEffect(() => {
        if (!curriculoId || !unidadeId) {
            setErro('O contrato selecionado não possui currículo/unidade informados.');
            return;
        }
        let cancelado = false;
        const carregar = async () => {
            setCarregando(true);
            setErro(null);
            try {
                const {data} = await api.get<Grupo[]>('/api/educacao/oferecimento-curso/listar-grupos', {
                    params: {curriculoId, unidadeId},
                });
                if (!cancelado) setGrupos(data ?? []);
            } catch (e) {
                console.error('Erro ao carregar grupos:', e);
                if (!cancelado) setErro('Erro ao carregar os grupos de turmas.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };
        carregar();
        return () => {
            cancelado = true;
        };
    }, [curriculoId, unidadeId]);

    const toggleGrupo = async (grupo: Grupo) => {
        const aberto = !abertos[grupo.id];
        setAbertos((prev) => ({...prev, [grupo.id]: aberto}));
        if (!aberto || ofertasPorGrupo[grupo.id]) return;
        try {
            const {data} = await api.get<OfertaTurma[]>('/api/educacao/oferecimento-curso/listar-oferecimentos', {
                params: {grupoId: grupo.id},
            });
            setOfertasPorGrupo((prev) => ({...prev, [grupo.id]: data ?? []}));
        } catch (e) {
            console.error('Erro ao carregar turmas do grupo:', e);
            setOfertasPorGrupo((prev) => ({...prev, [grupo.id]: []}));
        }
    };

    const alternarTurma = (oferta: OfertaTurma) => {
        setSelecionadas((prev) => prev.some((o) => o.id === oferta.id)
            ? prev.filter((o) => o.id !== oferta.id)
            : [...prev, oferta]);
    };

    const idsSelecionados = useMemo(() => new Set(selecionadas.map((o) => o.id)), [selecionadas]);
    const disponiveis = useMemo(
        () => grupos.reduce((total, g) => total + (ofertasPorGrupo[g.id]?.length ?? 0), 0),
        [grupos, ofertasPorGrupo],
    );

    return (
        <div className="tab-content">
            <p className="step-description">
                Selecione as turmas do curso <strong>{contrato.curso_nome ?? '—'}</strong> para a
                rematrícula. O contrato está na aba "Contrato" (regra: possui rematrícula).
            </p>

            {selecionadas.length > 0 && (
                <div className="resumo-section">
                    <h4>Turmas selecionadas ({selecionadas.length})</h4>
                    <table className="ofc-table">
                        <thead>
                        <tr>
                            <th>Turma</th>
                            <th>Componente</th>
                            <th>Sala</th>
                            <th>Período</th>
                            <th>Professor</th>
                            <th>Vagas</th>
                            <th style={{width: 50}}/>
                        </tr>
                        </thead>
                        <tbody>
                        {selecionadas.map((oferta) => (
                            <tr key={oferta.id}>
                                <td>#{oferta.id}</td>
                                <td>{oferta.componenteCurricular_descricao ?? oferta.componente_curricular_descricao ?? '—'}</td>
                                <td>{oferta.sala_descricao ?? oferta.sala ?? '—'}</td>
                                <td>{brDate(oferta.dataInicio)} a {brDate(oferta.dataFim)}</td>
                                <td>{oferta.professor_descricao ?? '—'}</td>
                                <td>{oferta.inscritos ?? 0}/{oferta.vagas ?? 0}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn-action btnred"
                                        title="Remover turma"
                                        onClick={() => alternarTurma(oferta)}
                                    >
                                        −
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="resumo-section">
                <h4>
                    Grupos de turmas {carregando ? '(carregando...)' : `(${grupos.length})`}
                    {disponiveis > 0 ? ` — ${disponiveis} turmas disponíveis` : ''}
                </h4>
                {erro && <p className="ofc-aviso">{erro}</p>}
                {!erro && !carregando && grupos.length === 0 && (
                    <p className="ofc-aviso">Nenhum grupo de turmas encontrado para este curso.</p>
                )}

                <div className="accordion">
                    {grupos.map((grupo) => {
                        const aberto = Boolean(abertos[grupo.id]);
                        const ofertas = ofertasPorGrupo[grupo.id];
                        const selecionadasNoGrupo = ofertas?.filter((o) => idsSelecionados.has(o.id)).length ?? 0;
                        return (
                            <div className="accordion-item" key={grupo.id}>
                                <button
                                    type="button"
                                    className="accordion-header"
                                    onClick={() => toggleGrupo(grupo)}
                                    aria-expanded={aberto}
                                >
                                    <span className="accordion-toggle">{aberto ? '▾' : '▸'}</span>
                                    <span className="grupo-header">
                                        <h4>{grupo.nome ?? `Grupo ${grupo.id}`}</h4>
                                        <span>
                                            {grupo.unidade_descricao ?? contrato.unidade_sucinto ?? '—'}
                                            {selecionadasNoGrupo > 0 ? ` — ${selecionadasNoGrupo} selecionada(s)` : ''}
                                        </span>
                                    </span>
                                </button>
                                <div className={`accordion-content${aberto ? ' open' : ''}`}>
                                    {!ofertas && <p className="ofc-hint">Carregando turmas...</p>}
                                    {ofertas && ofertas.length === 0 && (
                                        <p className="ofc-hint">Este grupo não possui turmas.</p>
                                    )}
                                    {ofertas?.map((oferta) => {
                                        const marcada = idsSelecionados.has(oferta.id);
                                        return (
                                            <div
                                                key={oferta.id}
                                                className={`material-disponivel${marcada ? ' material-selecionado' : ''}`}
                                            >
                                                <div className="material-info">
                                                    <strong>
                                                        {oferta.componenteCurricular_descricao
                                                            ?? oferta.componente_curricular_descricao
                                                            ?? `Turma ${oferta.id}`}
                                                    </strong>
                                                    <span className="ofc-subtitulo">
                                                        Sala {oferta.sala_descricao ?? oferta.sala ?? '—'}
                                                        {' · '}
                                                        {brDate(oferta.dataInicio)} a {brDate(oferta.dataFim)}
                                                        {' · '}
                                                        Professor: {oferta.professor_descricao ?? '—'}
                                                        {' · '}
                                                        Vagas {oferta.inscritos ?? 0}/{oferta.vagas ?? 0}
                                                        {oferta.status ? ` · ${oferta.status}` : ''}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`btn-sm ${marcada ? 'btn-danger' : 'btn-primary'}`}
                                                    onClick={() => alternarTurma(oferta)}
                                                >
                                                    {marcada ? 'Remover' : 'Selecionar'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}



function MaterialTab({contrato}: {contrato: ContratoSelecionado}) {
    const curriculoId = idOf(contrato as Record<string, unknown>, 'curriculo_id', 'curriculoId');
    const unidadeId = idOf(contrato as Record<string, unknown>, 'unidade_id', 'unidadeId');

    const [materiais, setMateriais] = useState<MaterialItem[]>([]);
    const [estoque, setEstoque] = useState<MaterialItem[]>([]);
    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [formaPagamentoId, setFormaPagamentoId] = useState<number | ''>('');
    const [primeiraParcela, setPrimeiraParcela] = useState(todayIso());
    const [modalAberto, setModalAberto] = useState(false);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        setMateriais([]);
        setEstoque([]);
        setModalAberto(false);
    }, [contrato.id]);

    useEffect(() => {
        if (!curriculoId || !unidadeId) return;
        let cancelado = false;

        const carregar = async () => {
            setCarregando(true);
            setErro(null);
            try {
                const [materiaisCurso, controle, formas] = await Promise.all([
                    api.get<Array<{id: number; produtoId: number; quantidade: number}>>(
                        `/api/educacao/material-escolar-curso/curriculo/${curriculoId}`),
                    api.get<Array<Record<string, unknown>>>('/api/estoque/estoque-produto/controle', {
                        params: {unidadeId},
                    }),
                    api.get<FormaPagamento[]>('/api/financeiro/forma-pagamento'),
                ]);

                if (cancelado) return;

                const porProduto = new Map<number, Record<string, unknown>>();
                for (const linha of (controle.data ?? []) as Array<Record<string, unknown>>) {
                    const produtoId = Number(linha.produtoId);
                    if (Number.isFinite(produtoId)) porProduto.set(produtoId, linha);
                }

                const disponiveis = (materiaisCurso.data ?? []).map((mc) => {
                    const estoqueLinha = porProduto.get(Number(mc.produtoId));
                    const quantidadeEstoque = Number(estoqueLinha?.quantidade ?? 0);
                    const reservado = Number(estoqueLinha?.qtdeReservado ?? 0)
                        + Number(estoqueLinha?.qtdeSolicitado ?? 0)
                        + Number(estoqueLinha?.qtdeAprovadoNaoEntregue ?? 0);
                    return {
                        key: `mec-${mc.id}`,
                        controleEstoqueId: estoqueLinha?.id as number | undefined,
                        produtoId: Number(mc.produtoId),
                        nome: (estoqueLinha?.produtoNome as string) ?? `Produto ${mc.produtoId}`,
                        descricao: (estoqueLinha?.produtoCategoriaDescricao as string) ?? undefined,
                        valor: Number(estoqueLinha?.produtoValor ?? 0),
                        quantidadeCurso: Number(mc.quantidade ?? 0),
                        quantidadeEstoque,
                        quantidadeSolicitado: Number(estoqueLinha?.qtdeSolicitado ?? 0),
                        quantidadeCompra: Math.max(0, quantidadeEstoque - reservado),
                        imagem: (estoqueLinha?.produtoImagem as string) ?? undefined,
                        obrigatorio: true,
                    } as MaterialItem;
                });

                setMateriais(disponiveis);
                setEstoque(
                    [...disponiveis].sort((a, b) => (a.nome ?? '').localeCompare(b.nome ?? '')),
                );
                setFormasPagamento((formas.data ?? []).filter((f) => f.ativo !== false));
            } catch (e) {
                console.error('Erro ao carregar materiais:', e);
                if (!cancelado) setErro('Erro ao carregar os materiais do curso.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };

        carregar();
        return () => {
            cancelado = true;
        };
    }, [curriculoId, unidadeId]);

    const adicionar = (item: MaterialItem) => {
        setMateriais((prev) => {
            const existente = prev.findIndex((m) => m.produtoId === item.produtoId);
            if (existente < 0) return [...prev, {...item, quantidadeCompra: item.quantidadeCurso || 1}];
            return prev.map((m, i) => (i === existente
                ? {...m, quantidadeCompra: (m.quantidadeCompra ?? 0) + (item.quantidadeCurso || 1)}
                : m));
        });
        setModalAberto(false);
    };

    const remover = (produtoId?: number) =>
        setMateriais((prev) => prev.filter((m) => m.produtoId !== produtoId));

    const alterarQuantidade = (produtoId: number | undefined, delta: number) =>
        setMateriais((prev) => prev.map((m) => (m.produtoId === produtoId
            ? {...m, quantidadeCompra: Math.max(0, (m.quantidadeCompra ?? 0) + delta)}
            : m)));

    const total = useMemo(
        () => materiais.reduce((soma, m) => soma + (Number(m.valor ?? 0) * (m.quantidadeCompra ?? 0)), 0),
        [materiais],
    );

    const forma = formasPagamento.find((f) => f.id === formaPagamentoId);
    const parcelas: Parcela[] = useMemo(() => {
        if (!forma || !primeiraParcela) return [];
        const vezes = forma.vezes && forma.vezes > 0 ? forma.vezes : 1;
        const linhas: Parcela[] = [];
        for (let i = 0; i < vezes; i++) {
            linhas.push({
                parcela: i + 1,
                descricao: i === 0 ? 'Entrada' : 'Valor Parcelado',
                dataVencimento: addMonths(primeiraParcela, i),
                valor: Math.round((total / vezes) * 100) / 100,
            });
        }
        return linhas;
    }, [forma, primeiraParcela, total]);

    const filtrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return estoque;
        return estoque.filter((e) => `${e.nome ?? ''} ${e.descricao ?? ''}`.toLowerCase().includes(termo));
    }, [estoque, busca]);

    return (
        <div className="tab-content">
            <p className="step-description">
                Materiais do curso <strong>{contrato.curso_nome ?? '—'}</strong> mapeados no
                currículo e disponíveis em estoque. Adicione produtos para comprar junto com a
                matrícula.
            </p>
            {erro && <p className="ofc-aviso">{erro}</p>}

            <div className="material-grid" style={{marginBottom: 16}}>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setModalAberto(true)}
                    disabled={!estoque.length}
                >
                    Adicionar produto
                </button>
            </div>

            <h4 className="valores-curso">Produtos na compra ({materiais.length})</h4>
            {materiais.length === 0 ? (
                <p className="ofc-hint">Nenhum material selecionado.</p>
            ) : (
                <table className="ofc-table">
                    <thead>
                    <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Valor</th>
                        <th>Qtd. curso</th>
                        <th>Estoque</th>
                        <th style={{width: 140}}>Comprar</th>
                        <th style={{width: 50}}/>
                    </tr>
                    </thead>
                    <tbody>
                    {materiais.map((m) => (
                        <tr key={m.key}>
                            <td>{m.nome ?? '—'}</td>
                            <td>{m.descricao ?? '—'}</td>
                            <td>{money(m.valor)}</td>
                            <td>{m.quantidadeCurso ?? 0}</td>
                            <td>{m.quantidadeEstoque ?? 0}</td>
                            <td>
                                <div className="material-quantities">
                                    <button
                                        type="button"
                                        className="btn-sm btn-danger"
                                        onClick={() => alterarQuantidade(m.produtoId, -1)}
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min={0}
                                        value={m.quantidadeCompra ?? 0}
                                        onChange={(e) => setMateriais((prev) => prev.map((x) => (
                                            x.produtoId === m.produtoId
                                                ? {...x, quantidadeCompra: Number(e.target.value) || 0}
                                                : x
                                        )))}
                                    />
                                    <button
                                        type="button"
                                        className="btn-sm btn-primary"
                                        onClick={() => alterarQuantidade(m.produtoId, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn-action btnred"
                                    title="Remover produto"
                                    onClick={() => remover(m.produtoId)}
                                >
                                    −
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={6}><strong>Total</strong></td>
                        <td><strong>{money(total)}</strong></td>
                    </tr>
                    </tfoot>
                </table>
            )}

            <div className="resumo-section" style={{marginTop: 20}}>
                <h4>Condições de pagamento do material</h4>
                <div className="field-row">
                    <div className="field-group">
                        <label>Forma de pagamento</label>
                        <select
                            className="form-select"
                            value={formaPagamentoId}
                            onChange={(e) => setFormaPagamentoId(e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">Selecione</option>
                            {formasPagamento.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.vezes}X — Juros: {f.juros ?? 0}% — Desconto: {f.desconto ?? 0}%
                                    {f.perfilId ? ' (requer autorização)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field-group">
                        <label>Pagamento primeira parcela</label>
                        <input
                            className="form-input"
                            type="date"
                            min={todayIso()}
                            value={primeiraParcela}
                            onChange={(e) => setPrimeiraParcela(e.target.value)}
                        />
                    </div>
                </div>

                {parcelas.length > 0 && (
                    <table className="ofc-table parcelas-table">
                        <thead>
                        <tr>
                            <th>Parcela</th>
                            <th>Descrição</th>
                            <th>Vencimento</th>
                            <th>Valor</th>
                        </tr>
                        </thead>
                        <tbody>
                        {parcelas.map((p) => (
                            <tr key={p.parcela}>
                                <td>{p.parcela}</td>
                                <td>{p.descricao}</td>
                                <td>{brDate(p.dataVencimento)}</td>
                                <td>{money(p.valor)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                title="Produtos disponíveis em estoque"
                open={modalAberto}
                onClose={() => setModalAberto(false)}
                size="xl"
            >
                <input
                    className="form-input"
                    placeholder="Buscar produto..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    style={{marginBottom: 12}}
                />
                {carregando && <p>Carregando...</p>}
                {!carregando && filtrados.length === 0 && <p>Nenhum produto disponível.</p>}
                {filtrados.length > 0 && (
                    <table className="ofc-table">
                        <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>Disponível</th>
                            <th style={{width: 100}}/>
                        </tr>
                        </thead>
                        <tbody>
                        {filtrados.map((item) => (
                            <tr key={item.key}>
                                <td>{item.nome ?? '—'}</td>
                                <td>{item.descricao ?? '—'}</td>
                                <td>{money(item.valor)}</td>
                                <td>{item.quantidadeCompra ?? 0}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn-sm btn-primary"
                                        disabled={(item.quantidadeCompra ?? 0) <= 0}
                                        onClick={() => adicionar(item)}
                                    >
                                        Adicionar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Modal>
        </div>
    );
}



function ValoresTab({contrato}: {contrato: ContratoSelecionado}) {
    const curriculoId = idOf(contrato as Record<string, unknown>, 'curriculo_id', 'curriculoId');
    const unidadeId = idOf(contrato as Record<string, unknown>, 'unidade_id', 'unidadeId');

    const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
    const [formaPagamentoId, setFormaPagamentoId] = useState<number | ''>('');
    const [primeiraParcela, setPrimeiraParcela] = useState(todayIso());
    const [segundaParcela, setSegundaParcela] = useState<number | ''>('');
    const [valorCurso, setValorCurso] = useState<Record<string, unknown> | null>(null);
    const [formasDoValor, setFormasDoValor] = useState<number[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;
        const carregar = async () => {
            setCarregando(true);
            setErro(null);
            try {
                const formas = await api.get<FormaPagamento[]>('/api/financeiro/forma-pagamento');
                if (cancelado) return;
                setFormasPagamento((formas.data ?? []).filter((f) => f.ativo !== false));

                if (curriculoId && unidadeId) {
                    const {data: valorCursoId} = await api.get<number | null>(
                        '/api/educacao/matricula/buscar-valor-curso2',
                        {params: {curriculoId, unidadeId}},
                    );
                    if (cancelado) return;
                    if (valorCursoId) {
                        const [{data: valor}, {data: formasVinculadas}] = await Promise.all([
                            api.get<Record<string, unknown>>(`/api/financeiro/valor-curso/${valorCursoId}`),
                            api.get<number[]>(`/api/financeiro/valor-curso/${valorCursoId}/formas-pagamento`),
                        ]);
                        if (cancelado) return;
                        setValorCurso(valor);
                        setFormasDoValor(formasVinculadas ?? []);
                    } else {
                        setValorCurso(null);
                        setFormasDoValor([]);
                    }
                }
            } catch (e) {
                console.error('Erro ao carregar valores:', e);
                if (!cancelado) setErro('Erro ao carregar as condições de valor do curso.');
            } finally {
                if (!cancelado) setCarregando(false);
            }
        };
        carregar();
        return () => {
            cancelado = true;
        };
    }, [curriculoId, unidadeId]);

    const forma = formasPagamento.find((f) => f.id === formaPagamentoId);
    const disponiveis = formasDoValor.length > 0
        ? formasPagamento.filter((f) => formasDoValor.includes(f.id))
        : formasPagamento;

    const valorTotal = Number(valorCurso?.valor ?? contrato.valor_parcelas ?? 0);
    const parcelas: Parcela[] = useMemo(() => {
        if (!forma || !primeiraParcela) return [];
        const vezes = forma.vezes && forma.vezes > 0 ? forma.vezes : 1;
        const linhas: Parcela[] = [{
            parcela: 0,
            descricao: 'Taxa Inscrição',
            dataVencimento: primeiraParcela,
            valor: 0,
        }];
        for (let i = 1; i <= vezes; i++) {
            const base = String(segundaParcela || primeiraParcela);
            const offset = segundaParcela ? i - 1 : i;
            linhas.push({
                parcela: i,
                descricao: 'Matrícula Parcelada',
                dataVencimento: addMonths(base, offset),
                valor: Math.round((valorTotal / vezes) * 100) / 100,
            });
        }
        return linhas;
    }, [forma, primeiraParcela, segundaParcela, valorTotal]);

    return (
        <div className="tab-content">
            <p className="step-description">
                Regras de valor da rematrícula para o contrato <strong>#{contrato.id}</strong> —
                {contrato.aluno_nome ?? '—'} ({contrato.curso_nome ?? 'sem curso'}).
            </p>
            {erro && <p className="ofc-aviso">{erro}</p>}

            {valorCurso && (
                <div className="resumo-section">
                    <h4>Valor do curso</h4>
                    <p>
                        Valor: <strong>{money(valorTotal)}</strong>
                        {valorCurso.juros !== null && valorCurso.juros !== undefined ? ` · Juros: ${valorCurso.juros}%` : ''}
                        {valorCurso.multa !== null && valorCurso.multa !== undefined ? ` · Multa: ${valorCurso.multa}%` : ''}
                        {valorCurso.descontoCarne !== null && valorCurso.descontoCarne !== undefined ? ` · Desconto carnê: ${valorCurso.descontoCarne}%` : ''}
                        {` · Cobra rematrícula: ${valorCurso.cobraRematricula ? 'SIM' : 'NÃO'}`}
                    </p>
                </div>
            )}

            <div className="field-row">
                <div className="field-group">
                    <label>Selecione a forma de pagamento</label>
                    <select
                        className="form-select"
                        value={formaPagamentoId}
                        onChange={(e) => setFormaPagamentoId(e.target.value ? Number(e.target.value) : '')}
                        disabled={carregando}
                    >
                        <option value="">Selecione</option>
                        {disponiveis.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.vezes}X — Juros: {f.juros ?? 0}% — Desconto: {f.desconto ?? 0}%
                                {f.perfilId ? ' (requer autorização)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field-group">
                    <label>Pagamento primeira parcela</label>
                    <input
                        className="form-input"
                        type="date"
                        min={todayIso()}
                        value={primeiraParcela}
                        onChange={(e) => setPrimeiraParcela(e.target.value)}
                    />
                </div>
                <div className="field-group">
                    <label>Pagamento segunda parcela</label>
                    <select
                        className="form-select"
                        value={segundaParcela}
                        onChange={(e) => setSegundaParcela(e.target.value ? Number(e.target.value) : '')}
                        disabled={!forma}
                    >
                        <option value="">Selecione</option>
                        {[7, 10, 14, 15, 21, 28, 30, 35, 40, 45].map((d) => (
                            <option key={d} value={d}>{d} dias</option>
                        ))}
                    </select>
                </div>
            </div>

            {forma?.ajuste && (
                <p className="ofc-hint">
                    Ajuste manual permitido: mínimo {forma.percentualMinimo ?? 0}% — máximo {forma.percentualMaximo ?? 0}%.
                </p>
            )}

            <h4 className="parcelas-table">Parcelas</h4>
            {parcelas.length === 0 ? (
                <p className="ofc-hint">Selecione a forma de pagamento e a data da primeira parcela.</p>
            ) : (
                <table className="ofc-table parcelas-table">
                    <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Parcela</th>
                        <th>Ajuste mínimo</th>
                        <th>Ajuste máximo</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {parcelas.map((p) => (
                        <tr key={p.parcela}>
                            <td>{p.descricao}</td>
                            <td>{p.parcela}</td>
                            <td>{forma?.ajuste ? `${forma.percentualMinimo ?? 0}%` : ''}</td>
                            <td>{forma?.ajuste ? `${forma.percentualMaximo ?? 0}%` : ''}</td>
                            <td>{brDate(p.dataVencimento)}</td>
                            <td>{money(p.valor)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <p className="ofc-aviso" style={{marginTop: 16}}>
                Bolsa de estudos, taxas adicionais e o salvamento da rematrícula dependem de
                endpoints que ainda não existem no backend (desconto-curso, taxa-curso e parcelas
                do contrato). Enquanto isso, esta aba monta o cálculo das parcelas em memória.
            </p>
        </div>
    );
}
