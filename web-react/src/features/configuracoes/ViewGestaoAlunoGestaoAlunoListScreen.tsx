import {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate, usePermissions, useCurrentOutcome} from '../../shared/services/permissions';
import {PAGE_SIZES} from '../../shared/components/DataTable';
import {useModulePaged} from '../../shared/hooks/useModulePaged';
import {AutoComplete, type AutoCompleteOption} from '../../shared/components/AutoComplete';
import {CancelamentoModal} from '../../shared/components/CancelamentoModal';
import {RowMenu, type RowMenuItem} from '../../shared/components/RowMenu';
import {
    SituacaoFinanceiraModal,
    DadosPessoaisModal,
    ContratanteModal,
    HistoricoNapModal,
    HistoricoCobrancaModal,
    NotasModal,
    PresencasModal,
    HistoricoAlunoModal,
} from '../../features/professor/GestaoAlunoModais';
import type {ApiItem} from '../../features/auth/types';
import {PerfilModuloPermissions} from '../../shared/hooks/useModulePaged';

const CONTRACT_COLUMNS = [
    {key: 'id', label: 'Contrato'},
    {key: 'pessoa_descricao', label: 'Aluno'},
    {key: 'curso_descricao', label: 'Curso'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'unidade_resposavel_descricao', label: 'Unidade Responsável'},
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
] as const;

// Espelha as chamadas <p:fileDownload> do botão amarelo "Relatórios" em gestaoAluno.xhtml
// (olimpio_extracted): cada item POSTa no endpoint que gera o PDF do documento.
const DOCUMENTOS = {
    contrato: {
        url: '/api/educacao/gestao-aluno/gerar-contrato',
        arquivo: (id: number) => `contrato-${id}.pdf`,
    },
    promissoria: {
        url: '/api/educacao/gestao-aluno/gerar-promissoria',
        arquivo: (id: number) => `promissoria-${id}.pdf`,
    },
    cancelamentoContratual: {
        url: '/api/financeiro/gerar-carne/gerar-via-documento-cancelamento-contratual',
        arquivo: (id: number) => `cancelamento-${id}.pdf`,
    },
    historicoEscolar: {
        url: '/api/financeiro/gerar-carne/imprimir-historico',
        arquivo: (id: number) => `historico-escolar-${id}.pdf`,
    },
    certificado: {
        url: '/api/educacao/gerar-certificado/gerar-certificado',
        arquivo: (id: number) => `certificado-${id}.pdf`,
    },
    boletim: {
        url: '/api/financeiro/gerar-carne/imprimir-boletim-teste',
        arquivo: (id: number) => `boletim-escolar-${id}.pdf`,
    },
} as const;

type DocumentoKey = keyof typeof DOCUMENTOS;

type ActionKey = (typeof ACTIONS)[number]['key'];

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const ACTIVE_COLUMN_RE = /ativo|situacao|status|fl_ativo|fl_situacao|fl_status/i;

const renderValue = (item: ApiItem, key: string) => {
    const value = asRecord(item)[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);

    let boolVal: boolean | null = null;
    if (typeof value === 'boolean') {
        boolVal = value;
    } else if (value === 'true' || value === 'false') {
        boolVal = value === 'true';
    } else if (value === 1 || value === 0) {
        boolVal = value === 1;
    } else if (value === '1' || value === '0') {
        boolVal = value === '1';
    }

    if (boolVal !== null) {
        if (ACTIVE_COLUMN_RE.test(key)) {
            return boolVal ? 'ATIVO' : 'INATIVO';
        } else {
            return boolVal ? 'SIM' : 'NÃƒO';
        }
    }
    return String(value);
};

