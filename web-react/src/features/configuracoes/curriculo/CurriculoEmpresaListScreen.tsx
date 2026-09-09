import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function CurriculoEmpresaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Empresas</h1>
                <DataTable
                    path="/api/curriculo/empresa"
                    module="curriculo"
                    columns={[
                        {key: 'id_pessoa', label: 'Pessoa'},
                        {key: 'dt_inicio', label: 'Data Início'},
                        {key: 'dt_fim', label: 'Data Fim'},
                        {key: 'fl_ativo', label: 'Ativo'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
