import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'qtde_email', label: 'Emails Enviados' },
  { key: 'qtde_ligacao', label: 'Ligações Realizadas' },
  { key: 'valor', label: 'Valor' },
];

export default function ViewCobrancaListGerirCobrancaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Gerir Cobranca</h1>
        <DataTable path="/api/view/cobranca/listGerirCobranca" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
