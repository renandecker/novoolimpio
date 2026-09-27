import {PermissionGate} from '../../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'codigoBarras', label: 'Código de Barras'},
    {key: 'tombo', label: 'Tombo'},
    {key: 'obra.titulo', label: 'Obra'},
    {key: 'quantidade', label: 'Quantidade'},
    {key: 'status', label: 'Status'},
    {key: 'localizacao', label: 'Localização'},
    {key: 'condicaoFisica', label: 'Condição'},
];

export default function ViewExemplarListExemplarListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Exemplares</h1>
                <DataTable path="/api/biblioteca/exemplar" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}