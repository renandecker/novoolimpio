import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'qtde_tempo', label: 'Tempo pausa (segundos)' },
];

export default function ViewTipoPausaListTipoPausaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Tipo Pausa</h1>
        <DataTable path="/api/view/tipoPausa/listTipoPausa" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
