import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {
        key: 'tipo',
        label: 'Periodicidade Carga',
        render: (item) => {
            const value = asRecord(item).tipo;
            if (value === 1) return 'DiÃ¡ria';
            if (value === 2) return 'Semanal';
            if (value === 3) return 'Mensal';
            return String(value ?? '');
        },
    },
];

export default function ViewCargaListCargaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Carga</h1>
                <DataTable path="/api/view/carga/listCarga" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
