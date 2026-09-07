import {useQuery} from '@tanstack/react-query';
import {api} from '../../shared/services/api';
import {PermissionGate, useCurrentOutcome} from '../../shared/services/permissions';
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
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COBRANCA_COLUMNS: DataTableColumn[] = [
    {key: 'contrato', label: 'Contrato'},
    {key: 'unidade', label: 'Unidade'},
    {key: 'unidaderesponsavel', label: 'Unidade Responsável'},
    {key: 'aluno', label: 'Aluno'},
    {key: 'responsavel', label: 'Contratante'},
    {key: 'curso', label: 'Curso'},
    {key: 'pendente', label: 'Pendente'},
    {key: 'atrasada', label: 'Atrasado'},
    {key: 'valor', label: 'Valor', render: (item) => `R$ ${asRecord(item).valor}`},
    {key: 'campoDetalhes', label: 'Detalhes'},
];

const extraRowActions: DataTableRowAction[] = [
    {
        key: 'detalhes',
        title: 'Detalhes',
        icon: <i className="fa fa-info-circle"/>,
        permission: 'READ',
        onClick: async (item) => {
            await executeAction('ligacao-cobranca', 'carregarDetalhes', JSON.stringify({contrato: asRecord(item).contrato}), 'financeiro');
        },
    },
    {
        key: 'ligacao',
        title: 'Ligação',
        icon: <i className="fa fa-phone"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            await executeAction('ligacao-cobranca', 'iniciarLigacao', JSON.stringify({cobranca: asRecord(item).cobranca, contrato: asRecord(item).contrato}), 'financeiro');
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
    const routeOutcome = useCurrentOutcome();

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Ligação Cobrança</h1>
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
