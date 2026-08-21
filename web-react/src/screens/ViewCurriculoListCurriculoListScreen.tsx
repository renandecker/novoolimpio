import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Currículo'},
    {key: 'curso', label: 'Curso'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'tipoCurso', label: 'Tipo Curso'},
    {
        key: 'dataCancelamento',
        label: 'Data Cancelamento',
        render: (item) => formatDate(asRecord(item).dataCancelamento)
    },
];

export default function ViewCurriculoListCurriculoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Curriculo</h1>
                <DataTable path="/api/educacao/curriculo" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
