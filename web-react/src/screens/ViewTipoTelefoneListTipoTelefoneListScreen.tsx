import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
];

export default function ViewTipoTelefoneListTipoTelefoneListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Tipo Telefone</h1>
        <DataTable path="/api/view/tipoTelefone/listTipoTelefone" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
