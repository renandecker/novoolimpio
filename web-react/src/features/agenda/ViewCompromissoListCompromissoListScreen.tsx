import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/types.ts';
import {api} from '../../shared/services/api';
import {swalConfirm, appAlert} from '../../shared/components/swal';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const apiErrorMessage = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

const statusLabel = (item: ApiItem) => {
    const rec = asRecord(item);
    const cor = rec.status_compromisso_cor;
    const descricao = rec.status_compromisso_descricao;
    return cor ? <span className={`status-badge ${cor}`}>{String(descricao ?? '')}</span> : String(descricao ?? '');
};

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Compromisso'},
    {key: 'usuario_descricao', label: 'Usuário Agendou'},
    {key: 'atendente_descricao', label: 'Consultor'},
    {key: 'usuario_finalizou_descricao', label: 'Finalizou'},
    {key: 'descricao', label: 'Visitante'},
    {key: 'agenda_descricao', label: 'Agenda'},
    {key: 'tipo_agenda_descricao', label: 'Tipo Agenda'},
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
    {key: 'horario_hora', label: 'Horário'},
    {key: 'status_compromisso_descricao', label: 'Status', render: statusLabel},
];

interface StatusOption {
    id: number;
    descricao?: string;
}

interface Resultado{
    id: number;
    descricao: string;
}

