import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable} from '../../../shared/components/DataTable';



export default function CurriculoCampoListScreen() {

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Campos de Currículo</h1>

                <DataTable

                    path="/api/curriculo/curriculo-campo"

                    module="curriculo"

                    columns={[

                        {key: 'id_campo', label: 'Campo'},

                        {key: 'obrigatorio', label: 'Obrigatório'},

                        {key: 'ordem', label: 'Ordem'},

                    ]}

                />

            </main>

        </PermissionGate>

    );

}

