import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable} from '../../../shared/components/DataTable';



export default function CurriculoConfiguracaoListScreen() {

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Configuração do Currículo</h1>

                <DataTable

                    path="/api/curriculo/configuracao"

                    module="curriculo"

                    columns={[

                        {key: 'arquivo_curriculo', label: 'Arquivo Currículo'},

                        {key: 'sql_variavel', label: 'SQL Variável'},

                    ]}

                />

            </main>

        </PermissionGate>

    );

}

