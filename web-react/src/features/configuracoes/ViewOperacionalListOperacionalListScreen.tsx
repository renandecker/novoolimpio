import {useState, useCallback} from 'react';
import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../DataTable';
import {api} from '../api';
import {Modal} from '../Modal';
import type {ApiItem} from '../types';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'pacote_descricao', label: 'Pacote'},
    {key: 'quantidade_prospecto', label: 'Qtd Prospectos'},
    {key: 'pacote_data_criacao', label: 'Data Criação'},
    {key: 'acao_data_final', label: 'Data Fim'},
    {key: 'status', label: 'Status'},
    {key: 'direcionamento', label: 'Direcionamento'},
];

interface FiltroPacoteItem {
    id: number;
    rotulo: string;
}
interface FiltroAcaoItem {
    id: number;
    descricao: string;
}
interface FiltroLigacaoItem {
    id: number;
    rotulo: string;
    tipo_filtro: number;
}
interface ProspectoItem {
    id: number;
    nome: string;
    prospectoCampos: { campo: { rotulo: string }; valor: string }[];
}
interface UsuarioItem {
    id: number;
    login: string;
}
interface LigacaoPieData {
    label: string;
    value: number;
}

export default function ViewOperacionalListOperacionalListScreen() {
    const [verFiltrosOpen, setVerFiltrosOpen] = useState(false);
    const [verLigacoesOpen, setVerLigacoesOpen] = useState(false);
    const [dialogProspectosOpen, setDialogProspectosOpen] = useState(false);
    const [confirmRemoverOpen, setConfirmRemoverOpen] = useState(false);
    const [selectedOperacional, setSelectedOperacional] = useState<ApiItem | null>(null);
    const [filtroPacotes, setFiltroPacotes] = useState<FiltroPacoteItem[]>([]);
    const [filtrosAcao, setFiltrosAcao] = useState<FiltroAcaoItem[]>([]);
    const [filtrosLigacao, setFiltrosLigacao] = useState<FiltroLigacaoItem[]>([]);
    const [prospectos, setProspectos] = useState<ProspectoItem[]>([]);
    const [ligacaoUsuarios, setLigacaoUsuarios] = useState<UsuarioItem[]>([]);
    const [ligacaoUsuarioSelecionado, setLigacaoUsuarioSelecionado] = useState<number | null>(null);
    const [pieData, setPieData] = useState<LigacaoPieData[]>([]);
    const [pieTitle, setPieTitle] = useState('Ligações de Todos Operadores');
    const [loading, setLoading] = useState(false);

    const openVerFiltros = useCallback(async (item: ApiItem) => {
        setSelectedOperacional(item);
        setLoading(true);
        try {
            const [fp, fa, fl] = await Promise.all([
                api.get<FiltroPacoteItem[]>(`/api/central/operacional/${item.id}/filtros/pacotes`),
                api.get<FiltroAcaoItem[]>(`/api/central/operacional/${item.id}/filtros/acoes`),
                api.get<FiltroLigacaoItem[]>(`/api/central/operacional/${item.id}/filtros/ligacoes`),
            ]);
            setFiltroPacotes(fp.data ?? []);
            setFiltrosAcao(fa.data ?? []);
            setFiltrosLigacao(fl.data ?? []);
        } catch (e) {
            console.error('Erro ao buscar filtros', e);
        } finally {
            setLoading(false);
            setVerFiltrosOpen(true);
        }
    }, []);

    const openVerLigacoes = useCallback(async (item: ApiItem) => {
        setSelectedOperacional(item);
        setLoading(true);
        try {
            const [users, pie] = await Promise.all([
                api.get<UsuarioItem[]>(`/api/central/operacional/${item.id}/usuarios`),
                api.get<LigacaoPieData[]>(`/api/central/operacional/${item.id}/ligacoes/pie`),
            ]);
            setLigacaoUsuarios(users.data ?? []);
            setPieData(pie.data ?? []);
            setPieTitle('Ligações de Todos Operadores');
            setLigacaoUsuarioSelecionado(null);
        } catch (e) {
            console.error('Erro ao buscar ligações', e);
        } finally {
            setLoading(false);
            setVerLigacoesOpen(true);
        }
    }, []);

    const onLigacaoUsuarioChange = useCallback(async (usuarioId: number | null) => {
        if (!selectedOperacional) return;
        setLigacaoUsuarioSelecionado(usuarioId);
        setLoading(true);
        try {
            if (usuarioId) {
                const pie = await api.get<LigacaoPieData[]>(`/api/central/operacional/${selectedOperacional.id}/ligacoes/pie?usuarioId=${usuarioId}`);
                setPieData(pie.data ?? []);
                const user = ligacaoUsuarios.find(u => u.id === usuarioId);
                setPieTitle(user ? `Ligações do(a): ${user.login}` : 'Ligações de Todos Operadores');
            } else {
                const pie = await api.get<LigacaoPieData[]>(`/api/central/operacional/${selectedOperacional.id}/ligacoes/pie`);
                setPieData(pie.data ?? []);
                setPieTitle('Ligações de Todos Operadores');
            }
        } catch (e) {
            console.error('Erro ao buscar ligações por usuário', e);
        } finally {
            setLoading(false);
        }
    }, [selectedOperacional, ligacaoUsuarios]);

    const openDialogProspectos = useCallback(async (item: ApiItem) => {
        setSelectedOperacional(item);
        setLoading(true);
        try {
            const resp = await api.get<ProspectoItem[]>(`/api/central/operacional/${item.id}/prospectos`);
            setProspectos(resp.data ?? []);
        } catch (e) {
            console.error('Erro ao buscar prospectos', e);
        } finally {
            setLoading(false);
            setDialogProspectosOpen(true);
        }
    }, []);

    const openConfirmRemover = useCallback((item: ApiItem) => {
        setSelectedOperacional(item);
        setConfirmRemoverOpen(true);
    }, []);

    const handleRemoverProspectos = useCallback(async () => {
        if (!selectedOperacional) return;
        setLoading(true);
        try {
            await api.post(`/api/central/operacional/${selectedOperacional.id}/remover-prospectos`, {});
            setConfirmRemoverOpen(false);
            // The DataTable will refetch automatically via query invalidation
        } catch (e) {
            console.error('Erro ao remover prospectos', e);
        } finally {
            setLoading(false);
        }
    }, [selectedOperacional]);

    const rowActions: DataTableRowAction[] = [
        {
            key: 'verFiltros',
            title: 'Ver Filtros',
            className: 'btnpurple',
            icon: '🔍',
            onClick: openVerFiltros,
        },
        {
            key: 'verLigacoes',
            title: 'Resultados Prospectos',
            className: 'btnblue',
            icon: '📊',
            onClick: openVerLigacoes,
        },
        {
            key: 'verProspectos',
            title: 'Prospectos Filtrados',
            className: 'btnorange',
            icon: '👥',
            onClick: openDialogProspectos,
        },
        {
            key: 'removerProspectos',
            title: 'Prospectos sem Ligação',
            className: 'btnblack',
            icon: '🗑️',
            onClick: openConfirmRemover,
        },
    ];

    const tipoFiltroLabels: Record<number, string> = {
        1: 'Resultado ligação',
        2: 'Quantidade ligação',
        3: 'Estar no período ligação',
        4: 'Somente no período ligação',
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Operacional</h1>
                <DataTable
                    path="/api/view/operacional/listOperacional"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    extraRowActions={rowActions}
                />

                {/* Modal Ver Filtros */}
                <Modal open={verFiltrosOpen} onClose={() => setVerFiltrosOpen(false)} title="Filtros" size="large">
                    {loading && <p style={{textAlign: 'center', padding: '20px'}}>Carregando...</p>}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'}}>
                        <div>
                            <h4>Filtro Campo</h4>
                            <table className="data-table" style={{width: '100%', fontSize: '12px'}}>
                                <thead><tr><th>Rótulo</th></tr></thead>
                                <tbody>
                                    {filtroPacotes.map(f => (
                                        <tr key={f.id}><td>{f.rotulo}</td></tr>
                                    ))}
                                    {filtroPacotes.length === 0 && <tr><td colSpan={1}>Nenhum registro</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h4>Filtro Ação</h4>
                            <table className="data-table" style={{width: '100%', fontSize: '12px'}}>
                                <thead><tr><th>Ação</th></tr></thead>
                                <tbody>
                                    {filtrosAcao.map(f => (
                                        <tr key={f.id}><td>{f.descricao}</td></tr>
                                    ))}
                                    {filtrosAcao.length === 0 && <tr><td colSpan={1}>Nenhum registro</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <h4>Filtro Ligação</h4>
                            <table className="data-table" style={{width: '100%', fontSize: '12px'}}>
                                <thead><tr><th>Tipo Filtro</th><th>Rótulo</th></tr></thead>
                                <tbody>
                                    {filtrosLigacao.map(f => (
                                        <tr key={f.id}>
                                            <td>{tipoFiltroLabels[f.tipo_filtro] ?? `Tipo ${f.tipo_filtro}`}</td>
                                            <td>{f.rotulo}</td>
                                        </tr>
                                    ))}
                                    {filtrosLigacao.length === 0 && <tr><td colSpan={2}>Nenhum registro</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Modal>

                {/* Modal Ver Ligações / Pie Chart */}
                <Modal open={verLigacoesOpen} onClose={() => setVerLigacoesOpen(false)} title="Resultados Prospectos" size="large">
                    {loading && <p style={{textAlign: 'center', padding: '20px'}}>Carregando...</p>}
                    <div style={{textAlign: 'center'}}>
                        <button
                            className="btnyellow"
                            style={{marginBottom: '16px'}}
                            onClick={() => onLigacaoUsuarioChange(null)}
                        >
                            Todos os operadores
                        </button>
                        <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap'}}>
                            <label style={{fontWeight: 'bold'}}>Operadores:</label>
                            <select
                                className="form-input form-select"
                                value={ligacaoUsuarioSelecionado ?? ''}
                                onChange={e => onLigacaoUsuarioChange(e.target.value ? Number(e.target.value) : null)}
                                style={{minWidth: '200px'}}
                            >
                                <option value="">-- Selecione --</option>
                                {ligacaoUsuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.login}</option>
                                ))}
                            </select>
                        </div>
                        <h3>{pieTitle}</h3>
                        {pieData.length > 0 ? (
                            <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px'}}>
                                {pieData.map((slice, idx) => (
                                    <div key={idx} style={{
                                        background: `hsl(${(idx * 360 / pieData.length)}deg 70% 50%)`,
                                        color: '#fff',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {slice.label}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{color: '#666', marginTop: '20px'}}>Nenhum dado de ligação encontrado.</p>
                        )}
                    </div>
                </Modal>

                {/* Modal Prospectos Filtrados */}
                <Modal open={dialogProspectosOpen} onClose={() => setDialogProspectosOpen(false)} title="Prospectos Filtrados" size="full">
                    {loading && <p style={{textAlign: 'center', padding: '20px'}}>Carregando...</p>}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px'}}>
                        {prospectos.map(pros => (
                            <div key={pros.id} style={{border: '1px solid #ddd', borderRadius: '8px', padding: '12px', background: '#fff'}}>
                                <h4 style={{margin: '0 0 8px', fontSize: '14px', color: '#333'}}>{pros.nome}</h4>
                                <table style={{width: '100%', fontSize: '12px', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{background: '#f5f5f5'}}>
                                            <th style={{textAlign: 'left', padding: '4px'}}>Campo</th>
                                            <th style={{textAlign: 'left', padding: '4px'}}>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pros.prospectoCampos.map((pc, idx) => (
                                            <tr key={idx}>
                                                <td style={{padding: '4px', borderBottom: '1px solid #eee'}}>{pc.campo.rotulo}</td>
                                                <td style={{padding: '4px', borderBottom: '1px solid #eee'}}>{pc.valor}</td>
                                            </tr>
                                        ))}
                                        {pros.prospectoCampos.length === 0 && (
                                            <tr><td colSpan={2} style={{padding: '8px', textAlign: 'center', color: '#999'}}>Sem campos</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        {prospectos.length === 0 && (
                            <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#999', padding: '40px'}}>
                                Nenhum prospecto encontrado.
                            </div>
                        )}
                    </div>
                </Modal>

                {/* Modal Confirm Remover Prospectos */}
                <Modal open={confirmRemoverOpen} onClose={() => setConfirmRemoverOpen(false)} title="Atenção!" size="small">
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                        <div style={{fontSize: '32px', color: '#C90000'}}>⚠️</div>
                        <div>
                            <strong>Confirma a remoção dos prospectos do pacote?</strong>
                            <p style={{margin: '8px 0 0', color: '#666', fontSize: '13px'}}>
                                Esta ação definirá o status do operacional como CONCLUÍDO e removerá os prospectos associados.
                            </p>
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                        <button className="btnblue" onClick={() => setConfirmRemoverOpen(false)} disabled={loading}>
                            Não
                        </button>
                        <button className="btnred" onClick={handleRemoverProspectos} disabled={loading}>
                            {loading ? 'Removendo...' : 'Sim'}
                        </button>
                    </div>
                </Modal>
            </main>
        </PermissionGate>
    );
}