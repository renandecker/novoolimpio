import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../shared/components/DataTable';
import {Tabs} from '../../shared/components/Tabs';
import type {ApiItem} from '../../shared/types/index';
import {executeAction} from '../../shared/services/actions';

interface EtapaCobranca {
    id: number;
    descricao: string;
}

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatValor = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

const COBRANCA_COLUMNS: DataTableColumn[] = [
    {key: 'contratoId', label: 'Contrato'},
    {key: 'telefone', label: 'Telefone'},
    {key: 'dataInicial', label: 'Início', render: (item) => formatDate(asRecord(item).dataInicial)},
    {key: 'dataFinal', label: 'Fim', render: (item) => formatDate(asRecord(item).dataFinal)},
    {key: 'resultadoCobrancaId', label: 'Resultado'},
    {key: 'qtdeParcela', label: 'Qtd. Parcelas'},
    {key: 'valor', label: 'Valor', render: (item) => formatValor(asRecord(item).valor)},
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
            await executeAction('ligacao-cobranca', 'carregarDetalhes', JSON.stringify({contrato: r.contratoId ?? r.contrato}), 'financeiro');
        },
    },
    {
        key: 'ligacao',
        title: 'Ligação',
        icon: <i className="fa fa-phone"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            const r = asRecord(item);
            await executeAction('ligacao-cobranca', 'iniciarLigacao', JSON.stringify({cobranca: r.id ?? r.cobranca, contrato: r.contratoId ?? r.contrato}), 'financeiro');
        },
    },
    {
        key: 'email',
        title: 'E-mail',
        icon: <i className="fa fa-envelope"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            await executeAction('ligacao-cobranca', 'prepararEnvioEmail', JSON.stringify({id: asRecord(item).id}), 'financeiro');
        },
    },
];

export default function ViewCobrancaListLigacaoCobrancaListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-cobranca'],
        queryFn: async () => (await api.get<EtapaCobranca[]>('/api/financeiro/etapas-cobranca')).data,
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
                                     path="/api/financeiro/ligacao-cobranca"
                                     params={{etapasCobrancaId: etapa.id}}
                                     columns={COBRANCA_COLUMNS}
                                     maxMainColumns={COBRANCA_COLUMNS.length}
                                     extraRowActions={extraRowActions}
                                     outcome="view/cobranca/listLigacaoCobranca/actions"
                                     module="financeiro"
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
