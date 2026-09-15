import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable} from '../../../shared/components/DataTable';



export default function CurriculoEmpresaUnidadeListScreen() {

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Unidades de Empresa</h1>

                <DataTable

                    path="/api/curriculo/empresa-unidade"

                    module="curriculo"

                    columns={[

                        {key: 'id_empresa', label: 'Empresa'},

                        {key: 'id_unidade', label: 'Unidade'},

                        {key: 'inicio', label: 'Início'},

                        {key: 'fim', label: 'Fim'},

                        {key: 'pre_autorizado', label: 'Pré-autorizado'},

                        {key: 'id_tipo_contrato', label: 'Tipo Contrato'},

                    ]}

                />

            </main>

        </PermissionGate>

    );

}