export default function ViewCompromissoListCompromissoListScreen() {
    const navigate = useNavigate();
    const [observacaoItem, setObservacaoItem] = useState<ApiItem | null>(null);
    const [resultadosModal, setResultadosModal] = useState<{ item: ApiItem; list: Resultado[] } | null>(null);
    const [trocaStatusItem, setTrocaStatusItem] = useState<ApiItem | null>(null);
    const [statusSelecionado, setStatusSelecionado] = useState<string>('');
    const [proximoStatusItem, setProximoStatusItem] = useState<ApiItem | null>(null);
    const [proximoStatusObservacao, setProximoStatusObservacao] = useState('');
    const [saving, setSaving] = useState(false);
    const [loadingResultados, setLoadingResultados] = useState(false);

    const statusesQuery = useQuery({
        queryKey: ['status-compromisso-options'],
        queryFn: async () => (await api.get<StatusOption[]>('/api/view/statusCompromisso/listStatusCompromisso')).data,
    });
    const statusOptions = statusesQuery.data ?? [];

    const verResultados = async (item: ApiItem) => {
        setLoadingResultados(true);
        try {
            const res = await api.get<Resultado[]>(`/api/basico/compromisso/${item.id}/resultados`);
            setResultadosModal({item, list: res.data ?? []});
        } catch (error) {
            appAlert.error(apiErrorMessage(error), 'Erro ao carregar resultados');
        } finally {
            setLoadingResultados(false);
        }
    };

    const confirmarTrocaStatus = async () => {
        if (!trocaStatusItem) return;
        const statusId = Number(statusSelecionado);
        if (!statusId) {
            appAlert.warning('Selecione um status.');
            return;
        }
        setSaving(true);
        try {
            await api.put(`/api/basico/compromisso/${trocaStatusItem.id}/troca-status`, {statusId});
            appAlert.success(`Status do compromisso #${trocaStatusItem.id} alterado com sucesso.`);
            setTrocaStatusItem(null);
            setStatusSelecionado('');
        } catch (error) {
            appAlert.error(apiErrorMessage(error), 'Erro ao trocar status');
        } finally {
            setSaving(false);
        }
    };

    const confirmarProximoStatus = async () => {
        if (!proximoStatusItem) return;
        setSaving(true);
        try {
            await api.put(`/api/basico/compromisso/${proximoStatusItem.id}/proximo-status`, {
                observacao: proximoStatusObservacao.trim() || null,
            });
            appAlert.success(`Status do compromisso #${proximoStatusItem.id} alterado com sucesso.`);
            setProximoStatusItem(null);
            setProximoStatusObservacao('');
        } catch (error) {
            appAlert.error(apiErrorMessage(error), 'Erro ao alterar status');
        } finally {
            setSaving(false);
        }
    };

    const confirmarFechar = async (item: ApiItem) => {
        if (!await swalConfirm(`Deseja realmente fechar o compromisso #${item.id}?`, {
            title: 'Fechar Compromisso',
            confirmText: 'Fechar',
            danger: true,
        })) {
            return;
        }
        try {
            await api.put(`/api/basico/compromisso/${item.id}/fechar`, {});
            appAlert.success(`Compromisso #${item.id} fechado com sucesso.`);
        } catch (error) {
            appAlert.error(apiErrorMessage(error), 'Erro ao fechar compromisso');
        }
    };

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'observacao',
            title: 'Observação',
            className: 'btnstop',
            icon: <i className="fa fa-help"/>,
            visible: (item) => Boolean(asRecord(item).observacao),
            onClick: (item) => setObservacaoItem(item),
        },
        {
            key: 'resultados',
            title: 'Ver Resultados',
            className: 'btnblue',
            icon: <i className="fa fa-search"/>,
            visible: (item) => Boolean(asRecord(item).tem_resultados),
            onClick: (item) => verResultados(item),
        },
        {
            key: 'prospecto',
            title: 'Prospecto',
            className: 'btnblack',
            icon: <i className="fa fa-external-link"/>,
            visible: (item) => {
                const rec = asRecord(item);
                return rec.ativo !== false && rec.id_prospecto !== null && rec.id_prospecto !== undefined;
            },
            onClick: () => navigate('/view/prospecto/listProspecto'),
        },
        {
            key: 'trocaStatus',
            title: 'Troca Status',
            className: 'btnorange',
            icon: <i className="fa fa-exchange"/>,
            permission: 'CREATE',
            onClick: (item) => {
                setTrocaStatusItem(item);
                setStatusSelecionado('');
            },
        },
        {
            key: 'proximoStatus',
            title: 'Próximo Status',
            className: 'btngreen',
            icon: <i className="fa fa-forward"/>,
            permission: 'UPDATE',
            visible: (item) => asRecord(item).id_prox_status_compromisso !== null && asRecord(item).id_prox_status_compromisso !== undefined,
            onClick: (item) => {
                setProximoStatusItem(item);
                setProximoStatusObservacao('');
            },
        },
        {
            key: 'fechar',
            title: 'Fechar',
            className: 'btnblack',
            icon: <i className="fa fa-times"/>,
            permission: 'DELETE',
            visible: (item) => asRecord(item).ativo !== false,
            onClick: (item) => confirmarFechar(item),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Compromisso</h1>
                <DataTable
                    path="/api/view/compromisso/listCompromisso"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    hideCreate
                    hideUpdate
                    hideDelete
                    hideView
                    extraRowActions={extraRowActions}
                />

                {observacaoItem && (
                    <div className="modal-overlay" onClick={() => setObservacaoItem(null)}>
                        <div className="modal form-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
                            <div className="div_form">
                                <div className="form-title">Observação</div>
                                <p><strong>{String(asRecord(observacaoItem).descricao ?? '')}</strong></p>
                                <p>{String(asRecord(observacaoItem).observacao ?? '')}</p>
                                <div className="form-footer">
                                    <button className="btnblue" onClick={() => setObservacaoItem(null)}>Fechar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {resultadosModal && (
                    <div className="modal-overlay" onClick={() => setResultadosModal(null)}>
                        <div className="modal form-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
                            <div className="div_form">
                                <div className="form-title">Resultados do Compromisso #{resultadosModal.item.id}</div>
                                {loadingResultados ? (
                                    <p>Carregando...</p>
                                ) : resultadosModal.list.length === 0 ? (
                                    <p>Nenhum resultado vinculado.</p>
                                ) : (
                                    <ul>
                                        {resultadosModal.list.map((r) => (
                                            <li key={r.id}>{r.descricao}</li>
                                        ))}
                                    </ul>
                                )}
                                <div className="form-footer">
                                    <button className="btnblue" onClick={() => setResultadosModal(null)}>Fechar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {trocaStatusItem && (
                    <div className="modal-overlay" onClick={() => setTrocaStatusItem(null)}>
                        <div className="modal form-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
                            <div className="div_form">
                                <div className="form-title">Troca de Status - Compromisso #{trocaStatusItem.id}</div>
                                <div className="table_form">
                                    <label className="form-field">
                                        <span className="form-label">Novo Status</span>
                                        <select
                                            className="form-input form-select"
                                            value={statusSelecionado}
                                            onChange={(e) => setStatusSelecionado(e.target.value)}
                                            disabled={saving}
                                        >
                                            <option value="">-- Selecione --</option>
                                            {statusOptions.map((s) => (
                                                <option key={s.id} value={s.id}>{s.descricao ?? `#${s.id}`}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <div className="form-footer">
                                        <button type="button" className="btn-form-back btnyellow" onClick={() => setTrocaStatusItem(null)}>Cancelar</button>
                                        <button type="button" className="btnstop" onClick={confirmarTrocaStatus} disabled={saving}>Salvar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {proximoStatusItem && (
                    <div className="modal-overlay" onClick={() => setProximoStatusItem(null)}>
                        <div className="modal form-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
                            <div className="div_form">
                                <div className="form-title">Próximo Status - Compromisso #{proximoStatusItem.id}</div>
                                <div className="table_form">
                                    <p>
                                        Status atual: <strong>{String(asRecord(proximoStatusItem).status_compromisso_descricao ?? '')}</strong>
                                        <br/>
                                        Próximo status: <strong>{String(asRecord(proximoStatusItem).prox_status_compromisso_descricao ?? '')}</strong>
                                    </p>
                                    <label className="form-field">
                                        <span className="form-label">Observação</span>
                                        <textarea
                                            className="form-input"
                                            value={proximoStatusObservacao}
                                            onChange={(e) => setProximoStatusObservacao(e.target.value)}
                                            rows={4}
                                            disabled={saving}
                                        />
                                    </label>
                                    <div className="form-footer">
                                        <button type="button" className="btn-form-back btnyellow" onClick={() => setProximoStatusItem(null)}>Cancelar</button>
                                        <button type="button" className="btngreen" onClick={confirmarProximoStatus} disabled={saving}>Confirmar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}