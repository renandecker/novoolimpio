import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'login', label: 'Login' },
  { key: 'fl_ativo', label: 'Ativo', render: (item) => (asRecord(item).fl_ativo ? 'Sim' : 'Não') },
  { key: 'pessoa_descricao', label: 'Nome' },
  { key: 'hierarquia', label: 'Hierarquia' },
];

export default function ViewUsuarioListUsuarioListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Usuario</h1>
        <DataTable path="/api/view/usuario/listUsuario" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
