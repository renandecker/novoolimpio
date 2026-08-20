import {useEffect, useState} from 'react';
import {api} from '../api';
import {PermissionGate, usePermissions, useCurrentOutcome} from '../permissions';
import {DataTable, PAGE_SIZES} from '../DataTable';
import {useModulePaged} from '../useModulePaged';
import {AutoComplete, type AutoCompleteOption} from '../AutoComplete';
import {CancelamentoModal} from '../CancelamentoModal';
import {RowMenu, type RowMenuItem} from '../RowMenu';
import {
    SituacaoFinanceiraModal,
    DadosPessoaisModal,
    ContratanteModal,
    HistoricoNapModal,
    HistoricoCobrancaModal,
    NotasModal,
    PresencasModal,
    HistoricoAlunoModal,
} from '../GestaoAlunoModais';
import type {ApiItem} from '../types';
import {PerfilModuloPermissions} from '../useModulePaged';

const CONTRACT_COLUMNS = [
    {key: 'id', label: 'Contrato'},
    {key: 'id_pessoa', label: 'Aluno'},
    {key: 'id_curso', label: 'Curso'},
    {key: 'id_unidade', label: 'Unidade'},
    {key: 'id_unidade_resposavel', label: 'Unidade Responsável'},
    {key: 'data', label: 'Data'},
    {key: 'ativo', label: 'Status'},
    {key: 'qtde_parcelas_atrasadas', label: 'Pendente'},
    {key: 'valor_parcelas', label: 'Valor'},
];

// Each of these corresponds to an independent <p:commandButton ... onsuccess="PF('xxx').show()"/>
// in gestaoAluno.xhtml (olimpio.zip): every action opens its own modal dialog, they are NOT
// sequential steps of a wizard.
const ACTIONS = [
    {key: 'situacao', label: '$ Situação Financeira', className: 'btnblue'},
    {key: 'pessoais', label: 'Dados Pessoais Aluno', className: 'btngreen'},
    {key: 'contratante', label: 'Dados Pessoais Contratante', className: 'btnstop'},
    {key: 'historicoNap', label: 'Histórico NAP', className: 'btnsky'},
    {key: 'historicoCobranca', label: 'Histórico Cobrança', className: 'btnpurple'},
    {key: 'notas', label: 'Notas', className: 'btnblack'},
    {key: 'presencas', label: 'Presenças', className: 'btnbrown'},
    {key: 'historicoAluno', label: 'Histórico aluno', className: 'btnpink'},
] as
const ;

