import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {key: 'qtde_email', label: 'Emails Enviados'},
    {key: 'qtde_ligacao', label: 'Ligações Realizadas'},
    {key: 'valor', label: 'Valor'},
];

export default function ViewCobrancaListGerirCobrancaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Gerir Cobranca</h1>
                <DataTable path="/api/view/cobranca/listGerirCobranca" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
