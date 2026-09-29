import {PermissionGate} from '../../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'suportaLti', label: 'LTI'},
    {key: 'suportaSso', label: 'SSO'},
    {key: 'publicoAlvo', label: 'Público-Alvo'},
    {key: 'areaConhecimento', label: 'Áreas'},
    {key: 'statusDisplay', label: 'Status'},
];

export default function ViewProvedorListProvedorListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Provedores Digitais</h1>
                <DataTable path="/api/biblioteca-virtual/provedor" module="biblioteca-virtual" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
            </main>
        </PermissionGate>
    );
}