import {useQuery} from '@tanstack/react-query';

import {api} from '../../shared/services/api';

import {PermissionGate, useCurrentOutcome} from '../../shared/services/permissions';

import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../shared/components/DataTable';

import {Tabs} from '../../shared/components/Tabs';

import {executeAction} from '../../shared/services/actions';

import type {ApiItem} from '../../features/auth/types';


const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;


interface EtapaNap {

    id: number;

    descricao: string;

}


const NAP_COLUMNS: DataTableColumn[] = [
    {key: 'contrato', label: 'Contrato'},
    {key: 'unidade', label: 'Unidade'},
    {key: 'unidaderesponsavel', label: 'Unidade Responsável'},
    {key: 'aluno', label: 'Aluno'},
    {key: 'responsavel', label: 'Contratante'},
    {key: 'curso', label: 'Curso'},
    {key: 'campoDetalhes', label: 'Detalhes'},
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