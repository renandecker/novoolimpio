import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descricao' },
];

export default function ViewFuncaoListFuncaoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Funcao</h1>
        <DataTable
          path="/api/view/funcao/listFuncao"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}
