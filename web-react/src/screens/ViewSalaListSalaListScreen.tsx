import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Número' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'tipo_sala_descricao', label: 'Tipo de Sala' },
  { key: 'qtd_alunos', label: 'Quantidade de Alunos' },
];

export default function ViewSalaListSalaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Sala</h1>
        <DataTable path="/api/view/sala/listSala" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
