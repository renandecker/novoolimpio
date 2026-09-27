import {PermissionGate} from '../../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'titulo', label: 'Título'},
    {key: 'autores', label: 'Autor(es)'},
    {key: 'isbn', label: 'ISBN'},
    {key: 'editora', label: 'Editora'},
    {key: 'anoPublicacao', label: 'Ano'},
    {key: 'categoria', label: 'Categoria'},
    {key: 'statusDisplay', label: 'Status'},
];

export default function ViewObraListObraListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Obras / Títulos</h1>
                <DataTable path="/api/biblioteca/obra" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}