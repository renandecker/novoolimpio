import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PAGE_SIZES} from '../../shared/components/DataTable';
import type {Parcela} from './aluno';

export interface PessoaDados {
    id: number;
    nome: string;
    cpf: string;
    rg: string;
    dataNascimento: string | null;
    email: string;
    telefone: string;
    celular: string;
}

export interface TrocaTurma {
    id: number;
    data: string;
    usuarioNome: string;
    curso: string;
    componente: string;
    unidade: string;
    turmaAntes: number | null;
    turmaDepois: number | null;
}

export interface ResumoFinanceiro {
    situacao: string;
    diasAtraso: number;
    qtdParcelasAtrasadas: number;
    qtdParcelasRestantes: number;
    valorPendente: number;
}

export interface ContratoFinanceiro {
    id: number;
    curso: string;
    unidade: string;
    unidadeResponsavel: string;
    status: string;
    qtdeReparcelamento: number;
    proximaParcelaSequencia: number | null;
    proximaParcelaData: string | null;
    proximaParcelaValor: number | null;
    ultimaParcelaSequencia: number | null;
    ultimaParcelaData: string | null;
    ultimaParcelaValor: number | null;
}

export interface Parcela {
    id: number;
    contratoId: number | null;
    parcela: number | null;
    parcelaSequencia: number | null;
    multa: number;
    juros: number;
    desconto: number;
    dataVencimento: string | null;
    dataPagamento: string | null;
    dataCancelamento: string | null;
    valor: number;
    valorPago: number;
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
}

export interface Financeiro {
    resumo: ResumoFinanceiro;
    contratos: ContratoFinanceiro[];
    parcelasMes: Parcela[];
    parcelasMatricula: Parcela[];
    parcelasProdutos: Parcela[];
    parcelasCanceladas: Parcela[];
}

export interface LigacaoNap {
    id: number;
    dataInicial: string | null;
    telefone: string;
    observacao: string;
    resultado: string;
    retornoAula: string | null;
}

export interface EmailNap {
    id: number;
    data: string | null;
    email: string;
    assunto: string;
    mensagem: string;
}

export interface HistoricoNap {
    ligacoes: LigacaoNap[];
    emails: EmailNap[];
}

export interface LigacaoCobranca {
    id: number;
    dataInicial: string | null;
    telefone: string;
    observacao: string;
    resultado: string;
    qtdeParcela: number | null;
    valor: number | null;
}

export interface EmailCobranca {
    id: number;
    data: string | null;
    email: string;
    assunto: string;
    mensagem: string;
    qtdeParcela: number | null;
    valor: number | null;
}

export interface HistoricoCobranca {
    ligacoes: LigacaoCobranca[];
    emails: EmailCobranca[];
}

export interface Matricula {
    id: number;
    curso: string;
    componente: string;
    unidade: string;
    turma: number | null;
    periodo: string;
    ano: number | null;
    status: string;
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
}

export interface Avaliacao {
    ordem: number | null;
    nota: number | null;
    conceito: string;
}

export interface GrauNota {
    id: number;
    idGrauNota: number;
    nome: string;
    numeroNota: number | null;
    peso: number | null;
    nota: number | null;
    avaliacoes: Avaliacao[];
}

export interface Grau {
    id: number;
    descricao: string;
    notaMaxima: number | null;
    mediaSemExame: number | null;
    mediaFinal: number | null;
    frequenciaMinima: number | null;
    notas: GrauNota[];
}

export interface Boletim {
    matricula: Matricula;
    graus: Grau[];
    media: number | null;
    status: string;
    frequenciaPerc: number | null;
}

export interface OcorrenciaPresenca {
    data: string | null;
    presenca: string;
    presencaDescricao: string;
    componente: string;
}

export interface Frequencia {
    matricula: Matricula;
    ocorrencias: OcorrenciaPresenca[];
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
}

export interface HistoricoAlunoRegistro {
    id: number;
    dataRegistro: string | null;
    descricao: string;
    usuarioId: number;
    usuarioNome: string;
}

interface GestaoModalProps {
    pessoaId: number;
    onClose: () => void;
}

const fmtData = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('pt-BR') : '—';
const fmtDataHora = (value?: string | null) =>
    value ? new Date(value).toLocaleString('pt-BR') : '—';
const fmtMoeda = (value?: number | null) =>
    value === null || value === undefined
        ? '—'
        : value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

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
                    <button type="button" className="btn-form-back" onClick={onClose}>
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

