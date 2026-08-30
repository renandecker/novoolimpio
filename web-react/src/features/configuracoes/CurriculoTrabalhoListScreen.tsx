import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';

export default function CurriculoTrabalhoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>CurrÃ­culos de Trabalho</h1>
                <DataTable
                    path="/api/curriculo/curriculo-trabalho"
                    module="curriculo"
                    columns={[
                        {key: 'id_pessoa', label: 'Pessoa'},
                        {key: 'dt_inicio', label: 'Data InÃ­cio'},
                        {key: 'dt_fim', label: 'Data Fim'},
                        {key: 'fl_ativo', label: 'Ativo'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