// Espelha a subtabela "detalhesAluno" (<p:rowExpansion>) de gestaoAluno.xhtml: matrículas do
// contrato com colunas descritivas do oferecimento + menus de ação por permissão.
interface MatriculaContrato {
    id: number;
    turma: number | null;
    dataInicio: string | null;
    dataFim: string | null;
    grupo: string;
    componenteCurricular: string;
    cargaHoraria: number | null;
    unidade: string;
    professor: string;
    statusTurma: string;
    statusMatricula: string;
    dataCancelamento: string | null;
    trocaTurma: boolean;
}

const fmtDataMatricula = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('pt-BR') : '';

// Espelha turmaController.styleClass(matricula): classe de cor do status da matrícula.
const STATUS_MATRICULA_CLASS: Record<string, string> = {
    APROVADO: 'statusEM_ANDAMENTO',
    REPROVADO: 'statusPENDENTE',
    PENDENTE: 'statusLOTADA',
    CURSANDO: 'statusLIBERADA',
    FINALIZADA: 'statusCONCLUIDA',
    CANCELADO: 'statusCANCELADA',
};

const statusTurmaClass = (status: string) => (status ? `status${status}` : '');

const MATRICULA_COLUMNS = [
    {key: 'id', label: 'Matrícula', width: '5%', render: (m: MatriculaContrato) => String(m.id)},
    {key: 'turma', label: 'Turma', width: '5%', render: (m: MatriculaContrato) => String(m.turma ?? '')},
    {key: 'dataInicio', label: 'Data Início', width: '60px', render: (m: MatriculaContrato) => fmtDataMatricula(m.dataInicio)},
    {key: 'dataFim', label: 'Data Fim', width: '60px', render: (m: MatriculaContrato) => fmtDataMatricula(m.dataFim)},
    {key: 'grupo', label: 'Grupo', width: '10%', render: (m: MatriculaContrato) => m.grupo},
    {key: 'componente', label: 'Componente Curricular', width: '20%', render: (m: MatriculaContrato) => m.componenteCurricular},
    {key: 'cargaHoraria', label: 'Carga Horária', width: '5%', align: 'center', render: (m: MatriculaContrato) => String(m.cargaHoraria ?? '')},
    {key: 'unidade', label: 'Id_unidade', width: '12%', render: (m: MatriculaContrato) => m.unidade},
    {key: 'professor', label: 'Professor', width: '15%', render: (m: MatriculaContrato) => m.professor},
] as const;