type ActionKey = (typeof ACTIONS)[number]['key'];

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const renderValue = (item: ApiItem, key: string) => {
    const value = asRecord(item)[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

function ContractsTable({searchedIds}: { searchedIds: number[] | null }) {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setPage(0);
        setExpanded({});
    }, [searchedIds]);
    const [cancelandoId, setCancelandoId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState<{ titulo: string; texto: string } | null>(null);

    const {can} = usePermissions();
    const outcome = useCurrentOutcome();

    // Busca permissões do bas_perfil_modulo para esta tela/outcome
    const [perfilModuloPermissions, setPerfilModuloPermissions] = useState<PerfilModuloPermissions | null>(null);
    const [perfilModuloLoading, setPerfilModuloLoading] = useState(false);

    useEffect(() => {
        const carregarPermissoes = async () => {
            setPerfilModuloLoading(true);
            try {
                const response = await api.get<PerfilModuloPermissions>(`/api/perfil-modulo/permissoes?caminho=${outcome}`);
                setPerfilModuloPermissions(response.data);
            } catch (error) {
                console.error('Erro ao carregar permissões do perfil-modulo:', error);
            } finally {
                setPerfilModuloLoading(false);
            }
        };
        carregarPermissoes();
    }, [outcome]);

    // Espelha gestaoAlunoController.acessoRelatorios/acessoNovo/acessoEditar/acessoRemover em
    // gestaoAluno.xhtml: cada coluna de ações só aparece se o usuário tiver a permissão correspondente.
    const acessoRelatorios = can('EXECUTE', outcome) || (perfilModuloPermissions?.relatorio ? ? false);
    const acessoNovo = can('CREATE', outcome) || (perfilModuloPermissions?.novo ? ? false);
    const acessoEditar = can('UPDATE', outcome) || (perfilModuloPermissions?.editar ? ? false);
    const acessoRemover = can('DELETE', outcome) || (perfilModuloPermissions?.remover ? ? false);
    const showActionsColumn = acessoRelatorios || acessoNovo || acessoEditar || acessoRemover;

    const abrirPlaceholder = (titulo: string, texto: string) => setPlaceholder({titulo, texto});

    const q = useModulePaged('/api/view/contrato/colunasContrato', page, size);
    const all = q.data?.content ? ? [];
    const totalElements = q.data?.totalElements ? ? 0;
    const totalPages = Math.max(1, q.data?.totalPages ? ? 0);

    const items = searchedIds
        ? all.filter((item) => searchedIds.includes(Number(item.id)))
        : all;
    const colSpan = 2 + CONTRACT_COLUMNS.length + (showActionsColumn ? 1 : 0);

    return (
        <div className="data-table">
            {q.isError ? (
                <p>Erro ao carregar os contratos.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th className="col-toggle"></th>
                        <th className="col-id">Id</th>
                        {CONTRACT_COLUMNS.map((column) => (
                            <th key={column.key}>{column.label}</th>
                        ))}
                        {showActionsColumn && <th className="col-actions">Ações</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {q.isLoading && items.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan}>Carregando...</td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={colSpan}>
                                {searchedIds ? 'Nenhum aluno encontrado.' : 'Nenhum registro encontrado.'}
                            </td>
                        </tr>
                    ) : (
                        items.flatMap((item) => {
                            const rowKey = String(item.id);
                            const isOpen = Boolean(expanded[rowKey]);
                            const ativo = asRecord(item).ativo !== false;

                            // Relatórios: <p:menuButton icon="ui-icon-document" styleClass="btnyellow"> em gestaoAluno.xhtml.
                            const relatoriosItems: RowMenuItem[] = [
                                {
                                    key: 'contrato',
                                    label: 'Contrato',
                                    className: 'btnstop',
                                    onSelect: () => abrirPlaceholder('Contrato', 'Imprimir contrato do aluno.')
                                },
                                {
                                    key: 'promissoria',
                                    label: 'Promissória',
                                    className: 'btnsky',
                                    onSelect: () => abrirPlaceholder('Promissória', 'Imprimir promissória do contrato.')
                                },
                                {
                                    key: 'reparcelamentoImpr',
                                    label: 'Reparcelamento',
                                    className: 'btngreen',
                                    onSelect: () => abrirPlaceholder('Reparcelamento', 'Imprimir segunda via de reparcelamento.')
                                },
                                {
                                    key: 'precancelamentos',
                                    label: 'Pré cancelamentos',
                                    className: 'btnorange',
                                    onSelect: () => abrirPlaceholder('Pré cancelamentos', 'Pré cancelamentos criados no contrato.')
                                },
                                {
                                    key: 'trocaTurma',
                                    label: 'Troca Turma',
                                    className: 'btnblue',
                                    onSelect: () => abrirPlaceholder('Troca Turma', 'Gerar segunda via troca de turma.')
                                },
                                {
                                    key: 'cancelamentoImpr',
                                    label: 'Cancelamento',
                                    className: 'btnred',
                                    disabled: ativo,
                                    onSelect: () => abrirPlaceholder('Cancelamento', 'Imprimir segunda via documento de cancelamento.')
                                },
                                {
                                    key: 'historicoEscolar',
                                    label: 'Histórico Escolar',
                                    className: 'btngrey',
                                    onSelect: () => abrirPlaceholder('Histórico Escolar', 'Gerar histórico escolar do aluno.')
                                },
                                {
                                    key: 'boletim',
                                    label: 'Imprimir boletim',
                                    className: 'btnpink',
                                    onSelect: () => abrirPlaceholder('Boletim', 'Imprimir boletim do aluno.')
                                },
                                {
                                    key: 'certificado',
                                    label: 'Imprimir certificado',
                                    className: 'btnpurple',
                                    onSelect: () => abrirPlaceholder('Certificado', 'Imprimir certificado do aluno.')
                                },
                                {
                                    key: 'presencasContrato',
                                    label: 'Presenças',
                                    className: 'btnbrown',
                                    onSelect: () => abrirPlaceholder('Presenças', 'Ver presenças deste contrato.')
                                },
                                {
                                    key: 'notasContrato',
                                    label: 'Notas',
                                    className: 'btnblack',
                                    onSelect: () => abrirPlaceholder('Notas', 'Ver notas deste contrato.')
                                },
                            ];

                            // Novo: <p:menuButton icon="ui-icon-circle-plus" styleClass="btnstop">.
                            const novoItems: RowMenuItem[] = [
                                {
                                    key: 'trocaUnidade',
                                    label: 'Troca Unidade Responsável',
                                    className: 'btnstop',
                                    onSelect: () => abrirPlaceholder('Troca de Unidade', 'Troca de unidade responsável do contrato.')
                                },
                                {
                                    key: 'documento',
                                    label: 'Documento',
                                    className: 'btngreen',
                                    onSelect: () => abrirPlaceholder('Documento', 'Documentos do aluno/responsável.')
                                },
                            ];

                            // Editar: <p:menuButton icon="ui-icon-pencil" styleClass="btngreen">.
                            const editarItems: RowMenuItem[] = [
                                {
                                    key: 'trocaResponsavel',
                                    label: 'Troca Responsável',
                                    className: 'btnsky',
                                    onSelect: () => abrirPlaceholder('Troca de Responsável', 'Troca do responsável pelo contrato.')
                                },
                                {
                                    key: 'reparcelamento',
                                    label: 'Reparcelamento',
                                    className: 'btngreen',
                                    onSelect: () => abrirPlaceholder('Reparcelamento', 'Reparcelamento do contrato.')
                                },
                                {
                                    key: 'trocarDeTurma',
                                    label: 'Trocar de turma',
                                    className: 'btnblue',
                                    onSelect: () => abrirPlaceholder('Trocar de turma', 'Trocar o aluno de turma.')
                                },
                            ];

                            // Remover: <p:menuButton icon="ui-icon-trash" styleClass="btnred">.
                            const removerItems: RowMenuItem[] = [
                                {
                                    key: 'cancelamento',
                                    label: 'Cancelamento',
                                    className: 'btnred',
                                    disabled: !ativo,
                                    onSelect: () => setCancelandoId(rowKey)
                                },
                            ];

                            const row = (
                                <tr key={`${rowKey}-row`}>
                                    <td className="col-toggle">
                                        <button
                                            type="button"
                                            className="btn-row-toggle"
                                            title={isOpen ? 'Recolher' : 'Expandir'}
                                            onClick={() => setExpanded((prev) => ({...prev, [rowKey]: !prev[rowKey]}))}
                                        >
                                            {isOpen ? '▾' : '▸'}
                                        </button>
                                    </td>
                                    <td className="col-id">{item.id}</td>
                                    {CONTRACT_COLUMNS.map((column) => (
                                        <td key={column.key}>{renderValue(item, column.key)}</td>
                                    ))}
                                    {showActionsColumn && (
                                        <td className="col-actions">
                                            <div className="row-actions-menu">
                                                {acessoRelatorios && (
                                                    <RowMenu icon={<i className="fa fa-file-text-o"/>}
                                                             className="btnyellow" title="Relatórios"
                                                             items={relatoriosItems}/>
                                                )}
                                                {acessoNovo && (
                                                    <RowMenu icon={<i className="fa fa-plus-circle"/>}
                                                             className="btnstop" title="Novo" items={novoItems}/>
                                                )}
                                                {acessoEditar && (
                                                    <RowMenu icon={<i className="fa fa-pencil"/>} className="btngreen"
                                                             title="Editar" items={editarItems}/>
                                                )}
                                                {acessoRemover && (
                                                    <RowMenu icon={<i className="fa fa-trash"/>} className="btnred"
                                                             title="Remover" items={removerItems}/>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                            if (!isOpen) return [row];
                            return [
                                row,
                                <tr key={`${rowKey}-detail`} className="row-detail">
                                    <td colSpan={colSpan}>
                                        <DataTable path="/api/view/matricula/colunasMatricula"/>
                                    </td>
                                </tr>,
                            ];
                        })
                    )}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={colSpan} className="data-table-paginator">
                            <button onClick={() => setPage((current) => Math.max(0, current - 1))}
                                    disabled={page === 0 || q.isFetching}>
                                Anterior
                            </button>
                            <span>
                  Página {page + 1} de {totalPages}
                </span>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1 || q.isFetching}
                            >
                                Próxima
                            </button>
                            <label>
                                Registros por página
                                <select
                                    value={size}
                                    onChange={(event) => {
                                        setSize(Number(event.target.value));
                                        setPage(0);
                                    }}
                                >
                                    {PAGE_SIZES.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <span>Total: {totalElements}</span>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            )}
            {cancelandoId && <CancelamentoModal onClose={() => setCancelandoId(null)}/>}
            {placeholder && (
                <div className="modal-overlay" onClick={() => setPlaceholder(null)}>
                    <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                        <h2>{placeholder.titulo}</h2>
                        <p className="master-detail-empty">{placeholder.texto}</p>
                        <div className="modal-actions form-footer">
                            <button type="button" className="btn-form-back" onClick={() => setPlaceholder(null)}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ViewGestaoAlunoGestaoAlunoListScreen() {
    const [aluno, setAluno] = useState<AutoCompleteOption | null>(null);
    const [searchedIds, setSearchedIds] = useState<number[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [erro, setErro] = useState('');
    const [openAction, setOpenAction] = useState<ActionKey | null>(null);

    const fetchAlunos = async (query: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<{ id: number; nome: string }[]>(
            '/api/educacao/contrato/auto-complete-aluno',
            {params: {query}},
        );
        return (data ? ? []).map((item) => ({id: item.id, label: item.nome || `#${item.id}`}));
    };

    const selecionarAluno = (option: AutoCompleteOption | null) => {
        setAluno(option);
        setErro('');
        if (!option) {
            setSearchedIds(null);
            return;
        }
        setSearching(true);
        api
            .get<number[]>('/api/educacao/contrato/buscar-contratos-pessoa', {params: {pessoaId: option.id}})
            .then((response) => setSearchedIds(response.data ? ? []))
            .catch((error) => {
                setSearchedIds([]);
                const msg = error?.response?.data?.error ? ? error?.message ? ? 'Erro ao buscar os contratos do aluno.';
                setErro(msg);
            })
            .finally(() => setSearching(false));
    };

    const activeAction = ACTIONS.find((action) => action.key === openAction) ? ? null;

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Gestão de Aluno</h1>
                <section className="div_form">
                    <div className="form-title">Gestão do Aluno</div>
                    <div className="table_form">
                        <div className="form-grid">
                            <label className="form-field">
                                <span className="form-label">Aluno</span>
                                <AutoComplete
                                    placeholder="Digite ao menos 3 caracteres..."
                                    value={aluno}
                                    onChange={selecionarAluno}
                                    fetchOptions={fetchAlunos}
                                />
                            </label>
                        </div>
                        {erro && <p className="form-erro">{erro}</p>}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-form-save"
                                onClick={() => aluno && selecionarAluno(aluno)}
                                disabled={searching || !aluno}
                            >
                                {searching ? 'Buscando...' : 'Buscar/Atualizar'}
                            </button>
                            <button
                                type="button"
                                className="btn-form-save"
                                onClick={() => aluno && selecionarAluno(aluno)}
                                disabled={searching || !aluno}
                                title="Buscar/Atualizar"
                                style={{
                                    padding: '0.5rem',
                                    minWidth: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <i className="fa fa-search" style={{fontSize: '1.2rem'}}/>
                            </button>
                            <button type="button" className="btn-form-back" onClick={() => selecionarAluno(null)}>
                                Limpar campo
                            </button>
                        </div>

                        {/* Ações do aluno: cada botão abre seu próprio modal (p:dialog), assim como em
                gestaoAluno.xhtml — não são etapas de um wizard. */}
                        {aluno && (
                            <div className="modal-actions" style={{flexWrap: 'wrap', marginTop: '1rem'}}>
                                {ACTIONS.map((action) => (
                                    <button
                                        key={action.key}
                                        type="button"
                                        className={action.className}
                                        onClick={() => setOpenAction(action.key)}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                <ContractsTable searchedIds={searchedIds}/>

                {activeAction && aluno && (
                    <>
                        {activeAction.key === 'situacao' && (
                            <SituacaoFinanceiraModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'pessoais' && (
                            <DadosPessoaisModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'contratante' && (
                            <ContratanteModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'historicoNap' && (
                            <HistoricoNapModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'historicoCobranca' && (
                            <HistoricoCobrancaModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'notas' && (
                            <NotasModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'presencas' && (
                            <PresencasModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'historicoAluno' && (
                            <HistoricoAlunoModal pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                    </>
                )}
            </main>
        </PermissionGate>
    );
}