function Tabs({tabs}: { tabs: { key: string; label: string; content: ReactNode }[] }) {
    const [active, setActive] = useState(tabs[0]?.key ?? '');
    return (
        <div>
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        className={tab.key === active ? 'tab tab-active' : 'tab'}
                        onClick={() => setActive(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content">{tabs.find((tab) => tab.key === active)?.content ?? null}</div>
        </div>
    );
}

interface TabelaColuna {
    key: string;
    label: string;
    render?: (row: Record<string, unknown>) => ReactNode;
}

interface AccordionPanelItem {
    key: string;
    title: ReactNode;
    content: ReactNode;
}

function Accordion({panels}: { panels: AccordionPanelItem[] }) {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    return (
        <div className="accordion">
            {panels.map((panel) => {
                const open = panel.key === activeKey;
                return (
                    <div key={panel.key} className="accordion-item">
                        <button
                            type="button"
                            className={open ? 'accordion-header accordion-header-active' : 'accordion-header'}
                            onClick={() => setActiveKey(open ? null : panel.key)}
                        >
                            <span className="accordion-toggle-icon">{open ? '▾' : '▸'}</span>
                            <span className="accordion-title">{panel.title}</span>
                        </button>
                        {open && <div className="accordion-content">{panel.content}</div>}
                    </div>
                );
            })}
        </div>
    );
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
                linhas.map((linha) => (
                    <tr key={String(linha.id)}>
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

interface TabelaDadosPaginadaProps {
    colunas: TabelaColuna[];
    linhas: Record<string, unknown>[];
    vazio: string;
    pageSize?: number;
}

function TabelaDadosPaginada({colunas, linhas, vazio, pageSize = 10}: TabelaDadosPaginadaProps) {
    const [pageState, setPageState] = useState(0);
    const [size, setSize] = useState(pageSize);

    const totalPages = Math.max(1, Math.ceil(linhas.length / size));
    const page = Math.min(pageState, totalPages - 1);
    const setPage = setPageState;
    const start = page * size;
    const end = start + size;
    const paginaLinhas = linhas.slice(start, end);

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
            {paginaLinhas.length === 0 ? (
                <tr>
                    <td colSpan={colunas.length}>{vazio}</td>
                </tr>
            ) : (
                paginaLinhas.map((linha) => (
                    <tr key={String(linha.id)}>
                        {colunas.map((coluna) => (
                            <td key={coluna.key}>
                                {coluna.render ? coluna.render(linha) : String(linha[coluna.key] ?? '')}
                            </td>
                        ))}
                    </tr>
                ))
            )}
            </tbody>
            {totalPages > 1 && (
                <tfoot>
                <tr>
                    <td colSpan={colunas.length} className="data-table-paginator">
                        <button onClick={() => setPage(0)} disabled={page === 0}>
                            Primeira
                        </button>
                        <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>
                            Anterior
                        </button>
                        <span>
                (Pag. {page + 1}/{totalPages} - {linhas.length} registros)
              </span>
                        <button onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1}>
                            Próxima
                        </button>
                        <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                            Última
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
                    </td>
                </tr>
                </tfoot>
            )}
        </table>
    );
}

function DadosPessoa({dados}: { dados: PessoaDados }) {
    const campos: [string, ReactNode][] = [
        ['Nome', dados.nome],
        ['CPF', dados.cpf],
        ['RG', dados.rg],
        ['Data de nascimento', fmtData(dados.dataNascimento)],
        ['E-mail', dados.email],
        ['Telefone', dados.telefone],
        ['Celular', dados.celular],
    ];
    return (
        <div className="form-grid">
            {campos.map(([rotulo, valor]) => (
                <label key={rotulo} className="form-field">
                    <span className="form-label">{rotulo}</span>
                    <input className="form-input" value={String(valor ?? '')} readOnly/>
                </label>
            ))}
        </div>
    );
}

const PARCELA_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'Parcela'},
    {key: 'contratoId', label: 'Contrato'},
    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
    {
        key: 'situacao', label: 'Situação', render: (linha) => {
            const situacao = String(linha.situacao ?? '');
            const situacaoCor = String(linha.situacaoCor ?? '');
            const dataPagamento = linha.dataPagamento as string | null;
            if (dataPagamento) {
                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
            }
            return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
        }
    },
    {key: 'acoes', label: 'Ações', render: (linha) => (
        <span data-parcela-id={String(linha.id ?? '')} data-id-parcela-pix={String(linha.idParcelaPix ?? '')} data-valor={String(linha.valor ?? '')} data-vencimento={String(linha.dataVencimento ?? '')} data-contrato-id={String(linha.contratoId ?? '')} data-descricao={String(linha.descricao ?? '')} className="parcela-acoes"/>
    )},
];

const PARCELA_MATRICULA_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'Parcela'},
    {key: 'contratoId', label: 'Contrato'},
    {key: 'parcela', label: 'Nº'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
    {key: 'valorPago', label: 'Valor pago', render: (linha) => fmtMoeda(linha.valorPago as number | null)},
    {
        key: 'situacao', label: 'Situação', render: (linha) => {
            const situacao = String(linha.situacao ?? '');
            const situacaoCor = String(linha.situacaoCor ?? '');
            const dataPagamento = linha.dataPagamento as string | null;
            if (dataPagamento) {
                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
            }
return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
        }
    },
    {key: 'acoes', label: 'Ações', render: (linha) => (
        <span data-parcela-id={String(linha.id ?? '')} data-id-parcela-pix={String(linha.idParcelaPix ?? '')} data-valor={String(linha.valor ?? '')} data-vencimento={String(linha.dataVencimento ?? '')} data-contrato-id={String(linha.contratoId ?? '')} data-descricao={String(linha.descricao ?? '')} className="parcela-acoes"/>
    )},
];

