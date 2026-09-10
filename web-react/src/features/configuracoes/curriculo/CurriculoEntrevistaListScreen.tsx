import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';

export default function CurriculoEntrevistaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Entrevistas</h1>
                <DataTable
                    path="/api/curriculo/entrevista"
                    module="curriculo"
                    columns={[
                        {key: 'id_usuario', label: 'Usuário'},
                        {key: 'id_vaga', label: 'Vaga'},
                        {key: 'id_empresa', label: 'Empresa'},
                        {key: 'token', label: 'Token'},
                        {key: 'data_final', label: 'Data Final'},
                        {key: 'fl_resposta', label: 'Resposta'},
                        {key: 'data_aceite_aluno', label: 'Aceite Aluno'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
