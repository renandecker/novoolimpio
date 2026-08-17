import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descricao' },
  { key: 'tipo_atividade_descricao', label: 'Tipo de Atividade' },
  { key: 'carga_horaria', label: 'Carga Horaria' },
];

export default function ViewAtividadeComplementarListAtividadeComplementarListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Atividade Complementar</h1>
        <DataTable
          path="/api/view/atividadeComplementar/listAtividadeComplementar"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}
