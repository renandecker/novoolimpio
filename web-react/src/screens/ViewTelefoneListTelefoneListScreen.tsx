import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Número' },
  { key: 'token', label: 'Token' },
  { key: 'operadora', label: 'Operadora' },
  { key: 'tipo_telefone_descricao', label: 'Tipo' },
];

export default function ViewTelefoneListTelefoneListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Telefone</h1>
        <DataTable path="/api/view/telefone/listTelefone" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
