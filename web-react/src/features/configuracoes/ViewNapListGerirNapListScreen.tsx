import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';

const COLUMNS: DataTableColumn[] = [
    {key: 'etapas_nap_descricao', label: 'Etapa NAP'},
    {key: 'qtde_email', label: 'Emails Enviados'},
    {key: 'qtde_ligacao', label: 'LigaÃ§Ãµes Realizadas'},
];

export default function ViewNapListGerirNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Gerir Nap</h1>
                <DataTable path="/api/view/nap/listGerirNap" columns={COLUMNS} maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
