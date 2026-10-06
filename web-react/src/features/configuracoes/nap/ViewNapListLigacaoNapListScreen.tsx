import {useQuery} from '@tanstack/react-query';
import {api} from '../../../shared/services/api';
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../../shared/components/DataTable';
import {Tabs} from '../../../shared/components/Tabs';
import type {ApiItem} from '../../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;

interface EtapaNap {
    id: number;
    descricao: string;
}

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatNota = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
};

const NAP_COLUMNS: DataTableColumn[] = [
    {key: 'contratoId', label: 'Contrato'},
    {key: 'telefone', label: 'Telefone'},
    {key: 'dataInicial', label: 'Início', render: (item) => formatDate(asRecord(item).dataInicial)},
    {key: 'dataFinal', label: 'Fim', render: (item) => formatDate(asRecord(item).dataFinal)},
    {key: 'resultadoLigacaoNapId', label: 'Resultado'},
    {key: 'qtdeAula', label: 'Qtd. Aulas'},
    {key: 'qtdeAulaFeita', label: 'Aulas Feitas'},
    {key: 'qtdeAulaPresente', label: 'Presentes'},
    {key: 'qtdeFalta', label: 'Faltas'},
    {key: 'mediaNota', label: 'Média', render: (item) => formatNota(asRecord(item).mediaNota)},
    {key: 'observacao', label: 'Observação'},
    {key: 'ativo', label: 'Ativo'},
];

const extraRowActions: DataTableRowAction[] = [
    {
        key: 'detalhes',
        title: 'Detalhes',
        icon: <i className="fa fa-info-circle"/>,
        permission: 'READ',
        onClick: async (item) => {
            const r = asRecord(item);
            await api.post('/api/educacao/ligacao-nap/carregar-detalhes', {contrato: r.contratoId ?? r.contrato});
        },
    },
    {
        key: 'ligacao',
        title: 'Ligação',
        icon: <i className="fa fa-phone"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            const r = asRecord(item);
            await api.post('/api/educacao/nap/lote/ligacao', {nap: r.id ?? r.nap, contrato: r.contratoId ?? r.contrato});
        },
    },
    {
        key: 'email',
        title: 'E-mail',
        icon: <i className="fa fa-envelope"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            const r = asRecord(item);
            await api.post('/api/educacao/nap/lote/email', {id: r.id});
        },
    },
];

export default function ViewNapListLigacaoNapListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-nap'],
        queryFn: async () => (await api.get<EtapaNap[]>('/api/educacao/etapas-nap')).data,
    });
    const etapas = etapasQuery.data ?? [];

    return (
        <PermissionGate permission="READ">
            <main>
                {etapasQuery.isLoading && etapas.length === 0 ? (
                    <p>Carregando etapas...</p>
                ) : (
                    <Tabs
                        tabs={etapas.map((etapa) => ({
                            key: String(etapa.id),
                            label: etapa.descricao || `Etapa ${etapa.id}`,
                            content: (
                                <DataTable
                                    path="/api/educacao/ligacao-nap"
                                    params={{etapasNapId: etapa.id}}
                                    columns={NAP_COLUMNS}
                                    maxMainColumns={NAP_COLUMNS.length}
                                    extraRowActions={extraRowActions}
                                    outcome="view/nap/listLigacaoNap/actions"
                                    module="educacao"
                                    hideCreate={true}
                                    hideUpdate={true}
                                    hideDelete={true}
                                    hideView={true}
                                />
                            ),
                        }))}
                    />
                )}
                {etapasQuery.isError && <p>Erro ao carregar as etapas.</p>}
            </main>
        </PermissionGate>
    );
}