const PRODUTO_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'Parcela'},
    {key: 'contratoId', label: 'Contrato'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
    {key: 'valorPago', label: 'Valor pago', render: (linha) => fmtMoeda(linha.valorPago as number | null)},
{
        key: 'situacao', label: 'Situação', render: (linha) => {
            const situacao = String(linha.situacao ?? '');
            const situacaoCor = String(linha.situacaoCor ?? '');
            const dataPagamento = linha.dataPagamento as string | null;
            if (dataPagamento) {
                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
            }
            return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
        }
    },
    {key: 'acoes', label: 'Ações', render: (linha) => <span data-parcela-id={String(linha.id ?? '')} data-id-parcela-pix={String(linha.idParcelaPix ?? '')} data-valor={String(linha.valor ?? '')} data-vencimento={String(linha.dataVencimento ?? '')} data-contrato-id={String(linha.contratoId ?? '')} data-descricao={String(linha.descricao ?? '')} className="parcela-acoes"/>,
}];

const CANCELADA_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'Parcela'},
    {key: 'contratoId', label: 'Contrato'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
    {
        key: 'dataCancelamento',
        label: 'Cancelamento',
        render: (linha) => fmtData(linha.dataCancelamento as string | null)
    },
    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
];

export function SituacaoFinanceiraModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'financeiro', pessoaId],
        queryFn: async () => (await api.get<Financeiro>(`/api/aluno/gestao/${pessoaId}/financeiro`)).data,
    });
    const [pixModalOpen, setPixModalOpen] = useState(false);
    const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);

    if (q.isLoading) return <ModalFrame titulo="Situação Financeira" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError || !q.data) return <ModalFrame titulo="Situação Financeira" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    const {resumo, contratos, parcelasMes, parcelasMatricula, parcelasProdutos, parcelasCanceladas} = q.data;
    const todasParcelas = [...parcelasMes, ...parcelasMatricula, ...parcelasProdutos, ...parcelasCanceladas];

    const handlePixClick = (parcela: Parcela) => {
        if (parcela.dataPagamento) return; // Não mostrar botão para parcelas pagas
        setSelectedParcela(parcela);
        setPixModalOpen(true);
    };

    const closePixModal = () => {
        setPixModalOpen(false);
        setSelectedParcela(null);
    };

    // Helper to create parcela action buttons
    const renderAcoes = (linha: Record<string, unknown>) => {
        const id = Number(linha.id);
        const idParcelaPix = linha.idParcelaPix ? Number(linha.idParcelaPix) : null;
        const dataPagamento = linha.dataPagamento as string | null;
        if (dataPagamento) return null; // Não mostrar botão para parcelas pagas

        const parcela: Parcela = {
            id,
            idParcelaPix,
            valor: linha.valor as number | null,
            dataVencimento: linha.dataVencimento as string | null,
            contratoId: linha.contratoId as number | null,
            descricao: linha.descricao as string,
            pessoaId,
        };

        const temPix = Boolean(idParcelaPix);
        return (
            <button
                type="button"
                className={temPix ? 'btnyellow' : 'btnblue'}
                style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}}
                onClick={() => handlePixClick(parcela)}
                title={temPix ? 'Ver PIX gerado / Enviar por e-mail' : 'Gerar QR Code PIX'}
            >
                {temPix ? '📱 PIX' : '📱 Gerar PIX'}
            </button>
        );
    };

    return (
        <ModalFrame titulo="Situação Financeira" onClose={onClose}>
            <Tabs
                tabs={[
                    {
                        key: 'financeiro',
                        label: 'Financeiro',
                        content: (
                            <>
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Situação</span>
                                        <input className="form-input" value={resumo.situacao} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Maior dia em atraso</span>
                                        <input className="form-input"
                                               value={resumo.diasAtraso > 0 ? `${resumo.diasAtraso} (dias)` : 'Em dia'}
                                               readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Qtd parcelas em atraso</span>
                                        <input className="form-input" value={resumo.qtdParcelasAtrasadas} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Qtd parcelas restantes</span>
                                        <input className="form-input" value={resumo.qtdParcelasRestantes} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Valor pendente</span>
                                        <input className="form-input" value={fmtMoeda(resumo.valorPendente)} readOnly/>
                                    </label>
                                </div>
                                <h3>Contratos</h3>
                                <TabelaDadosPaginada
                                    vazio="Nenhum contrato encontrado."
                                    colunas={[
                                        {key: 'id', label: 'Contrato'},
                                        {key: 'curso', label: 'Curso'},
                                        {key: 'unidade', label: 'Unidade'},
                                        {key: 'unidadeResponsavel', label: 'Unidade Responsável'},
                                        {key: 'status', label: 'Status'},
                                        {key: 'qtdeReparcelamento', label: 'Reparcelamentos'},
                                        {
                                            key: 'proxima',
                                            label: 'Próxima parcela',
                                            render: (linha) => `${linha.proximaParcelaSequencia ?? '—'} · ${fmtData(linha.proximaParcelaData as string | null)} · ${fmtMoeda(linha.proximaParcelaValor as number | null)}`
                                        },
                                        {
                                            key: 'ultima',
                                            label: 'Última parcela',
                                            render: (linha) => `${linha.ultimaParcelaSequencia ?? '—'} · ${fmtData(linha.ultimaParcelaData as string | null)} · ${fmtMoeda(linha.ultimaParcelaValor as number | null)}`
                                        },
                                    ]}
                                    linhas={contratos as unknown as Record<string, unknown>[]}
                                />
                            </>
                        ),
                    },
                    {
                        key: 'parcelasMes',
                        label: 'Parcelas do Mês e Vencidas',
                        content: (
                            <TabelaDadosPaginada
                                vazio="Nenhuma parcela para o mês corrente."
                                colunas={[
                                    {key: 'id', label: 'Parcela'},
                                    {key: 'contratoId', label: 'Contrato'},
                                    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
                                    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
                                    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
                                    {
                                        key: 'situacao', label: 'Situação', render: (linha) => {
                                            const situacao = String(linha.situacao ?? '');
                                            const situacaoCor = String(linha.situacaoCor ?? '');
                                            const dataPagamento = linha.dataPagamento as string | null;
                                            if (dataPagamento) {
                                                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
                                            }
                                            return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
                                        }
                                    },
                                    {key: 'acoes', label: 'Ações', render: renderAcoes},
                                ]}
                                linhas={parcelasMes as unknown as Record<string, unknown>[]}
                            />
                        ),
                    },
                    {
                        key: 'verTodos',
                        label: 'Ver Todos',
                        content: (
                            <TabelaDadosPaginada
                                vazio="Nenhuma parcela encontrada."
                                colunas={[
                                    {key: 'id', label: 'Parcela'},
                                    {key: 'contratoId', label: 'Contrato'},
                                    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
                                    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
                                    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
                                    {
                                        key: 'situacao', label: 'Situação', render: (linha) => {
                                            const situacao = String(linha.situacao ?? '');
                                            const situacaoCor = String(linha.situacaoCor ?? '');
                                            const dataPagamento = linha.dataPagamento as string | null;
                                            if (dataPagamento) {
                                                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
                                            }
                                            return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
                                        }
                                    },
                                    {key: 'acoes', label: 'Ações', render: renderAcoes},
                                ]}
                                linhas={todasParcelas as unknown as Record<string, unknown>[]}
                            />
                        ),
                    },
                    {
                        key: 'matricula',
                        label: 'Matrícula',
                        content: (
                            <TabelaDadosPaginada
                                vazio="Nenhuma parcela de matrícula encontrada."
                                colunas={[
                                    {key: 'id', label: 'Parcela'},
                                    {key: 'contratoId', label: 'Contrato'},
                                    {key: 'parcela', label: 'Nº'},
                                    {key: 'descricao', label: 'Descrição'},
                                    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
                                    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
                                    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
                                    {key: 'valorPago', label: 'Valor pago', render: (linha) => fmtMoeda(linha.valorPago as number | null)},
                                    {
                                        key: 'situacao', label: 'Situação', render: (linha) => {
                                            const situacao = String(linha.situacao ?? '');
                                            const situacaoCor = String(linha.situacaoCor ?? '');
                                            const dataPagamento = linha.dataPagamento as string | null;
                                            if (dataPagamento) {
                                                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
                                            }
                                            return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
                                        }
                                    },
                                    {key: 'acoes', label: 'Ações', render: renderAcoes},
                                ]}
                                linhas={parcelasMatricula as unknown as Record<string, unknown>[]}
                            />
                        ),
                    },
                    {
                        key: 'produtos',
                        label: 'Produtos',
                        content: (
                            <TabelaDadosPaginada
                                vazio="Nenhuma parcela de produto encontrada."
                                colunas={[
                                    {key: 'id', label: 'Parcela'},
                                    {key: 'contratoId', label: 'Contrato'},
                                    {key: 'descricao', label: 'Descrição'},
                                    {key: 'dataVencimento', label: 'Vencimento', render: (linha) => fmtData(linha.dataVencimento as string | null)},
                                    {key: 'dataPagamento', label: 'Pagamento', render: (linha) => fmtData(linha.dataPagamento as string | null)},
                                    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
                                    {key: 'valorPago', label: 'Valor pago', render: (linha) => fmtMoeda(linha.valorPago as number | null)},
                                    {
                                        key: 'situacao', label: 'Situação', render: (linha) => {
                                            const situacao = String(linha.situacao ?? '');
                                            const situacaoCor = String(linha.situacaoCor ?? '');
                                            const dataPagamento = linha.dataPagamento as string | null;
                                            if (dataPagamento) {
                                                return <span style={{color: '#0000FF', cursor: 'pointer'}}>Pago</span>;
                                            }
                                            return situacaoCor ? <span style={{color: situacaoCor, fontWeight: 'bold'}}>{situacao}</span> : situacao;
                                        }
                                    },
                                    {key: 'acoes', label: 'Ações', render: renderAcoes},
                                ]}
                                linhas={parcelasProdutos as unknown as Record<string, unknown>[]}
                            />
                        ),
                    },
                    {
                        key: 'canceladas',
                        label: 'Canceladas',
                        content: (
                            <TabelaDadosPaginada
                                vazio="Nenhuma parcela cancelada."
                                colunas={CANCELADA_COLUNAS}
                                linhas={parcelasCanceladas as unknown as Record<string, unknown>[]}
                            />
                        ),
                    },
                ]}
            />
            <PixQrCodeModal
                isOpen={pixModalOpen}
                onClose={closePixModal}
                parcela={selectedParcela}
            />
        </ModalFrame>
    );
}