function MatriculasTable({contratoId, acessoTudo, acessoRelatorios, acessoNovo, acessoEditar, acessoRemover}: {
    contratoId: number;
    acessoTudo: boolean;
    acessoRelatorios: boolean;
    acessoNovo: boolean;
    acessoEditar: boolean;
    acessoRemover: boolean;
}) {
    const [placeholder, setPlaceholder] = useState<{ titulo: string; texto: string } | null>(null);
    const [cancelando, setCancelando] = useState(false);

    const q = useQuery({
        queryKey: ['matriculas-contrato', contratoId],
        queryFn: async () => (await api.get<MatriculaContrato[]>(
            '/api/aluno/gestao/matriculas-por-contrato',
            {params: {contratoId}},
        )).data,
        enabled: Number.isFinite(contratoId),
    });

    const items = q.data ?? [];
    const showActionsColumn = acessoTudo || acessoRelatorios || acessoNovo || acessoEditar || acessoRemover;
    const colSpan = MATRICULA_COLUMNS.length + 2 + (showActionsColumn ? 1 : 0);

    const abrirPlaceholder = (titulo: string, texto: string) => setPlaceholder({titulo, texto});

    // Espelha os <p:menuButton> por linha da matrícula em gestaoAluno.xhtml (acessoTudo,
    // acessoRelatorios, acessoNovo, acessoEditar, acessoRemover), com as mesmas cores.
    const acoesDaMatricula = (m: MatriculaContrato) => {
        const cancelada = m.statusMatricula === 'CANCELADO';
        return (
            <>
                {acessoTudo && (
                    <RowMenu icon={<i className="fa fa-check"/>} className="btnblue" title="Permissão total"
                             items={[{
                                 key: 'alunosTurma',
                                 label: 'Alunos da turma',
                                 className: 'btnbrown',
                                 onSelect: () => abrirPlaceholder(
                                     'Alunos da turma',
                                     `Alunos sobre os oferecimentos da matrícula #${m.id} (turma ${m.turma ?? 'â€”'}).`),
                             }]}/>
                )}
                {acessoRelatorios && (
                    <RowMenu icon={<i className="fa fa-file-text-o"/>} className="btnyellow" title="Relatórios"
                             items={[
                                 {
                                     key: 'informacoes',
                                     label: 'Informações',
                                     className: 'btnyellow',
                                     onSelect: () => abrirPlaceholder('Informações', `Mais informações da turma ${m.turma ?? 'â€”'}.`),
                                 },
                                 {
                                     key: 'preCancelamentos',
                                     label: 'Pré cancelamentos',
                                     className: 'btnorange',
                                     onSelect: () => abrirPlaceholder('Pré cancelamentos', 'Pré cancelamentos criados na matrícula.'),
                                 },
                                 {
                                     key: 'presencas',
                                     label: 'Presenças',
                                     className: 'btnbrown',
                                     onSelect: () => abrirPlaceholder('Presenças', `Presenças da matrícula #${m.id}.`),
                                 },
                                 {
                                     key: 'notas',
                                     label: 'Notas',
                                     className: 'btnblack',
                                     onSelect: () => abrirPlaceholder('Notas', `Notas da matrícula #${m.id}.`),
                                 },
                                 ...(m.dataCancelamento ? [{
                                     key: 'cancelamentoMatricula',
                                     label: 'Cancelamento matricula',
                                     className: 'btnred',
                                     disabled: true,
                                     onSelect: () => abrirPlaceholder('Cancelamento matricula', 'Segunda via do documento de cancelamento.'),
                                 }] : []),
                                 ...((m.trocaTurma && !cancelada) ? [{
                                     key: 'trocaTurmaSegunda',
                                     label: 'Troca turma',
                                     className: 'btnblue',
                                     disabled: false,
                                     onSelect: () => abrirPlaceholder('Troca turma', 'Segunda via troca de turma.'),
                                 }] : []),
                             ]}/>
                )}
                {acessoNovo && !cancelada && (
                    <RowMenu icon={<i className="fa fa-plus-circle"/>} className="btnstop" title="Novo"
                             items={[{
                                 key: 'trocaComponente',
                                 label: 'Troca Componente',
                                 className: 'btngreen',
                                 onSelect: () => abrirPlaceholder('Trocar aluno de Componente', 'Trocar o aluno de componente curricular.'),
                             }]}/>
                )}
                {acessoEditar && !cancelada && (
                    <RowMenu icon={<i className="fa fa-pencil"/>} className="btngreen" title="Editar"
                             items={[{
                                 key: 'trocaTurma',
                                 label: 'Troca Turma',
                                 className: 'btnblue',
                                 onSelect: () => abrirPlaceholder('Trocar aluno de turma', 'Trocar o aluno de turma.'),
                             }]}/>
                )}
                {acessoRemover && (
                    <RowMenu icon={<i className="fa fa-trash"/>} className="btnred" title="Remover"
                             items={[{
                                 key: 'cancelamento',
                                 label: 'Cancelamento',
                                 className: 'btnred',
                                 onSelect: () => setCancelando(true),
                             }]}/>
                )}
            </>
        );
    };

    return (
        <div className="data-table">
            {q.isError ? (
                <p>Erro ao carregar as matrículas.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        {MATRICULA_COLUMNS.map((column) => (
                            <th key={column.key} style={{width: column.width}}>{column.label}</th>
                        ))}
                        <th style={{width: '6%', textAlign: 'center'}}>Status Turma</th>
                        <th style={{width: '6%', textAlign: 'center'}}>Status Matrícula</th>
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
                            <td colSpan={colSpan}>Nenhum registro encontrado.</td>
                        </tr>
                    ) : (
                        items.map((m) => (
                            <tr key={m.id}>
                                {MATRICULA_COLUMNS.map((column) => (
                                    <td key={column.key}
                                        style={column.key === 'cargaHoraria' ? {textAlign: 'center'} : {whiteSpace: 'normal'}}>
                                        {column.render(m)}
                                    </td>
                                ))}
                                <td style={{textAlign: 'center'}}>
                                    <span className={statusTurmaClass(m.statusTurma)}
                                          style={{fontWeight: 'bold'}}>{m.statusTurma}</span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    <span className={STATUS_MATRICULA_CLASS[m.statusMatricula] ?? 'statusCANCELADA'}
                                          style={{fontWeight: 'bold'}}>{m.statusMatricula}</span>
                                </td>
                                {showActionsColumn && (
                                    <td className="col-actions">
                                        <div className="row-actions-menu">{acoesDaMatricula(m)}</div>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}
            {cancelando && <CancelamentoModal onClose={() => setCancelando(false)}/>}
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

function ContractsTable({searchedIds, onBuscarContratos}: {
    searchedIds: number[] | null;
    onBuscarContratos: (pessoaId: number, pessoaNome: string) => void;
}) {
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
                const response = await api.get<PerfilModuloPermissions>(`/api/permissao/permissoes?caminho=${outcome}`);
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
    const acessoRelatorios = can('EXECUTE', outcome) || (perfilModuloPermissions?.relatorio ?? false);
    const acessoNovo = can('CREATE', outcome) || (perfilModuloPermissions?.novo ?? false);
    const acessoEditar = can('UPDATE', outcome) || (perfilModuloPermissions?.editar ?? false);
    const acessoRemover = can('DELETE', outcome) || (perfilModuloPermissions?.remover ?? false);
    // Espelha BaseController.getAcessoTudo: todas as permissões simultâneas.
    const acessoTudo = acessoRelatorios && acessoNovo && acessoEditar && acessoRemover;
    const showActionsColumn = acessoTudo || acessoRelatorios || acessoNovo || acessoEditar || acessoRemover;

    const abrirPlaceholder = (titulo: string, texto: string) => setPlaceholder({titulo, texto});

    // Documento em geração (chave do item do menu) â€” desabilita o item enquanto o PDF é gerado.
    const [gerandoDoc, setGerandoDoc] = useState<string | null>(null);

    // Espelha <p:fileDownload value="#{controller.metodo(entity)}"/>: POST no endpoint de geração
    // e baixa o PDF retornado (string base64 ou {fileName, contentType, base64Data}).
    const gerarDocumento = async (key: DocumentoKey | string, contratoId: number) => {
        const doc = DOCUMENTOS[key as DocumentoKey];
        if (!doc || gerandoDoc) return;
        setGerandoDoc(String(key));
        try {
            const response = await api.post<string | {
                fileName?: string;
                contentType?: string;
                base64Data?: string
            }>(doc.url, {}, {
                params: key === 'certificado' ? {contratos: contratoId} : {ccId: contratoId},
            });
            const data = response.data;
            let fileName = doc.arquivo(contratoId);
            let contentType = 'application/pdf';
            let base64: string | undefined;
            if (typeof data === 'string' && data.length > 0) {
                base64 = data;
            } else if (data && typeof data === 'object') {
                base64 = data.base64Data;
                if (data.fileName) fileName = data.fileName;
                if (data.contentType) contentType = data.contentType;
            }
            if (!base64) {
                abrirPlaceholder(
                    'Documento indisponível',
                    'A geração deste documento ainda não está disponível no servidor.',
                );
                return;
            }
            const rawBase64 = base64.includes(',') ? base64.slice(base64.indexOf(',') + 1) : base64;
            const blob = new Blob([Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0))], {type: contentType});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            const msg =
                (error as { response?: { data?: { error?: string } } })?.response?.data?.error
                ?? (error as Error)?.message
                ?? 'erro desconhecido';
            abrirPlaceholder('Erro ao gerar documento', `Não foi possível gerar o documento: ${msg}`);
        } finally {
            setGerandoDoc(null);
        }
    };

    const q = useModulePaged('/api/view/contrato/colunasContrato', page, size);
    const all = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);

    const items = searchedIds
        ? all.filter((item) => searchedIds.includes(Number(item.id)))
        : all;
    const colSpan = 3 + CONTRACT_COLUMNS.length + (showActionsColumn ? 1 : 0);

    return (
        <div className="data-table">
            {q.isError ? (
                <p>Erro ao carregar os contratos.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th className="col-toggle"></th>
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
                            const rec = asRecord(item);
                            const ativo = rec.ativo !== false;
                            const contratoId = Number(item.id);

                            // Regras espelhadas de gestaoAluno.xhtml:
                            // - Troca Turma: rendered="#{entity.trocaTurma eq true}"
                            // - Cancelamento (2ª via): rendered="#{entity.ativo eq false}"
                            // - Histórico Escolar: disabled="#{entity.dataConclusao eq null}"
                            // - Certificado: rendered="#{entity.dataConclusao ne null}"
                            const temTrocaTurma = rec.troca_turma === true;
                            const temConclusao = Boolean(rec.data_conclusao);

                            // Relatórios: <p:menuButton icon="ui-icon-document" styleClass="btnyellow"> em gestaoAluno.xhtml.
                            const relatoriosItems: RowMenuItem[] = [
                                {
                                    key: 'contrato',
                                    label: 'Contrato',
                                    className: 'btnstop',
                                    disabled: gerandoDoc === 'contrato',
                                    onSelect: () => gerarDocumento('contrato', contratoId),
                                },
                                {
                                    key: 'promissoria',
                                    label: 'Promissória',
                                    className: 'btnsky',
                                    disabled: gerandoDoc === 'promissoria',
                                    onSelect: () => gerarDocumento('promissoria', contratoId),
                                },
                                {
                                    key: 'reparcelamentoImpr',
                                    label: 'Reparcelamento',
                                    className: 'btngreen',
                                    onSelect: () => abrirPlaceholder(
                                        'Reparcelamento',
                                        'Imprimir segunda via de reparcelamento: gere o reparcelamento antes de imprimir.',
                                    ),
                                },
                                {
                                    key: 'precancelamentos',
                                    label: 'Pré cancelamentos',
                                    className: 'btnorange',
                                    onSelect: () => abrirPlaceholder('Pré cancelamentos', 'Pré cancelamentos criados no contrato.'),
                                },
                                ...(temTrocaTurma ? [{
                                    key: 'trocaTurma',
                                    label: 'Troca Turma',
                                    className: 'btnblue',
                                    onSelect: () => abrirPlaceholder('Troca Turma', 'Gerar segunda via troca de turma.'),
                                }] : []),
                                ...(ativo ? [] : [{
                                    key: 'cancelamentoImpr',
                                    label: 'Cancelamento',
                                    className: 'btnred',
                                    disabled: gerandoDoc === 'cancelamentoContratual',
                                    onSelect: () => gerarDocumento('cancelamentoContratual', contratoId),
                                }]),
                                {
                                    key: 'historicoEscolar',
                                    label: 'Histórico Escolar',
                                    className: 'btngrey',
                                    disabled: !temConclusao || gerandoDoc === 'historicoEscolar',
                                    onSelect: () => gerarDocumento('historicoEscolar', contratoId),
                                },
                                ...(temConclusao ? [{
                                    key: 'certificado',
                                    label: 'Certificado',
                                    className: 'btnpurple',
                                    disabled: gerandoDoc === 'certificado',
                                    onSelect: () => gerarDocumento('certificado', contratoId),
                                }] : []),
                                {
                                    key: 'boletim',
                                    label: 'Boletim Escolar',
                                    className: 'btnpink',
                                    disabled: gerandoDoc === 'boletim',
                                    onSelect: () => gerarDocumento('boletim', contratoId),
                                },
                                {
                                    key: 'presencasContrato',
                                    label: 'Presenças',
                                    className: 'btnbrown',
                                    onSelect: () => abrirPlaceholder('Presenças', 'Ver presenças deste contrato.'),
                                },
                                {
                                    key: 'notasContrato',
                                    label: 'Notas',
                                    className: 'btnblack',
                                    onSelect: () => abrirPlaceholder('Notas', 'Ver notas deste contrato.'),
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
                                            title="Carregar dados do aluno e seus contratos"
                                            disabled={!asRecord(item).id_pessoa}
                                            onClick={() => onBuscarContratos(
                                                Number(asRecord(item).id_pessoa),
                                                String(asRecord(item).pessoa_descricao ?? ''),
                                            )}
                                        >
                                            <i className="fa fa-info-circle"/>
                                        </button>
                                    </td>
                                    <td className="col-toggle">
                                        <button
                                            type="button"
                                            className="btn-row-toggle"
                                            title={isOpen ? 'Recolher' : 'Expandir'}
                                            onClick={() => setExpanded((prev) => ({...prev, [rowKey]: !prev[rowKey]}))}
                                        >
                                            {isOpen ? '▼' : '▶'}
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
                                        <MatriculasTable
                                            contratoId={contratoId}
                                            acessoTudo={acessoTudo}
                                            acessoRelatorios={acessoRelatorios}
                                            acessoNovo={acessoNovo}
                                            acessoEditar={acessoEditar}
                                            acessoRemover={acessoRemover}
                                        />
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
        return (data ?? []).map((item) => ({id: item.id, label: item.nome || `#${item.id}`}));
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
            .then((response) => setSearchedIds(response.data ?? []))
            .catch((error) => {
                setSearchedIds([]);
                const msg = error?.response?.data?.error ?? error?.message ?? 'Erro ao buscar os contratos do aluno.';
                setErro(msg);
            })
            .finally(() => setSearching(false));
    };

    // Espelha gestaoAlunoController.trazerContratosPessoa(entity): define o aluno na combo
    // e carrega os contratos dele, como ao selecionar o aluno no autoComplete.
    const buscarContratosDoAluno = (pessoaId: number, pessoaNome: string) => {
        selecionarAluno({id: pessoaId, label: pessoaNome || `#${pessoaId}`});
    };

    const activeAction = ACTIONS.find((action) => action.key === openAction) ?? null;

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
                            <button type="button" className="btn-form-back" onClick={() => selecionarAluno(null)}>
                                Limpar campo
                            </button>
                        </div>

                        {/* Ações do aluno: cada botão abre seu próprio modal (p:dialog), assim como em
                gestaoAluno.xhtml â€” não são etapas de um wizard. */}
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
                <ContractsTable searchedIds={searchedIds} onBuscarContratos={buscarContratosDoAluno}/>

                {activeAction && aluno && (
                    <>
{activeAction.key === 'situacao' && (
                                    <SituacaoFinanceiraModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                                )}
                        {activeAction.key === 'pessoais' && (
                            <DadosPessoaisModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'contratante' && (
                            <ContratanteModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'historicoNap' && (
                            <HistoricoNapModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'historicoCobranca' && (
                            <HistoricoCobrancaModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'notas' && (
                            <NotasModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'presencas' && (
                            <PresencasModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                        {activeAction.key === 'historicoAluno' && (
                            <HistoricoAlunoModal key={aluno.id} pessoaId={aluno.id} onClose={() => setOpenAction(null)}/>
                        )}
                    </>
                )}
            </main>
        </PermissionGate>
    );
}
