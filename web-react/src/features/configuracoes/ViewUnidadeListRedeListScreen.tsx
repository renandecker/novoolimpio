import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'usuario_descricao', label: 'Login'},
    {key: 'razao_social', label: 'RazÃ£o Social'},
    {key: 'nome_fantasia', label: 'Nome Fantasia'},
    {key: 'cnpj', label: 'CNPJ'},
];

export default function ViewUnidadeListRedeListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Rede</h1>
                <DataTable path="/api/view/unidade/listRede" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