export function DadosPessoaisModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'perfil', pessoaId],
        queryFn: async () => (await api.get<PessoaDados>(`/api/aluno/gestao/${pessoaId}/perfil`)).data,
    });
    if (q.isLoading) return <ModalFrame titulo="Dados Pessoais Aluno" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError || !q.data) return <ModalFrame titulo="Dados Pessoais Aluno" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    return (
        <ModalFrame titulo="Dados Pessoais Aluno" onClose={onClose}>
            <DadosPessoa dados={q.data}/>
        </ModalFrame>
    );
}

export function ContratanteModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'contratantes', pessoaId],
        queryFn: async () => (await api.get<PessoaDados[]>(`/api/aluno/gestao/${pessoaId}/contratantes`)).data,
    });
    if (q.isLoading) return <ModalFrame titulo="Dados Pessoais Contratante"
                                        onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError) return <ModalFrame titulo="Dados Pessoais Contratante" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    const contratantes = q.data ?? [];
    return (
        <ModalFrame titulo="Dados Pessoais Contratante" onClose={onClose}>
            {contratantes.length === 0 ? (
                <p className="master-detail-empty">Nenhum contratante encontrado.</p>
            ) : (
                contratantes.map((contratante) => (
                    <div key={contratante.id} className="master-detail" style={{marginBottom: '1rem'}}>
                        <DadosPessoa dados={contratante}/>
                    </div>
                ))
            )}
        </ModalFrame>
    );
}

