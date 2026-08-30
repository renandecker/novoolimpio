import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {PermissionGate, useCurrentOutcome} from '../permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../DataTable';
import {Tabs} from '../Tabs';
import {executeAction} from '../actions';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

interface EtapaNap {
    id: number;
    descricao: string;
}

const NAP_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID da Ligação NAP'},
    {key: 'usuarioId', label: 'Usuário ligou'},
    {key: 'dataInicial', label: 'Data início'},
    {key: 'dataFinal', label: 'Data fim'},
    {key: 'compromissoId', label: 'Compromisso'},
    {key: 'resultadoLigacaoNapId', label: 'Resultado ligação NAP'},
    {key: 'telefone', label: 'Telefone'},
    {key: 'observacao', label: 'Observação'},
];

const extraRowActions: DataTableRowAction[] = [
    {
        key: 'detalhes',
        title: 'Detalhes',
        icon: <i className="fa fa-info-circle"/>,
        permission: 'READ',
        onClick: async (item) => {
            await executeAction('ligacao-nap', 'carregarDetalhes', JSON.stringify({contrato: asRecord(item).contrato}), 'educacao');
        },
    },
    {
        key: 'documento',
        title: 'Documento',
        icon: <i className="fa fa-file-text-o"/>,
        permission: 'READ',
        onClick: async (item) => {
            await executeAction('ligacao-nap', 'carregarContrato', JSON.stringify({contrato: asRecord(item).contrato}), 'educacao');
        },
    },
    {
        key: 'ligacao',
        title: 'Ligação',
        icon: <i className="fa fa-phone"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            await executeAction('ligacao-nap', 'iniciarLigacao', JSON.stringify({nap: asRecord(item).nap, contrato: asRecord(item).contrato}), 'educacao');
        },
    },
    {
        key: 'email',
        title: 'E-mail',
        icon: <i className="fa fa-envelope"/>,
        permission: 'EXECUTE',
        onClick: async (item) => {
            await executeAction('ligacao-nap', 'prepararEnvioEmail', JSON.stringify({id: asRecord(item).id}), 'educacao');
        },
    },
];

export default function ViewNapListLigacaoNapListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-nap'],
        queryFn: async () => (await api.get<EtapaNap[]>('/api/educacao/etapas-nap')).data,
    });
    const etapas = etapasQuery.data ?? [];
    const routeOutcome = useCurrentOutcome();

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Ligação NAP</h1>
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
