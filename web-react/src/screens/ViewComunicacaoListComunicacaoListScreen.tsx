import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'titulo', label: 'Titulo' },
];

export default function ViewComunicacaoListComunicacaoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Comunicacao</h1>
        <DataTable
          path="/api/view/comunicacao/listComunicacao"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}