const NAP_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'ID da Ligação NAP'},
    {key: 'dataInicial', label: 'Data', render: (linha) => fmtDataHora(linha.dataInicial as string | null)},
    {key: 'telefone', label: 'Telefone'},
    {key: 'resultado', label: 'Resultado'},
    {key: 'retornoAula', label: 'Retorno', render: (linha) => fmtData(linha.retornoAula as string | null)},
    {key: 'observacao', label: 'Observação'},
];

const NAP_EMAIL_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'ID do Email NAP'},
    {key: 'data', label: 'Data', render: (linha) => fmtDataHora(linha.data as string | null)},
    {key: 'email', label: 'E-mail'},
    {key: 'assunto', label: 'Assunto'},
    {key: 'mensagem', label: 'Mensagem'},
];

export function HistoricoNapModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'historico-nap', pessoaId],
        queryFn: async () => (await api.get<HistoricoNap>(`/api/aluno/gestao/${pessoaId}/historico-nap`)).data,
    });
    if (q.isLoading) return <ModalFrame titulo="Histórico NAP" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError || !q.data) return <ModalFrame titulo="Histórico NAP" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    return (
        <ModalFrame titulo="Histórico NAP" onClose={onClose}>
            <Tabs
                tabs={[
                    {
                        key: 'ligacao',
                        label: 'Ligação',
                        content: <TabelaDadosPaginada vazio="Nenhuma ligação encontrada." colunas={NAP_COLUNAS}
                                                      linhas={q.data.ligacoes as unknown as Record<string, unknown>[]}/>,
                    },
                    {
                        key: 'email',
                        label: 'E-mail',
                        content: <TabelaDadosPaginada vazio="Nenhum e-mail encontrado." colunas={NAP_EMAIL_COLUNAS}
                                                      linhas={q.data.emails as unknown as Record<string, unknown>[]}/>,
                    },
                ]}
            />
        </ModalFrame>
    );
}

const COBRANCA_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'ID da Ligação de Cobrança'},
    {key: 'dataInicial', label: 'Data', render: (linha) => fmtDataHora(linha.dataInicial as string | null)},
    {key: 'telefone', label: 'Telefone'},
    {key: 'resultado', label: 'Resultado'},
    {key: 'qtdeParcela', label: 'Qtd parcelas'},
    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
    {key: 'observacao', label: 'Observação'},
];

