import {useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';
import {api} from '../../shared/services/api';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Id'},
    {key: 'nome', label: 'Nome'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'nota', label: 'Nota'},
    {
        key: 'data_cadastramento',
        label: 'Data Cadastro',
        render: (item) => formatDate(asRecord(item).data_cadastramento)
    },
    {key: 'data_alteracao', label: 'Data AlteraÃ§Ã£o', render: (item) => formatDate(asRecord(item).data_alteracao)},
];

export default function ViewProspectoListProspectoListScreen() {
    const [historicoLigacaoModal, setHistoricoLigacaoModal] = useState<{ prospectoName: string; list: any[] } | null>(null);
    const [quantidadeLigacaoModal, setQuantidadeLigacaoModal] = useState<{ prospectoName: string; list: any[] } | null>(null);
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [linkList, setLinkList] = useState<any[]>([]);
    const [linkForm, setLinkForm] = useState({ acao: '', unidade: '', usuario: '' });

    const carregarHistoricoLigacao = async (item: ApiItem) => {
        try {
            const res = await api.get(`/api/comercial/prospecto-list/carregar-historico-ligacao?prospectoId=${item.id}`);
            setHistoricoLigacaoModal({ prospectoName: String(item.nome ?? ''), list: res.data ?? [] });
        } catch {
            setHistoricoLigacaoModal({ prospectoName: String(item.nome ?? ''), list: [] });
        }
    };

    const carregarQuantidadeLigacao = async (item: ApiItem) => {
        try {
            const res = await api.get(`/api/comercial/prospecto-list/carregar-quantidade-ligacao?prospectoId=${item.id}`);
            setQuantidadeLigacaoModal({ prospectoName: String(item.nome ?? ''), list: res.data ?? [] });
        } catch {
            setQuantidadeLigacaoModal({ prospectoName: String(item.nome ?? ''), list: [] });
        }
    };

    const abrirLinks = async () => {
        setLinkModalOpen(true);
        try {
            const res = await api.get('/api/comercial/prospecto-list/carregar-prospectos-link');
            setLinkList(res.data ?? []);
        } catch {
            setLinkList([]);
        }
    };

    const salvarLink = async () => {
        try {
            await api.post('/api/comercial/prospecto-list/salvar-prospecto-link', linkForm);
            const res = await api.get('/api/comercial/prospecto-list/carregar-prospectos-link');
            setLinkList(res.data ?? []);
            setLinkForm({ acao: '', unidade: '', usuario: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const extraActions: DataTableRowAction[] = [
        {
            key: 'historicoLigacao',
            title: 'HistÃ³rico LigaÃ§Ã£o',
            className: 'btnblue',
            icon: <i className="fa fa-star"/>,
            onClick: (item) => carregarHistoricoLigacao(item),
        },
        {
            key: 'quantidadeLigacao',
            title: 'Quantidade LigaÃ§Ã£o por Resultado',
            className: 'btnstop',
            icon: <i className="fa fa-phone"/>,
            onClick: (item) => carregarQuantidadeLigacao(item),
        },
        {
            key: 'inativarProspecto',
            title: 'Inativar Prospecto',
            className: 'btnblack',
            icon: <i className="fa fa-ban"/>,
            onClick: async (item) => {
                if (window.confirm('Ao desativar ele nÃ£o estarÃ¡ no radar e nas ligaÃ§Ãµes. Deseja continuar?')) {
                    await api.post(`/api/comercial/prospecto-list/inativar?id=${item.id}`);
                }
            },
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h1>Prospecto</h1>
                    <button className="btn-primary btnblack" onClick={abrirLinks}>
                        <i className="fa fa-link"/> Link
                    </button>
                </div>
                <DataTable
                    path="/api/view/prospecto/listProspecto"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    extraRowActions={extraActions}
                    editNavigateTo="/view/prospecto/editProspecto"
                    createNavigateTo="/view/prospecto/prospectoRadar"
                />

                {historicoLigacaoModal && (
                    <div className="modal-overlay" onClick={() => setHistoricoLigacaoModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{width: '600px'}}>
                            <h3>HistÃ³rico LigaÃ§Ãµes</h3>
                            <p><strong>{historicoLigacaoModal.prospectoName}</strong></p>
                            <table style={{width: '100%', marginTop: '10px'}}>
                                <thead>
                                <tr>
                                    <th>Operador</th>
                                    <th>Data Inicial</th>
                                    <th>Data Final</th>
                                    <th>Resultado</th>
                                </tr>
                                </thead>
                                <tbody>
                                {historicoLigacaoModal.list.length === 0 ? (
                                    <tr><td colSpan={4}>Nenhum registro</td></tr>
                                ) : (
                                    historicoLigacaoModal.list.map((h: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{h.operador}</td>
                                            <td>{h.dataInicial}</td>
                                            <td>{h.dataFinal}</td>
                                            <td>{h.resultado}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                            <div className="modal-actions" style={{marginTop: '16px'}}>
                                <button className="btnblue" onClick={() => setHistoricoLigacaoModal(null)}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

                {quantidadeLigacaoModal && (
                    <div className="modal-overlay" onClick={() => setQuantidadeLigacaoModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{width: '450px'}}>
                            <h3>Quantidade ligaÃ§Ã£o por resultado</h3>
                            <p><strong>{quantidadeLigacaoModal.prospectoName}</strong></p>
                            <table style={{width: '100%', marginTop: '10px'}}>
                                <thead>
                                <tr>
                                    <th>Resultado LigaÃ§Ã£o</th>
                                    <th>Quantidade</th>
                                </tr>
                                </thead>
                                <tbody>
                                {quantidadeLigacaoModal.list.length === 0 ? (
                                    <tr><td colSpan={2}>Nenhum registro</td></tr>
                                ) : (
                                    quantidadeLigacaoModal.list.map((q: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{q.resultado}</td>
                                            <td>{q.quantidade}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                            <div className="modal-actions" style={{marginTop: '16px'}}>
                                <button className="btnblue" onClick={() => setQuantidadeLigacaoModal(null)}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}

                {linkModalOpen && (
                    <div className="modal-overlay" onClick={() => setLinkModalOpen(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{width: '700px'}}>
                            <h3>Gerador de link para cadastro</h3>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px'}}>
                                <label>AÃ§Ã£o *<input type="text" value={linkForm.acao} onChange={e => setLinkForm({...linkForm, acao: e.target.value})} style={{width: '100%'}}/></label>
                                <label>Unidade *<input type="text" value={linkForm.unidade} onChange={e => setLinkForm({...linkForm, unidade: e.target.value})} style={{width: '100%'}}/></label>
                                <label>UsuÃ¡rio *<input type="text" value={linkForm.usuario} onChange={e => setLinkForm({...linkForm, usuario: e.target.value})} style={{width: '100%'}}/></label>
                            </div>
                            <button className="btnstop" onClick={salvarLink}>Selecionar</button>
                            <table style={{width: '100%', marginTop: '15px'}}>
                                <thead>
                                <tr>
                                    <th>AÃ§Ã£o</th>
                                    <th>Unidade</th>
                                    <th>UsuÃ¡rio</th>
                                    <th>Ativo</th>
                                </tr>
                                </thead>
                                <tbody>
                                {linkList.length === 0 ? (
                                    <tr><td colSpan={4}>Nenhum registro</td></tr>
                                ) : (
                                    linkList.map((l: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{l.acao}</td>
                                            <td>{l.unidade}</td>
                                            <td>{l.usuario}</td>
                                            <td>{l.ativo ? 'Sim' : 'NÃ£o'}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                            <div className="modal-actions" style={{marginTop: '16px'}}>
                                <button className="btnblue" onClick={() => setLinkModalOpen(false)}>Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}

