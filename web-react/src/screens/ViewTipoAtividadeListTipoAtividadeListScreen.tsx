import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'carga_horaria_minima', label: 'Carga Horária Mínima' },
  { key: 'carga_horaria_maxima', label: 'Carga Horária Máxima' },
];

export default function ViewTipoAtividadeListTipoAtividadeListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Tipo Atividade</h1>
        <DataTable path="/api/view/tipoAtividade/listTipoAtividade" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