const COBRANCA_EMAIL_COLUNAS: TabelaColuna[] = [
    {key: 'id', label: 'ID do Email de Cobrança'},
    {key: 'data', label: 'Data', render: (linha) => fmtDataHora(linha.data as string | null)},
    {key: 'email', label: 'E-mail'},
    {key: 'assunto', label: 'Assunto'},
    {key: 'mensagem', label: 'Mensagem'},
    {key: 'qtdeParcela', label: 'Qtd parcelas'},
    {key: 'valor', label: 'Valor', render: (linha) => fmtMoeda(linha.valor as number | null)},
];

export function HistoricoCobrancaModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'historico-cobranca', pessoaId],
        queryFn: async () => (await api.get<HistoricoCobranca>(`/api/aluno/gestao/${pessoaId}/historico-cobranca`)).data,
    });
    if (q.isLoading) return <ModalFrame titulo="Histórico Cobrança" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError || !q.data) return <ModalFrame titulo="Histórico Cobrança" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    return (
        <ModalFrame titulo="Histórico Cobrança" onClose={onClose}>
            <Tabs
                tabs={[
                    {
                        key: 'ligacao',
                        label: 'Ligação',
                        content: <TabelaDadosPaginada vazio="Nenhuma ligação encontrada." colunas={COBRANCA_COLUNAS}
                                                      linhas={q.data.ligacoes as unknown as Record<string, unknown>[]}/>,
                    },
                    {
                        key: 'email',
                        label: 'E-mail',
                        content: <TabelaDadosPaginada vazio="Nenhum e-mail encontrado." colunas={COBRANCA_EMAIL_COLUNAS}
                                                      linhas={q.data.emails as unknown as Record<string, unknown>[]}/>,
                    },
                ]}
            />
        </ModalFrame>
    );
}

function GrausDeNotas({boletim}: { boletim: Boletim }) {
    return (
        <div>
            {boletim.graus.map((grau) => (
                <div key={grau.id} className="master-detail" style={{marginBottom: '0.5rem'}}>
                    <strong>{grau.descricao}</strong>
                    <TabelaDadosPaginada
                        vazio="Sem notas lançadas."
                        colunas={[
                            {key: 'nome', label: 'Nota'},
                            {key: 'peso', label: 'Peso'},
                            {key: 'nota', label: 'Nota obtida'},
                        ]}
                        linhas={grau.notas as unknown as Record<string, unknown>[]}
                    />
                </div>
            ))}
        </div>
    );
}

export function NotasModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'boletim', pessoaId],
        queryFn: async () => (await api.get<Boletim[]>(`/api/aluno/gestao/${pessoaId}/boletim`)).data,
    });
    if (q.isLoading) return <ModalFrame titulo="Notas" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError) return <ModalFrame titulo="Notas" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    const boletins = q.data ?? [];
    return (
        <ModalFrame titulo="Notas" onClose={onClose}>
            {boletins.length === 0 ? (
                <p className="master-detail-empty">Nenhuma matrícula encontrada.</p>
            ) : (
                <Accordion
                    panels={boletins.map((boletim) => ({
                        key: String(boletim.matricula.id),
                        title: `${boletim.matricula.curso} - ${boletim.matricula.componente} - Turma ${boletim.matricula.turma ?? '—'} (${boletim.status})`,
                        content: (
                            <>
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Curso</span>
                                        <input className="form-input" value={boletim.matricula.curso} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Componente</span>
                                        <input className="form-input" value={boletim.matricula.componente} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Turma</span>
                                        <input className="form-input" value={boletim.matricula.turma ?? '—'} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Média</span>
                                        <input className="form-input" value={boletim.media ?? '—'} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Situação</span>
                                        <input className="form-input" value={boletim.status} readOnly/>
                                    </label>
                                </div>
                                <GrausDeNotas boletim={boletim}/>
                            </>
                        ),
                    }))}
                />
            )}
        </ModalFrame>
    );
}

const PRESENCA_COR: Record<string, string> = {
    p: 'Presente',
    m: 'Meia presença',
    a: 'Ausente',
    t: 'Atestado',
    c: 'Cancelado',
    v: 'Troca de turma',
    r: 'Prorrogado',
    n: 'Sem marcação',
    d: 'Atrasado',
    i: 'Irregular',
};

