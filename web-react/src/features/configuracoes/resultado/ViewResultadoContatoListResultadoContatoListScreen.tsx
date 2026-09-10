import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable} from '../../../shared/components/DataTable';



export default function ViewResultadoContatoListResultadoContatoListScreen() {

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Resultado Contato</h1>

                <DataTable

                    path="/api/central/resultado-contato"

                    module="central"

                    columns={[

                        {key: 'id', label: 'ID'},

                        {key: 'descricao', label: 'Descrição'},

                        {key: 'nota', label: 'Nota'},

                        {key: 'qtdeRetorno', label: 'Qtde Retorno'},

                        {

                            key: 'tela',

                            label: 'Tela',

                            options: [

                                {value: '0', label: 'Nenhum'},

                                {value: '1', label: 'Compromisso'},

                                {value: '2', label: 'Retorno'},

                            ],

                            render: (item) => {

                                const val = Number((item as any).tela);

                                if (val === 1) return 'Compromisso';

                                if (val === 2) return 'Retorno';

                                return 'Nenhum';

                            }

                        },

                        {key: 'voltar', label: 'Voltar prospecto', render: (item) => (item as any).voltar ? 'Sim' : 'Não'},

                        {key: 'relato', label: 'Relatar', render: (item) => (item as any).relato ? 'Sim' : 'Não'},

                        {key: 'visivel', label: 'Visível selecionar', render: (item) => (item as any).visivel ? 'Sim' : 'Não'},

                        {key: 'outro', label: 'Outro operador', render: (item) => (item as any).outro ? 'Sim' : 'Não'},

                    ]}

                />

            </main>

        </PermissionGate>

    );

}

