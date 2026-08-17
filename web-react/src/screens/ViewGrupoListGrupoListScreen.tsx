import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'curriculo_descricao', label: 'Curso' },
];

export default function ViewGrupoListGrupoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Grupo</h1>
        <DataTable path="/api/view/grupo/listGrupo" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