export function PresencasModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'frequencias', pessoaId],
        queryFn: async () => (await api.get<Frequencia[]>(`/api/aluno/gestao/${pessoaId}/frequencias`)).data,
    });
    const qTroca = useQuery({
        queryKey: ['gestao-aluno', 'trocas-turma', pessoaId],
        queryFn: async () => (await api.get<TrocaTurma[]>(`/api/aluno/gestao/${pessoaId}/trocas-turma`)).data,
    });
    if (q.isLoading || qTroca.isLoading) return <ModalFrame titulo="Presenças" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError) return <ModalFrame titulo="Presenças" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    if (qTroca.isError) return <ModalFrame titulo="Presenças" onClose={onClose}><Erro
        mensagem={apiError(qTroca.error)}/></ModalFrame>;
    const frequencias = q.data ?? [];
    const trocasTurma = qTroca.data ?? [];
    return (
        <ModalFrame titulo="Presenças" onClose={onClose}>
            <Accordion
                panels={[
                    ...frequencias.map((frequencia) => ({
                        key: String(frequencia.matricula.id),
                        title: `${frequencia.matricula.curso} - ${frequencia.matricula.componente} - Turma ${frequencia.matricula.turma ?? '—'} (${frequencia.frequenciaPerc == null ? '—' : `${frequencia.frequenciaPerc}%`})`,
                        content: (
                            <>
                                <div className="form-grid">
                                    <label className="form-field">
                                        <span className="form-label">Curso</span>
                                        <input className="form-input" value={frequencia.matricula.curso} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Componente</span>
                                        <input className="form-input" value={frequencia.matricula.componente}
                                               readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Turma</span>
                                        <input className="form-input" value={frequencia.matricula.turma ?? '—'}
                                               readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Frequência</span>
                                        <input className="form-input"
                                               value={frequencia.frequenciaPerc == null ? '—' : `${frequencia.frequenciaPerc}%`}
                                               readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Presentes</span>
                                        <input className="form-input" value={frequencia.presentes} readOnly/>
                                    </label>
                                    <label className="form-field">
                                        <span className="form-label">Ausentes</span>
                                        <input className="form-input" value={frequencia.ausentes} readOnly/>
                                    </label>
                                </div>
                                <TabelaDadosPaginada
                                    vazio="Nenhuma ocorrência de presença."
                                    colunas={[
                                        {
                                            key: 'data',
                                            label: 'Data',
                                            render: (linha) => fmtData(linha.data as string | null)
                                        },
                                        {
                                            key: 'presenca',
                                            label: 'Presença',
                                            render: (linha) => PRESENCA_COR[String(linha.presenca ?? '')] ?? String(linha.presenca ?? '')
                                        },
                                        {key: 'componente', label: 'Componente'},
                                    ]}
                                    linhas={frequencia.ocorrencias as unknown as Record<string, unknown>[]}
                                />
                            </>
                        ),
                    })),
                    {
                        key: 'trocaTurma',
                        title: 'Troca Turma',
                        content: trocasTurma.length === 0 ? (
                            <p className="master-detail-empty">Nenhuma troca de turma registrada.</p>
                        ) : (
                            <TabelaDadosPaginada
                                vazio="Nenhuma troca de turma registrada."
                                colunas={[
                                    {
                                        key: 'data',
                                        label: 'Data',
                                        render: (linha) => fmtDataHora(linha.data as string | null)
                                    },
                                    {key: 'usuarioNome', label: 'Usuário'},
                                    {key: 'curso', label: 'Curso'},
                                    {key: 'componente', label: 'Componente'},
                                    {key: 'unidade', label: 'Unidade'},
                                    {
                                        key: 'turmaAntes',
                                        label: 'Turma Anterior',
                                        render: (linha) => linha.turmaAntes ?? '—'
                                    },
                                    {
                                        key: 'turmaDepois',
                                        label: 'Turma Nova',
                                        render: (linha) => linha.turmaDepois ?? '—'
                                    },
                                ]}
                                linhas={trocasTurma as unknown as Record<string, unknown>[]}
                            />
                        ),
                    },
                ]}
            />
        </ModalFrame>
    );
}

export function HistoricoAlunoModal({pessoaId, onClose}: GestaoModalProps) {
    const q = useQuery({
        queryKey: ['gestao-aluno', 'historico-aluno', pessoaId],
        queryFn: async () => (await api.get<HistoricoAlunoRegistro[]>(`/api/aluno/gestao/${pessoaId}/historico-aluno`)).data,
    });
    if (q.isLoading) return <ModalFrame titulo="Histórico aluno" onClose={onClose}><Carregando/></ModalFrame>;
    if (q.isError) return <ModalFrame titulo="Histórico aluno" onClose={onClose}><Erro
        mensagem={apiError(q.error)}/></ModalFrame>;
    const registros = q.data ?? [];
    return (
        <ModalFrame titulo="Histórico aluno" onClose={onClose}>
            <TabelaDadosPaginada
                vazio="Nenhum registro no histórico do aluno."
                colunas={[
                    {key: 'id', label: 'ID do Registro Histórico'},
                    {
                        key: 'dataRegistro',
                        label: 'Data',
                        render: (linha) => fmtDataHora(linha.dataRegistro as string | null)
                    },
                    {key: 'descricao', label: 'Descrição'},
                    {key: 'usuarioNome', label: 'Usuário'},
                ]}
                linhas={registros as unknown as Record<string, unknown>[]}
            />
        </ModalFrame>
    );
}

interface PixQrCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    parcela: {
        id: number;
        idParcelaPix: number | null;
        valor: number | null;
        dataVencimento: string | null;
        contratoId: number | null;
        descricao: string;
        pessoaId: number;
    } | null;
}

