import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'estado_descricao', label: 'Estado'},
    {key: 'praca', label: 'Praça'},
    {key: 'area', label: 'Área'},
    {key: 'cod_ibge', label: 'IBGE'},
];

export default function ViewCidadeListCidadeListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cidade</h1>
                <DataTable path="/api/view/cidade/listCidade" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
