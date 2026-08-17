import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'qtd_parcelas', label: 'Quantidade de Parcelas' },
];

export default function ViewBandeiraListBandeiraListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Bandeira</h1>
        <DataTable path="/api/view/bandeira/listBandeira" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