function PixQrCodeModal({isOpen, onClose, parcela}: PixQrCodeModalProps) {
    const [pixData, setPixData] = useState<{qrcode: string; chave: string; situacao: string} | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        if (isOpen && parcela?.idParcelaPix) {
            fetchPixData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, parcela?.idParcelaPix]);

    if (!isOpen || !parcela) return null;

    const fetchPixData = async () => {
        if (!parcela) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<{qrcode: string; chave: string; situacao: string}>(
                `/api/asaas/pix/parcela/${parcela.id}`
            );
            setPixData(response.data);
        } catch (err) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                ?? (err as Error)?.message
                ?? 'Erro ao buscar PIX';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const gerarPix = async () => {
        if (!parcela) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<{qrcode: string; chave: string; situacao: string}>(
                '/api/asaas/pix',
                {
                    idParcela: parcela.id,
                    idPessoa: parcela.pessoaId,
                    valor: parcela.valor,
                    dataVencimento: parcela.dataVencimento,
                }
            );
            setPixData(response.data);
        } catch (err) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                ?? (err as Error)?.message
                ?? 'Erro ao gerar PIX';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const enviarEmail = async () => {
        if (!pixData || !parcela) return;
        setSendingEmail(true);
        setEmailSent(false);
        try {
            await api.post('/api/asaas/pix/enviar-email', {
                idParcela: parcela.id,
                idPessoa: parcela.pessoaId,
                qrcode: pixData.qrcode,
                chave: pixData.chave,
            });
            setEmailSent(true);
        } catch (err) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
                ?? (err as Error)?.message
                ?? 'Erro ao enviar e-mail';
            setError(msg);
        } finally {
            setSendingEmail(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
                <h2>PIX - {parcela.descricao || `Parcela ${parcela.id}`}</h2>
                <div style={{padding: '1rem'}}>
                    {loading && <p className="master-detail-empty">Gerando QR Code PIX...</p>}
                    {error && <p className="form-erro">{error}</p>}
                    {emailSent && <p style={{color: 'green'}}>E-mail enviado com sucesso!</p>}

                    {pixData && !loading && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
                            <div>
                                <strong>QR Code PIX</strong>
                                <div style={{marginTop: '0.5rem', textAlign: 'center'}}>
                                    {pixData.qrcode && (
                                        <img
                                            src={`data:image/png;base64,${pixData.qrcode}`}
                                            alt="QR Code PIX"
                                            style={{maxWidth: '250px', maxHeight: '250px'}}
                                        />
                                    )}
                                    {!pixData.qrcode && <p style={{color: '#666'}}>QR Code não disponível</p>}
                                </div>
                            </div>
                            <div style={{width: '100%', maxWidth: '400px'}}>
                                <strong>Código PIX (Copia e Cola)</strong>
                                <textarea
                                    readOnly
                                    rows={4}
                                    style={{width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', marginTop: '0.5rem'}}
                                    value={pixData.chave || ''}
                                />
                                <button
                                    type="button"
                                    className="btn-form-save"
                                    style={{marginTop: '0.5rem'}}
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.chave || '');
                                        alert('Código PIX copiado para a área de transferência!');
                                    }}
                                >
                                    Copiar Código PIX
                                </button>
                            </div>
                            <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                                {parcela.idParcelaPix ? (
                                    <button
                                        type="button"
                                        className="btnyellow"
                                        disabled={sendingEmail}
                                        onClick={enviarEmail}
                                    >
                                        {sendingEmail ? 'Enviando...' : 'Enviar por E-mail'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btnblue"
                                        disabled={loading}
                                        onClick={gerarPix}
                                    >
                                        {loading ? 'Gerando...' : 'Gerar PIX'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {!pixData && !loading && !parcela.idParcelaPix && (
                        <div style={{textAlign: 'center', padding: '2rem'}}>
                            <p>Esta parcela ainda não possui um QR Code PIX gerado.</p>
                            <button
                                type="button"
                                className="btnblue"
                                disabled={loading}
                                onClick={gerarPix}
                                style={{marginTop: '1rem'}}
                            >
                                {loading ? 'Gerando...' : 'Gerar QR Code PIX'}
                            </button>
                        </div>
                    )}

                    {!pixData && !loading && parcela.idParcelaPix && (
                        <div style={{textAlign: 'center', padding: '2rem'}}>
                            <p>Esta parcela já possui PIX gerado. Clique em "Enviar por E-mail" para reenviar.</p>
                            <button
                                type="button"
                                className="btnyellow"
                                disabled={sendingEmail}
                                onClick={enviarEmail}
                                style={{marginTop: '1rem'}}
                            >
                                {sendingEmail ? 'Enviando...' : 'Enviar por E-mail'}
                            </button>
                        </div>
                    )}
                </div>
                <div className="modal-actions form-footer">
                    <button type="button" className="btn-form-back" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export { PixQrCodeModal };
